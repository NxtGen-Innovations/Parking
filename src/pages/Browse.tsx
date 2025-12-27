import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet'; 
import { 
  Navigation, 
  ArrowRight,
  Loader2,
  CloudLightning, 
  CloudRain,
  ShieldCheck,
  Droplets,
  Calendar,
  Grid3X3,
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
interface ParkingSpace {
  id: string;
  title: string;
  address: string;
  price_car: number;
  price_bike: number;
  latitude: number;
  longitude: number;
  is_flood_safe: boolean;
  images: string[];
  space_type: string;
  is_active: boolean;
  city?: string;
  displayPrice?: number;
}

interface Booking {
  id: string;
  driver_id: string;
  space_id: string;
  start_time: string;
  status?: string;
  parking_spaces: {
    title: string;
    address: string;
    city: string;
  };
}

// --- CONFIGURATION ---
const TOMTOM_API_KEY = "LH8w4oyNpv19Ok0SDqxyayikvpw5DrTC"; 
const DARK_MAP = `https://api.tomtom.com/map/1/tile/basic/night/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`;
const LIGHT_MAP = `https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`;

// --- CUSTOM MARKER ICONS ---
const createParkingIcon = (price: number, isSelected: boolean, isSafeMode: boolean) => {
  const bgColor = isSafeMode ? '#3b82f6' : (isSelected ? '#10b981' : '#1e293b');
  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="background-color: ${bgColor}; color: white; padding: 6px 12px; border-radius: 12px; font-weight: 800; font-size: 13px; border: 2px solid white; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
        ${isSafeMode ? '🛡️' : ''} ₹${price}
      </div>
      <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 10px solid ${bgColor}; margin: -4px auto 0;"></div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 2 });
  }, [center, map]);
  return null;
}

const StormIntro = () => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
  >
    <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-blue-500/30 text-center">
      <CloudLightning size={64} className="text-blue-400 animate-pulse mx-auto mb-4" />
      <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Activating Storm Protocol</h1>
      <p className="text-blue-200 mt-2 font-medium">Scanning for elevated safe zones...</p>
    </div>
  </motion.div>
);

