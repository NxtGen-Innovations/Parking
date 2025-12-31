import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/Logo';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Clock, Car, Bike, Truck, 
  Users, Phone, QrCode, MessageSquare, BarChart3, Wallet, Calendar as CalendarIcon, ArrowRight,
  Maximize2, Download, X, Printer
} from 'lucide-react';
import { format, isSameDay, startOfDay, endOfDay, areIntervalsOverlapping } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";
import { ChatSheet } from '@/components/ChatSheet';
import { cn } from '@/lib/utils';

export default function SpaceDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [space, setSpace] = useState<any>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Modern Date & Time State ---
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const [showQRModal, setShowQRModal] = useState(false);

  // Occupancy State
  const [occupancy, setOccupancy] = useState({
    car: { total: 0, parked: 0, booked: 0 },
    bike: { total: 0, parked: 0, booked: 0 },
    suv: { total: 0, parked: 0, booked: 0 },
  });

  const timeSlots = useMemo(() => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      times.push(`${hour}:00`);
      times.push(`${hour}:30`);
    }
    return times;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const { data: spaceData, error: spaceError } = await supabase
        .from('parking_spaces')
        .select('*')
        .eq('id', id)
        .single();

      if (spaceError) {
        navigate('/provider-dashboard');
        return;
      }
      setSpace(spaceData);

      const { data: bookingData } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:driver_id (full_name, phone_number, avatar_url),
          messages (id, sender_id, is_read)
        `)
        .eq('space_id', id)
        .order('start_time', { ascending: false });

      if (bookingData) {
        setAllBookings(bookingData);
      }
      
      setLoading(false);
    };

    fetchData();

    const subscription = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {})
      .subscribe();

    return () => { supabase.removeChannel(subscription); };

  }, [id, navigate]);

  // --- UPDATED: Time Machine Simulator ---
  useEffect(() => {
    if (!space || !date) return;

    const filterStart = new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}:00`);
    const filterEnd = new Date(`${format(date, 'yyyy-MM-dd')}T${endTime}:00`);

    if (filterEnd <= filterStart) return; 

    const overlappingBookings = allBookings.filter((b: any) => {
      const bookingStart = new Date(b.start_time);
      const bookingEnd = new Date(b.end_time);
      
      // UPDATED: Removed 'completed' from valid status check.
      // If status is 'completed', the car has left, so it doesn't count towards occupancy anymore.
      const isValidStatus = ['confirmed', 'parked'].includes(b.status);
      
      if (!isValidStatus) return false;

      return areIntervalsOverlapping(
        { start: bookingStart, end: bookingEnd },
        { start: filterStart, end: filterEnd }
      );
    });

    const calculateStats = (type: string) => {
      const typeBookings = overlappingBookings.filter((b: any) => 
        b.vehicle_type === type || (!b.vehicle_type && type === 'car')
      );
      
      // Parked: Strictly 'parked' status (Dark Blue)
      const parkedCount = typeBookings.filter((b: any) => b.status === 'parked').length;

      // Booked: Strictly 'confirmed' status (Yellow)
      const bookedCount = typeBookings.filter((b: any) => b.status === 'confirmed').length;

      return { parked: parkedCount, booked: bookedCount };
    };

    const carStats = calculateStats('car');
    const bikeStats = calculateStats('bike');
    const suvStats = calculateStats('suv');

    setOccupancy({
      car: { total: space.slots_car || 0, ...carStats },
      bike: { total: space.slots_bike || 0, ...bikeStats },
      suv: { total: space.slots_suv || 0, ...suvStats },
    });

  }, [space, allBookings, date, startTime, endTime]);

  const filteredHistory = useMemo(() => {
    if (!date) return allBookings;
    return allBookings.filter(b => isSameDay(new Date(b.start_time), date));
  }, [allBookings, date]);

  const totalRevenue = useMemo(() => {
    return filteredHistory.reduce((sum, b) => sum + (b.total_price || 0), 0);
  }, [filteredHistory]);

  const getUnreadCount = (msgs: any[]) => {
    if (!msgs || !user) return 0;
    return msgs.filter(m => m.sender_id !== user.id && !m.is_read).length;
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
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `GatePass-${space.title.replace(/\s+/g, '_')}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col relative font-sans text-slate-900 bg-slate-50">
      
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex flex-col xl:flex-row justify-between items-center shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/provider-dashboard')}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{space.title}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${space.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {space.address_street}
            </p>
          </div>
        </div>
        
        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full xl:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-semibold border-0 bg-white shadow-sm h-10 rounded-lg px-3 text-xs w-[160px]", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                {date ? format(date, "EEE, MMM do") : <span>Pick Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="rounded-md border shadow-lg"/>
            </PopoverContent>
          </Popover>
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm h-10">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">From</span>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 text-xs font-bold w-[60px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">{timeSlots.map(t => <SelectItem key={`start-${t}`} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm h-10">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">To</span>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 text-xs font-bold w-[60px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">{timeSlots.map(t => <SelectItem key={`end-${t}`} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
            </div>
          </div>
        </div>
        <div className="hidden xl:block"><Logo color="dark" size="sm" /></div>
      </header>

      <main className="relative z-10 p-4 max-w-7xl mx-auto w-full space-y-6">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900 text-white border-0 shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Bookings</p>
                <h3 className="text-3xl font-black">{filteredHistory.length}</h3>
                <p className="text-xs text-slate-400 mt-1">For selected date</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl"><BarChart3 size={24} className="text-emerald-400"/></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Est. Revenue</p>
                <h3 className="text-3xl font-black text-slate-900">₹{totalRevenue}</h3>
                <p className="text-xs text-slate-400 mt-1">For selected date</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl"><Wallet size={24} className="text-emerald-600"/></div>
            </CardContent>
          </Card>
          
          <Card 
            onClick={() => setShowQRModal(true)}
            className="border-0 shadow-sm bg-blue-600 text-white overflow-hidden relative cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group"
          >
             <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 group-hover:scale-110 transition-transform"><QrCode size={120} /></div>
             <CardContent className="p-6 flex items-center gap-4">
               <div className="bg-white p-2 rounded-lg shadow-sm">
                 <QRCode value={JSON.stringify({ spaceId: space.id })} size={60} level="L" />
               </div>
               <div>
                 <h3 className="font-bold text-lg flex items-center gap-2">
                   Gate Pass <Maximize2 size={14} className="opacity-70" />
                 </h3>
                 <p className="text-blue-100 text-xs">Click to Expand & Print</p>
               </div>
             </CardContent>
          </Card>
        </div>

        {/* VISUAL OCCUPANCY GRID */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Floor Map Availability
              </CardTitle>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                 <Clock size={12} />
                 Simulating: <span className="text-slate-900 font-bold">{startTime} - {endTime}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="car" className="w-full">
              <TabsList className="mb-6 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="car" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Car Floor</TabsTrigger>
                <TabsTrigger value="bike" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Bike Zone</TabsTrigger>
                <TabsTrigger value="suv" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Large Vehicle</TabsTrigger>
              </TabsList>

              <TabsContent value="car">
                <VisualGrid total={occupancy.car.total} parked={occupancy.car.parked} booked={occupancy.car.booked} type="Car" icon={Car} />
              </TabsContent>
              <TabsContent value="bike">
                <VisualGrid total={occupancy.bike.total} parked={occupancy.bike.parked} booked={occupancy.bike.booked} type="Bike" icon={Bike} />
              </TabsContent>
              <TabsContent value="suv">
                <VisualGrid total={occupancy.suv.total} parked={occupancy.suv.parked} booked={occupancy.suv.booked} type="SUV" icon={Truck} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* BOOKING LOG TABLE */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="text-slate-400" size={20} /> Booking Log
              </CardTitle>
              <div className="text-xs font-medium px-2 py-1 bg-white border rounded-md text-slate-500">
                {date ? format(date, 'MMM do') : 'All Time'} • {filteredHistory.length} records
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No bookings found for this date.</div>
            ) : (
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
                    {filteredHistory.map((booking) => {
                      const unreadCount = getUnreadCount(booking.messages);
                      return (
                        <motion.tr 
                          key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                {booking.profiles?.avatar_url ? <img src={booking.profiles.avatar_url} className="w-full h-full object-cover" /> : <Users size={16} className="text-slate-400"/>}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{booking.profiles?.full_name || 'Guest'}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1"><Phone size={10} /> {booking.profiles?.phone_number || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 capitalize text-slate-700 font-medium">
                              {booking.vehicle_type === 'car' && <Car size={16} className="text-blue-500"/>}
                              {booking.vehicle_type === 'bike' && <Bike size={16} className="text-emerald-500"/>}
                              {booking.vehicle_type === 'suv' && <Truck size={16} className="text-amber-500"/>}
                              {booking.vehicle_type || 'Car'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">{format(new Date(booking.start_time), 'MMM dd')}</span>
                              <span className="text-xs text-slate-500">{format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}</span>
                            </div>
                          </td>
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
                          <td className="px-6 py-4 text-right font-bold text-slate-900">₹{booking.total_price}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AnimatePresence>
        {showQRModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} 
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <Button onClick={() => setShowQRModal(false)} variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full text-slate-400 hover:text-slate-900">
                <X size={20} />
              </Button>

              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-black text-slate-900">Gate Pass</h2>
                <p className="text-sm text-slate-500">Scan at entrance terminal</p>
              </div>

              <div className="flex justify-center mb-8">
                 <div className="bg-white p-4 rounded-xl border-4 border-slate-900 shadow-xl">
                   <QRCode 
                     id="fullscreen-qr-code"
                     value={JSON.stringify({ spaceId: space.id })} 
                     size={220} 
                     level="H" 
                   />
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={downloadQRCode} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl shadow-lg shadow-slate-900/20">
                   <Download className="mr-2 h-4 w-4" /> Download PNG
                </Button>
                <Button variant="outline" className="w-full border-slate-200 h-12 rounded-xl font-bold" onClick={() => window.print()}>
                   <Printer className="mr-2 h-4 w-4" /> Print Pass
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- UPDATED VISUAL GRID COMPONENT ---
function VisualGrid({ total, parked, booked, type, icon: Icon }: any) {
  const free = Math.max(0, total - (parked + booked));
  
  // Create slots array
  const slots = Array.from({ length: total }, (_, i) => {
    let status = 'free';
    if (i < parked) status = 'parked';
    else if (i < parked + booked) status = 'booked';
    
    return { id: i + 1, status };
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
      {total === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p className="text-slate-400 text-base">No slots configured for {type}.</p></div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4">
          {slots.map((slot) => {
            let styles = "";
            if (slot.status === 'parked') {
              // Dark Blue
              styles = "bg-blue-900 border-blue-950 text-blue-50 shadow-blue-900/20";
            } else if (slot.status === 'booked') {
              // Yellow
              styles = "bg-yellow-400 border-yellow-500 text-yellow-900 shadow-yellow-400/20";
            } else {
              // Available
              styles = "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer";
            }

            return (
              <motion.div 
                key={slot.id} 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ delay: slot.id * 0.01 }} 
                className={`aspect-square rounded-xl flex items-center justify-center text-base md:text-lg font-bold border-b-4 transition-all shadow-sm ${styles}`}
              >
                {slot.id}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = { confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200", parked: "bg-blue-100 text-blue-700 border-blue-200", completed: "bg-slate-100 text-slate-600 border-slate-200", cancelled: "bg-red-50 text-red-700 border-red-100", pending: "bg-amber-50 text-amber-700 border-amber-100" };
  return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${styles[status] || styles.pending}`}>{status}</span>;
}