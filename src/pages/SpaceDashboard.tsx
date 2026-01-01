import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/Logo';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Clock, Car, Bike, Truck, 
  Users, MessageSquare, BarChart3, Wallet, 
  Maximize2, Download, X, QrCode,
  Zap, CloudRain, ShieldAlert, Activity, LayoutDashboard, Info, BrainCircuit, Cloud, Sun, CloudLightning, RotateCcw
} from 'lucide-react';
import { format, isSameDay, getHours, areIntervalsOverlapping, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";
import { ChatSheet } from '@/components/ChatSheet';
import { cn } from '@/lib/utils';

// --- IMPORT TENSORFLOW MODEL ---
import { trainModel, predictPrice } from '@/lib/mlmodel';

// --- FETCH 3-DAY HOURLY FORECAST (Open-Meteo) ---
const fetchForecast = async (lat: number = 13.0827, lng: number = 80.2707) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,rain,weather_code&forecast_days=3&timezone=auto`
    );
    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Weather API failed:", error);
    return null;
  }
};

// Helper to get Icon based on WMO Weather Code
const WeatherIcon = ({ code, className }: { code: number, className?: string }) => {
  if (code >= 95) return <CloudLightning className={className} />;
  if (code >= 61) return <CloudRain className={className} />;
  if (code >= 51) return <CloudRain className={className} />;
  if (code >= 1) return <Cloud className={className} />;
  return <Sun className={className} />;
};

export default function SpaceDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Data State
  const [space, setSpace] = useState<any>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- TIME MACHINE STATE ---
  const [forecast, setForecast] = useState<any>(null);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0=Today, 1=Tmr, 2=DayAfter
  const [selectedHour, setSelectedHour] = useState(new Date().getHours()); // 0 to 23
  
  // Computed Target Date
  const targetDate = useMemo(() => {
    const d = addDays(new Date(), selectedDayOffset);
    d.setHours(selectedHour, 0, 0, 0);
    return d;
  }, [selectedDayOffset, selectedHour]);

  // UI State
  const [viewMode, setViewMode] = useState<'ops' | 'pricing'>('ops');
  const [showQRModal, setShowQRModal] = useState(false);

  // Environment State (Specific to Selected Time)
  const [currentWeather, setCurrentWeather] = useState({ rainMM: 0, temp: 0, code: 0 });
  const [manualFloodMode, setManualFloodMode] = useState(false);
  const [isAutoFlood, setIsAutoFlood] = useState(false);

  // --- MACHINE LEARNING STATE ---
  const [mlReady, setMlReady] = useState(false);
  const [trainingLog, setTrainingLog] = useState("Initializing Neural Network...");
  const [prediction, setPrediction] = useState(1.0);

  // Occupancy State
  const [occupancy, setOccupancy] = useState({
    car: { total: 0, parked: 0, booked: 0 },
    bike: { total: 0, parked: 0, booked: 0 },
    suv: { total: 0, parked: 0, booked: 0 },
  });

  // 1. Initial Data Fetch & Weather Forecast
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data: spaceData, error } = await supabase.from('parking_spaces').select('*').eq('id', id).single();
      if (error) { navigate('/provider-dashboard'); return; }
      setSpace(spaceData);

      const lat = spaceData.latitude || 13.0827;
      const lng = spaceData.longitude || 80.2707;
      const wData = await fetchForecast(lat, lng);
      setForecast(wData);
      
      const { data: bookings } = await supabase.from('bookings').select(`*, profiles:driver_id(*), messages(*)`).eq('space_id', id).order('start_time', { ascending: false });
      if (bookings) setAllBookings(bookings);
      
      setLoading(false);
    };
    fetchData();
  }, [id, navigate]);

  // 2. Train ML Model on Mount
  useEffect(() => {
    const initML = async () => {
      await trainModel((log) => setTrainingLog(log));
      setMlReady(true);
    };
    initML();
  }, []);

  // 3. MAIN LOGIC: Time Selection + Weather Lookup + ML Prediction
  useEffect(() => {
    if (!space || !allBookings) return;

    // --- A. WEATHER LOOKUP FOR SELECTED TIME ---
    if (forecast && forecast.hourly) {
        const hourIndex = (selectedDayOffset * 24) + selectedHour;
        
        if (forecast.hourly.rain && forecast.hourly.rain[hourIndex] !== undefined) {
            const rain = forecast.hourly.rain[hourIndex];
            const temp = forecast.hourly.temperature_2m[hourIndex];
            const code = forecast.hourly.weather_code[hourIndex];
            
            setCurrentWeather({ rainMM: rain, temp: temp, code: code });
            
            // Auto Flood Logic
            const floodRisk = rain > 25 || [65, 67, 82, 95, 96, 99].includes(code);
            setIsAutoFlood(floodRisk);
        }
    }

    // --- B. BOOKING & OCCUPANCY CALCULATION ---
    const filterStart = targetDate;
    const filterEnd = new Date(targetDate);
    filterEnd.setHours(filterEnd.getHours() + 1); 

    const activeBookings = allBookings.filter((b: any) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return ['confirmed', 'parked'].includes(b.status) && areIntervalsOverlapping({ start, end }, { start: filterStart, end: filterEnd });
    });

    const getStats = (type: string) => {
      const subset = activeBookings.filter((b: any) => b.vehicle_type === type || (!b.vehicle_type && type === 'car'));
      return {
        parked: subset.filter((b: any) => b.status === 'parked').length,
        booked: subset.filter((b: any) => b.status === 'confirmed').length
      };
    };

    const carStats = getStats('car');
    setOccupancy({
      car: { total: space.slots_car || 0, ...carStats },
      bike: { total: space.slots_bike || 0, ...getStats('bike') },
      suv: { total: space.slots_suv || 0, ...getStats('suv') },
    });

    // --- C. ML PREDICTION ---
    if (mlReady) {
        const occupancyRate = (carStats.parked + carStats.booked) / (space.slots_car || 1);
        const isPeak = (selectedHour >= 8 && selectedHour <= 11) || (selectedHour >= 17 && selectedHour <= 20);
        const result = predictPrice(occupancyRate, isPeak, currentWeather.rainMM, isAutoFlood || manualFloodMode);
        setPrediction(result);
    }

  }, [space, allBookings, selectedDayOffset, selectedHour, forecast, mlReady, manualFloodMode, currentWeather.rainMM]);

  // Helpers
  const filteredHistory = useMemo(() => (allBookings.filter(b => isSameDay(new Date(b.start_time), targetDate))), [allBookings, targetDate]);
  const totalRevenue = useMemo(() => filteredHistory.reduce((sum, b) => sum + (b.total_price || 0), 0), [filteredHistory]);
  const getUnreadCount = (msgs: any[]) => (!msgs || !user) ? 0 : msgs.filter(m => m.sender_id !== user.id && !m.is_read).length;

  // --- NEW: Reset to Now Function ---
  const handleResetToNow = () => {
    const now = new Date();
    setSelectedDayOffset(0); // Today
    setSelectedHour(now.getHours()); // Current Hour
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("fullscreen-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))));
    img.onload = () => {
      canvas.width = img.width + 40; canvas.height = img.height + 40;
      if (ctx) { ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 20, 20);
        const a = document.createElement("a"); a.download = `GatePass.png`; a.href = canvas.toDataURL("image/png"); a.click();
      }
    };
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col relative font-sans text-slate-900 bg-slate-50">
      
      {/* --- HEADER: TIME MACHINE & WEATHER --- */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            {/* Left: Title & Selected Time Weather Info */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/provider-dashboard')}><ArrowLeft /></Button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
                        {space.title}
                    </h1>
                    {/* Live Weather Indicator for Selected Time */}
                    <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {format(targetDate, "EEE, MMM do @ h:00 a")}
                        </span>
                        <span className="text-slate-300">|</span>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <WeatherIcon code={currentWeather.code} className="w-4 h-4 text-blue-500" />
                            <span>{currentWeather.temp}°C</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-blue-600">{currentWeather.rainMM}mm Rain</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle: View Switcher */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 w-fit">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewMode('ops')}
                    className={cn("text-xs font-bold rounded-md px-4 transition-all", viewMode === 'ops' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900")}
                >
                    <LayoutDashboard size={14} className="mr-2" /> Operations
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewMode('pricing')}
                    className={cn("text-xs font-bold rounded-md px-4 transition-all", viewMode === 'pricing' ? "bg-indigo-600 shadow-sm text-white hover:bg-indigo-700" : "text-slate-500 hover:text-slate-900")}
                >
                    <BrainCircuit size={14} className="mr-2" /> ML Model
                </Button>
            </div>

            {/* Right: Time Machine Controls */}
            <div className="flex flex-col items-end gap-2 w-full xl:w-auto">
                {/* 1. Day Selector + Reset Button */}
                <div className="flex items-center gap-2 w-full xl:w-auto">
                    {/* NEW BUTTON: Reset to Now */}
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleResetToNow}
                        className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800"
                    >
                        <RotateCcw size={12} className="mr-1.5" /> Now
                    </Button>

                    <div className="flex bg-slate-100 p-1 rounded-lg flex-1">
                        {['Today', 'Tomorrow', 'Day After'].map((day, idx) => (
                            <button
                            key={day}
                            onClick={() => setSelectedDayOffset(idx)}
                            className={`flex-1 xl:flex-none px-4 py-1.5 text-[11px] uppercase font-bold tracking-wide rounded-md transition-all ${
                                selectedDayOffset === idx 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                            >
                            {day}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Horizontal Hour Scroll (FIXED: Increased padding and width) */}
                <div className="flex gap-2 overflow-x-auto w-full xl:max-w-[500px] p-2 scrollbar-hide">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <button
                        key={i}
                        onClick={() => setSelectedHour(i)}
                        className={`flex-shrink-0 w-10 h-9 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${
                            selectedHour === i
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                        >
                        {i === 12 ? '12p' : i === 0 ? '12a' : i > 12 ? `${i-12}p` : `${i}a`}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </header>

      <main className="relative z-10 p-4 max-w-7xl mx-auto w-full space-y-6">
        
        {/* --- VIEW 1: OPERATIONS --- */}
        {viewMode === 'ops' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900 text-white border-0 shadow-lg">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Bookings</p>
                    <h3 className="text-3xl font-black">{filteredHistory.length}</h3>
                    <p className="text-xs text-slate-400 mt-1">for {format(targetDate, 'MMM do')}</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl"><BarChart3 size={24} className="text-emerald-400"/></div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Est. Revenue</p>
                    <h3 className="text-3xl font-black text-slate-900">₹{totalRevenue}</h3>
                    <p className="text-xs text-slate-400 mt-1">for {format(targetDate, 'MMM do')}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl"><Wallet size={24} className="text-emerald-600"/></div>
                </CardContent>
              </Card>
              <Card onClick={() => setShowQRModal(true)} className="border-0 shadow-sm bg-blue-600 text-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative">
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 group-hover:scale-110 transition-transform"><QrCode size={120} /></div>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm"><QRCode value={JSON.stringify({ spaceId: space.id })} size={60} level="L" /></div>
                  <div><h3 className="font-bold text-lg flex items-center gap-2">Gate Pass <Maximize2 size={14} className="opacity-70" /></h3><p className="text-blue-100 text-xs">Click to Expand & Print</p></div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">Floor Map Availability ({format(targetDate, 'h:00 a')})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="car" className="w-full">
                  <TabsList className="mb-6 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="car">Car Floor</TabsTrigger>
                    <TabsTrigger value="bike">Bike Zone</TabsTrigger>
                    <TabsTrigger value="suv">Large Vehicle</TabsTrigger>
                  </TabsList>
                  <TabsContent value="car"><VisualGrid total={occupancy.car.total} parked={occupancy.car.parked} booked={occupancy.car.booked} type="Car" icon={Car} /></TabsContent>
                  <TabsContent value="bike"><VisualGrid total={occupancy.bike.total} parked={occupancy.bike.parked} booked={occupancy.bike.booked} type="Bike" icon={Bike} /></TabsContent>
                  <TabsContent value="suv"><VisualGrid total={occupancy.suv.total} parked={occupancy.suv.parked} booked={occupancy.suv.booked} type="SUV" icon={Truck} /></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* BOOKING LOG */}
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Clock className="text-slate-400" size={20} /> Booking Log ({format(targetDate, "MMM do")})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold">Driver</th>
                            <th className="px-6 py-4 font-bold">Vehicle</th>
                            <th className="px-6 py-4 font-bold">Time Slot</th>
                            <th className="px-6 py-4 font-bold text-center">Status</th>
                            <th className="px-6 py-4 font-bold text-center">Chat</th>
                            <th className="px-6 py-4 font-bold text-right">Amount</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {filteredHistory.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-slate-400 italic">No bookings found for {format(targetDate, "MMM do")}</td></tr>
                        ) : filteredHistory.map((booking) => {
                            const unreadCount = getUnreadCount(booking.messages);
                            return (
                            <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                    {booking.profiles?.avatar_url ? <img src={booking.profiles.avatar_url} className="w-full h-full object-cover" /> : <Users size={16} className="text-slate-400"/>}
                                    </div>
                                    <div className="font-bold text-slate-900">{booking.profiles?.full_name || 'Guest'}</div>
                                </div>
                                </td>
                                <td className="px-6 py-4 capitalize">{booking.vehicle_type || 'Car'}</td>
                                <td className="px-6 py-4"><span className="font-medium">{format(new Date(booking.start_time), 'h:mm a')}</span></td>
                                <td className="px-6 py-4 text-center"><StatusBadge status={booking.status} /></td>
                                <td className="px-6 py-4 text-center">
                                    <ChatSheet 
                                        bookingId={booking.id}
                                        partnerName={booking.profiles?.full_name || 'Driver'}
                                        trigger={
                                            <div className="relative inline-block">
                                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:text-emerald-600">
                                                <MessageSquare size={14} />
                                              </Button>
                                              {unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                                  {unreadCount}
                                                </div>
                                              )}
                                            </div>
                                        }
                                    />
                                </td>
                                <td className="px-6 py-4 text-right font-bold">₹{booking.total_price}</td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>
                </CardContent>
            </Card>

          </motion.div>
        )}

        {/* --- VIEW 2: SMART PRICING (ML) --- */}
        {viewMode === 'pricing' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: AI Model Visualization */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 text-white overflow-hidden relative min-h-[300px]">
                <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit size={150} /></div>
                
                <CardContent className="p-8 relative z-10">
                  {!mlReady ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
                      <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-indigo-200 font-mono text-sm animate-pulse">{trainingLog}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-indigo-200 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <Zap size={16} /> TensorFlow Prediction
                          </h2>
                          <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-6xl font-black">{(prediction).toFixed(2)}x</span>
                            <span className="text-xl text-indigo-300">multiplier</span>
                          </div>
                          <p className="text-indigo-300 text-sm mt-2">
                            Est. Price: <span className="text-white font-bold text-lg">₹{Math.round((space.hourly_rate || 50) * prediction)}/hr</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-100 px-3 py-1 rounded text-xs font-bold mb-1 inline-block">
                            MODEL ACTIVE
                          </div>
                          <div className="text-[10px] text-indigo-300">{format(targetDate, "EEE @ h a")}</div>
                        </div>
                      </div>

                      {/* AI Inputs Visualization */}
                      <div className="mt-8 grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white/5 rounded p-2">
                          <div className="text-[10px] text-indigo-300 uppercase">Occupancy</div>
                          <div className="font-bold">{((occupancy.car.parked + occupancy.car.booked) / (occupancy.car.total || 1) * 100).toFixed(0)}%</div>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <div className="text-[10px] text-indigo-300 uppercase">Peak Hour</div>
                          <div className="font-bold">{selectedHour >= 8 && selectedHour <= 11 ? 'YES' : 'NO'}</div>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                           <div className="text-[10px] text-indigo-300 uppercase">Rain (Forecast)</div>
                           <div className="font-bold">{currentWeather.rainMM} mm</div>
                        </div>
                         <div className={`rounded p-2 ${manualFloodMode || isAutoFlood ? 'bg-red-500/20 border border-red-500' : 'bg-white/5'}`}>
                           <div className="text-[10px] text-indigo-300 uppercase">Flood Mode</div>
                           <div className="font-bold">{manualFloodMode || isAutoFlood ? 'YES' : 'NO'}</div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Explainer */}
              <Card className="border-0 shadow-sm bg-slate-50">
                 <CardContent className="p-6">
                    <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2"><Info size={14}/> How this works</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      The AI predicts demand based on the <strong>Selected Time</strong> above. It looks at the weather forecast for that specific hour and historical occupancy trends. 
                      Try changing the time to see how rain or peak hours affect the price.
                    </p>
                 </CardContent>
              </Card>
            </div>

            {/* COLUMN 2: Simulation Controls */}
            <div className="space-y-6">
              <Card className="border-0 shadow-md bg-white h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity size={18} className="text-indigo-600"/> Environment</CardTitle>
                  <CardDescription>Forecast for {format(targetDate, "h:00 a")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Rain Display */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">Rain Intensity</label>
                    <div className="flex items-center gap-3">
                       <CloudRain size={20} className="text-blue-500" />
                       <div className="text-sm font-bold">{currentWeather.rainMM} mm</div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                        {currentWeather.rainMM > 0 ? "Rain detected in forecast." : "No rain forecasted for this hour."}
                    </p>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Flood Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-700 flex items-center gap-2"><ShieldAlert size={16}/> Flood Mode</span>
                      {isAutoFlood && <span className="text-[10px] bg-red-100 text-red-600 px-2 rounded-full font-bold">AUTO-ON</span>}
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Auto-enabled if forecast predicts heavy rain ({'>'}25mm).</p>
                    <Button 
                      onClick={() => setManualFloodMode(!manualFloodMode)}
                      variant={manualFloodMode ? "destructive" : "outline"}
                      className="w-full font-bold"
                    >
                      {manualFloodMode ? 'Deactivate Manual Override' : 'Force Flood Mode'}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>

          </motion.div>
        )}
      </main>

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQRModal(false)}>
            <motion.div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
              <Button onClick={() => setShowQRModal(false)} variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full"><X size={20} /></Button>
              <div className="flex justify-center mb-6"><div className="bg-white p-4 rounded-xl border-4 border-slate-900"><QRCode id="fullscreen-qr-code" value={JSON.stringify({ spaceId: space.id })} size={200} level="H" /></div></div>
              <Button onClick={downloadQRCode} className="w-full bg-slate-900 text-white font-bold h-12 rounded-xl"><Download className="mr-2 h-4 w-4" /> Download PNG</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ... VisualGrid & StatusBadge components ...
function VisualGrid({ total, parked, booked, type, icon: Icon }: any) {
  const free = Math.max(0, total - (parked + booked));
  const slots = Array.from({ length: total }, (_, i) => {
    let status = 'free'; if (i < parked) status = 'parked'; else if (i < parked + booked) status = 'booked'; return { id: i + 1, status };
  });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-3 rounded-xl"><Icon className="text-slate-700" size={24}/></div>
          <div><h4 className="font-bold text-xl leading-none">{type} Slots</h4><p className="text-sm text-slate-500 mt-1">Total Capacity: {total}</p></div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-bold justify-end">
           <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-blue-900 border border-blue-950 shadow-sm"></span> Parked ({parked})</div>
           <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-yellow-400 border border-yellow-500 shadow-sm"></span> Booked ({booked})</div>
           <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-emerald-50 border border-emerald-200"></span> Available ({free})</div>
        </div>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4">
          {slots.map((slot) => {
            let styles = "";
            if (slot.status === 'parked') styles = "bg-blue-900 border-blue-950 text-blue-50 shadow-blue-900/20";
            else if (slot.status === 'booked') styles = "bg-yellow-400 border-yellow-500 text-yellow-900 shadow-yellow-400/20";
            else styles = "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer";
            return ( <motion.div key={slot.id} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`aspect-square rounded-xl flex items-center justify-center font-bold border-b-4 transition-all shadow-sm ${styles}`}>{slot.id}</motion.div> );
          })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = { confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200", parked: "bg-blue-100 text-blue-700 border-blue-200", completed: "bg-slate-100 text-slate-600 border-slate-200", cancelled: "bg-red-50 text-red-700 border-red-100", pending: "bg-amber-50 text-amber-700 border-amber-100" };
  return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${styles[status] || styles.pending}`}>{status}</span>;
}