export default function Browse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [sosMode, setSosMode] = useState(false);
  const [showStormIntro, setShowStormIntro] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]);

  // 1. DATA FETCHING
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Spaces
      const { data: spaceData } = await supabase
        .from('parking_spaces')
        .select('*')
        .eq('is_active', true);
      setSpaces(spaceData || []);

      // Fetch Recent User Bookings
      if (user) {
        const { data: bookData } = await supabase
          .from('bookings')
          .select('*, parking_spaces(title, address, city)')
          .eq('driver_id', user.id)
          .order('start_time', { ascending: false });
        setMyBookings(bookData || []);
      }
      
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // 2. FILTER & PRICING LOGIC
  const filteredSpots = useMemo(() => {
    const list = spaces.filter(s => sosMode ? s.is_flood_safe : true);
    return list.map(s => ({
      ...s,
      displayPrice: sosMode ? Math.round((s.price_car || 0) * 1.5) : (s.price_car || 0),
    })).sort((a, b) => a.id === selectedSpot ? -1 : 1);
  }, [spaces, sosMode, selectedSpot]);

  const handleToggleStorm = () => {
    if (!sosMode) {
      setShowStormIntro(true);
      setTimeout(() => setSosMode(true), 800);
      setTimeout(() => setShowStormIntro(false), 2500);
    } else {
      setSosMode(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://api.tomtom.com/search/2/search/${encodeURIComponent(searchQuery)}.json?key=${TOMTOM_API_KEY}&limit=1&lat=13.0827&lon=80.2707`);
      const data = await response.json();
      if (data.results?.length > 0) {
        const { lat, lon } = data.results[0].position;
        setMapCenter([lat, lon]);
        setShowResults(true);
      }
    } finally { setIsSearching(false); }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden font-sans transition-colors duration-1000 ${sosMode ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
      <AnimatePresence>{showStormIntro && <StormIntro />}</AnimatePresence>

      <div className="absolute inset-0 z-0">
        <MapContainer center={mapCenter} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url={sosMode ? DARK_MAP : LIGHT_MAP} attribution='&copy; TomTom' />
          <MapUpdater center={mapCenter} />
          {filteredSpots.map((spot) => (
            <Marker 
              key={spot.id} 
              position={[spot.latitude || 0, spot.longitude || 0]}
              icon={createParkingIcon(spot.displayPrice || 0, selectedSpot === spot.id, sosMode && spot.is_flood_safe)}
              eventHandlers={{ click: () => { setSelectedSpot(spot.id); setShowResults(true); setMapCenter([spot.latitude, spot.longitude]); }}}
            />
          ))}
        </MapContainer>
      </div>

      {/* HEADER WITH PROFILE & BOOKINGS BUTTONS */}
      <header className="relative z-20 p-4 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto bg-white/90 p-2 rounded-full shadow-lg" onClick={() => navigate('/')}>
          <Logo color={sosMode ? 'light' : 'dark'} size="sm" />
        </div>
        
        <div className="flex items-center gap-3 pointer-events-auto">
          <Button 
            onClick={() => navigate('/my-bookings')}
            className={`rounded-full shadow-lg h-10 px-4 font-bold border-none transition-all ${
              sosMode ? 'bg-slate-900/80 text-blue-400 hover:bg-slate-800' : 'bg-white/90 text-slate-900 hover:bg-white'
            }`}
          >
            <Clock size={16} className="mr-2" /> My Bookings
          </Button>

          <div 
            onClick={() => navigate('/profile')}
            className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all border-2 overflow-hidden ${
              sosMode 
                ? 'bg-slate-900/80 border-blue-500/30 text-blue-400' 
                : 'bg-white/90 border-transparent text-slate-700'
            }`}
          >
            {user?.user_metadata?.avatar_url || user?.avatar_url ? (
              <img 
                src={user?.user_metadata?.avatar_url || user?.avatar_url} 
                alt="Profile" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <User size={20} />
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-end pointer-events-none pb-6">
        <motion.div className="w-full px-4 mb-4 pointer-events-auto">
          <Card className={`rounded-[32px] border-0 shadow-2xl backdrop-blur-xl transition-all duration-700 ${sosMode ? 'bg-slate-900/80 text-white border-blue-500/20' : 'bg-white/90 shadow-slate-200'}`}>
            <CardContent className="p-6">
              
              {/* MY BOOKINGS SECTION */}
              {user && myBookings.length > 0 && !showResults && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`text-[10px] font-black uppercase tracking-widest ${sosMode ? 'text-slate-500' : 'text-slate-400'}`}>Your Recent Bookings</h3>
                    <button onClick={() => navigate('/my-bookings')} className={`text-[10px] font-bold ${sosMode ? 'text-blue-400' : 'text-emerald-600'}`}>View All</button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {myBookings.map((booking) => (
                      <motion.div 
                        key={booking.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/booking-details/${booking.id}`)}
                        className={`min-w-[180px] p-3 rounded-2xl border flex items-center gap-3 ${sosMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-emerald-50/50 border-emerald-100'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sosMode ? 'bg-blue-600/20 text-blue-400' : 'bg-white text-emerald-600 shadow-sm'}`}>
                          <Calendar size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{booking.parking_spaces?.title}</p>
                          <p className="text-[9px] font-bold uppercase opacity-60">{booking.status || 'Confirmed'}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold tracking-tight">Where to park?</h1>
                <div onClick={handleToggleStorm} className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${sosMode ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-slate-100 border-slate-200'}`}>
                  {sosMode ? <CloudLightning size={16} /> : <CloudRain size={16} />}
                  <span className="text-[10px] font-black uppercase">{sosMode ? 'Storm Mode' : 'Normal'}</span>
                </div>
              </div>

              <form onSubmit={handleSearch} className={`flex items-center p-4 rounded-2xl border transition-all ${sosMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-transparent focus-within:bg-white focus-within:border-emerald-500/30'}`}>
                <input 
                  className="bg-transparent w-full outline-none font-medium text-lg placeholder:text-slate-400"
                  placeholder="Enter destination"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                />
                <Button size="icon" variant="ghost" className="rounded-full">{isSearching ? <Loader2 className="animate-spin" /> : <ArrowRight />}</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* SEARCH RESULTS SHEET */}
        <AnimatePresence>
          {showResults && (
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className={`min-h-[50vh] max-h-[70vh] rounded-t-[40px] p-8 overflow-y-auto pointer-events-auto backdrop-blur-3xl border-t ${sosMode ? 'bg-slate-900/95 text-white border-white/10' : 'bg-white/95'}`}
            >
              <div className="flex justify-between items-center mb-8 sticky top-0 z-10">
                <h2 className="text-lg font-black flex items-center gap-2">
                  {sosMode ? <ShieldCheck className="text-blue-500" /> : <Grid3X3 size={20} />}
                  {sosMode ? 'Flood-Safe Zones' : 'Available Spaces'}
                </h2>
                <Button variant="ghost" onClick={() => setShowResults(false)} className="rounded-full">Close</Button>
              </div>

              <div className="space-y-4">
                {filteredSpots.map(spot => (
                  <div 
                    key={spot.id} 
                    onClick={() => navigate(`/booking/${spot.id}`)}
                    className={`flex gap-4 p-4 rounded-3xl border transition-all cursor-pointer ${sosMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 shadow-inner">
                      <img src={spot.images?.[0] || 'https://placehold.co/100'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold truncate text-base">{spot.title}</h4>
                        <p className={`font-black ${sosMode ? 'text-blue-400' : 'text-emerald-700'}`}>₹{spot.displayPrice}</p>
                      </div>
                      <p className="text-xs opacity-60 truncate mt-1">{spot.address}</p>
                      <div className="flex gap-2 mt-3">
                        {spot.is_flood_safe && <span className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">Flood Safe</span>}
                        <span className="text-[9px] font-bold bg-slate-500/10 px-2 py-0.5 rounded-md uppercase opacity-60">{spot.space_type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}