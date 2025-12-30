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
  ArrowRight, Loader2, CloudLightning, CloudRain, ShieldCheck,
  Calendar, Grid3X3, Clock, User, MapPin, ChevronDown, ChevronUp, Bike, Car, Truck, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
interface ParkingSpace {
  id: string;
  title: string;
  address: string;
  price_car: number;
  price_bike: number;
  price_suv: number;
  latitude: number;
  longitude: number;
  is_flood_safe: boolean;
  images: string[];
  space_type: string;
  is_active: boolean;
  city?: string;
  displayPrice?: number;
  distance?: number;
  direction?: string;
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

// --- UTILS ---
const toRad = (val: number) => (val * Math.PI) / 180;
const toDeg = (val: number) => (val * 180) / Math.PI;

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999; 
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getDirection = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  let brng = toDeg(Math.atan2(y, x));
  if (brng < 0) brng += 360; 

  if (brng >= 315 || brng < 45) return 'North';
  if (brng >= 45 && brng < 135) return 'East';
  if (brng >= 135 && brng < 225) return 'South';
  if (brng >= 225 && brng < 315) return 'West';
  return '';
};

// --- ICON GENERATOR ---
const createParkingIcon = (spot: ParkingSpace, isSelected: boolean, isSafeMode: boolean) => {
  const price = spot.displayPrice || spot.price_car || 0;
  const bgColor = isSafeMode ? '#3b82f6' : (isSelected ? '#10b981' : '#1e293b');
  
  const html = `
    <div class="pin-wrapper">
      <div class="pin-icon" style="background-color: ${bgColor};">
        <span class="icon-char">P</span>
      </div>
      <div class="pin-pulse" style="border-color: ${bgColor};"></div>

      <div class="pin-tooltip">
        <div class="tooltip-header">
          <strong>${spot.title}</strong>
          <span class="tooltip-dist">${spot.direction ? spot.direction + ' • ' : ''}${spot.distance?.toFixed(1)} km</span>
        </div>
        <div class="tooltip-prices">
          <div class="price-item">
            <span class="icon">🏍️</span> <span class="val">₹${spot.price_bike || '--'}</span>
          </div>
          <div class="price-item active">
            <span class="icon">🚗</span> <span class="val">₹${spot.price_car || '--'}</span>
          </div>
          <div class="price-item">
            <span class="icon">🚙</span> <span class="val">₹${spot.price_suv || '--'}</span>
          </div>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: html,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// --- CSS ---
const mapStyles = `
  .custom-leaflet-icon { background: transparent; border: none; }
  .pin-wrapper { position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
  .pin-wrapper:hover { z-index: 9999 !important; }
  .pin-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; z-index: 2; transition: transform 0.2s ease; }
  .pin-wrapper:hover .pin-icon { transform: scale(1.2); }
  .icon-char { font-family: 'Inter', sans-serif; font-weight: 900; font-size: 16px; }
  .pin-pulse { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 32px; height: 32px; border-radius: 50%; border: 2px solid; opacity: 0; z-index: 1; animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
  @keyframes pulse-ring { 0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; } 100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; } }
  .pin-tooltip { position: absolute; bottom: 45px; left: 50%; transform: translateX(-50%) scale(0.8); background: white; color: #0f172a; padding: 12px; border-radius: 12px; width: 180px; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.3); opacity: 0; visibility: hidden; pointer-events: none; transition: all 0.2s ease; border: 1px solid #e2e8f0; z-index: 10; }
  .pin-wrapper:hover .pin-tooltip { opacity: 1; visibility: visible; transform: translateX(-50%) scale(1); bottom: 50px; }
  .tooltip-arrow { position: absolute; bottom: -6px; left: 50%; margin-left: -6px; width: 12px; height: 12px; background: white; transform: rotate(45deg); border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
  .tooltip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
  .tooltip-header strong { font-size: 13px; font-weight: 800; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90px; }
  .tooltip-dist { font-size: 10px; color: #64748b; font-weight: 600; background: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
  .tooltip-prices { display: flex; gap: 4px; }
  .price-item { display: flex; flex-direction: column; align-items: center; background: #f8fafc; padding: 4px; border-radius: 6px; flex: 1; }
  .price-item.active { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
  .price-item .icon { font-size: 10px; margin-bottom: 2px; }
  .price-item .val { font-size: 10px; font-weight: 800; }
`;

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.5 });
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
  const [isResultsCollapsed, setIsResultsCollapsed] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [sosMode, setSosMode] = useState(false);
  const [showStormIntro, setShowStormIntro] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]);

  const userAvatar = user?.user_metadata?.avatar_url || (user as any)?.avatar_url;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: spaceData } = await supabase.from('parking_spaces').select('*').eq('is_active', true);
      setSpaces(spaceData || []);

      if (user) {
        const { data: bookData } = await supabase
          .from('bookings')
          .select('*, parking_spaces(title, address_street, city)')
          .eq('driver_id', user.id)
          .order('start_time', { ascending: false });
        setMyBookings(bookData || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // --- FILTER & SORT LOGIC ---
  const filteredSpots = useMemo(() => {
    // 1. Filter by Mode (Flood Safe)
    const list = spaces.filter(s => sosMode ? s.is_flood_safe : true);

    // 2. Calculate Distance & Direction for ALL spots
    const listWithMetrics = list.map(s => {
      const dist = calculateDistance(mapCenter[0], mapCenter[1], s.latitude, s.longitude);
      // Only calculate direction if search is active (distance < 50km to be relevant), else empty
      const dir = (showResults && dist < 50) ? getDirection(mapCenter[0], mapCenter[1], s.latitude, s.longitude) : '';
      return {
        ...s,
        displayPrice: sosMode ? Math.round((s.price_car || 0) * 1.5) : (s.price_car || 0),
        distance: dist,
        direction: dir
      };
    });

    // 3. CASE: NO SEARCH (Show All)
    if (!showResults && !selectedSpot) {
      return listWithMetrics.sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Just sort by distance from current center
    }

    // 4. CASE: SEARCH ACTIVE (Filter, Distribute Directions, Limit to 10)
    
    // Bucket Sort (North, West, East, South/Others)
    const north = listWithMetrics.filter(s => s.direction === 'North').sort((a, b) => a.distance! - b.distance!);
    const east = listWithMetrics.filter(s => s.direction === 'East').sort((a, b) => a.distance! - b.distance!);
    const west = listWithMetrics.filter(s => s.direction === 'West').sort((a, b) => a.distance! - b.distance!);
    
    // Pick top 2 from N, E, W first
    const combined: ParkingSpace[] = [];
    for(let i=0; i<2; i++) {
        if(north[i]) combined.push(north[i]);
        if(west[i]) combined.push(west[i]);
        if(east[i]) combined.push(east[i]);
    }

    // Fill remaining spots with closest from ANY direction
    const existingIds = new Set(combined.map(s => s.id));
    const remainders = listWithMetrics
        .filter(s => !existingIds.has(s.id))
        .sort((a, b) => a.distance! - b.distance!);

    const result = [...combined, ...remainders].slice(0, 10); // LIMIT TO 10

    // Final Sort: Selected spot first, then distance
    return result.sort((a, b) => {
        if (a.id === selectedSpot) return -1;
        if (b.id === selectedSpot) return 1;
        return (a.distance || 0) - (b.distance || 0);
    });

  }, [spaces, sosMode, selectedSpot, mapCenter, showResults]);

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
        setShowResults(true); // Triggers the filtering logic
        setIsResultsCollapsed(true);
        setSelectedSpot(null);
      }
    } finally { setIsSearching(false); }
  };

  const toggleCollapse = () => setIsResultsCollapsed(!isResultsCollapsed);

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden font-sans transition-colors duration-1000 ${sosMode ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
      <style>{mapStyles}</style>
      <AnimatePresence>{showStormIntro && <StormIntro />}</AnimatePresence>

      <div className="absolute inset-0 z-0">
        <MapContainer center={mapCenter} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url={sosMode ? DARK_MAP : LIGHT_MAP} attribution='&copy; TomTom' />
          <MapUpdater center={mapCenter} />
          {filteredSpots.map((spot) => (
            <Marker 
              key={spot.id} 
              position={[spot.latitude || 0, spot.longitude || 0]}
              icon={createParkingIcon(spot, selectedSpot === spot.id, sosMode && spot.is_flood_safe)}
              eventHandlers={{ 
                click: () => { 
                  setSelectedSpot(spot.id); 
                  if (!showResults) setShowResults(true); // Open sheet if closed
                  setIsResultsCollapsed(false); // Expand list to show details
                  setMapCenter([spot.latitude, spot.longitude]); 
                }
              }}
            />
          ))}
        </MapContainer>
      </div>

      <header className="relative z-20 p-4 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto bg-white/90 p-2 rounded-full shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}>
          <Logo color={sosMode ? 'light' : 'dark'} size="sm" />
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <Button onClick={() => navigate('/my-bookings')} className={`rounded-full shadow-lg h-10 px-4 font-bold border-none transition-all ${sosMode ? 'bg-slate-900/80 text-blue-400 hover:bg-slate-800' : 'bg-white/90 text-slate-900 hover:bg-white'}`}>
            <Clock size={16} className="mr-2" /> My Bookings
          </Button>
          <div onClick={() => navigate('/profile')} className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all border-2 overflow-hidden ${sosMode ? 'bg-slate-900/80 border-blue-500/30 text-blue-400' : 'bg-white/90 border-transparent text-slate-700'}`}>
            {userAvatar ? <img src={userAvatar} className="h-full w-full object-cover" /> : <User size={20} />}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-end pointer-events-none pb-0">
        
        {!showResults && (
          <motion.div className="w-full px-4 mb-6 pointer-events-auto" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <Card className={`rounded-[32px] border-0 shadow-2xl backdrop-blur-xl transition-all duration-700 ${sosMode ? 'bg-slate-900/80 text-white border-blue-500/20' : 'bg-white/90 shadow-slate-200'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-bold tracking-tight">Where to park?</h1>
                  <div onClick={() => { if(!sosMode) { setShowStormIntro(true); setTimeout(() => setSosMode(true), 800); setTimeout(() => setShowStormIntro(false), 2500); } else setSosMode(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${sosMode ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-slate-100 border-slate-200'}`}>
                    {sosMode ? <CloudLightning size={16} /> : <CloudRain size={16} />}
                    <span className="text-[10px] font-black uppercase">{sosMode ? 'Storm Mode' : 'Normal'}</span>
                  </div>
                </div>
                <form onSubmit={handleSearch} className={`flex items-center p-4 rounded-2xl border transition-all ${sosMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-transparent focus-within:bg-white focus-within:border-emerald-500/30'}`}>
                  <input className="bg-transparent w-full outline-none font-medium text-lg placeholder:text-slate-400" placeholder="Enter destination..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <Button size="icon" variant="ghost" className="rounded-full">{isSearching ? <Loader2 className="animate-spin" /> : <ArrowRight />}</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence>
          {showResults && (
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: isResultsCollapsed ? '85%' : '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 rounded-t-[32px] overflow-hidden pointer-events-auto backdrop-blur-3xl shadow-2xl border-t z-50 flex flex-col ${sosMode ? 'bg-slate-900/95 text-white border-white/10' : 'bg-white/95'}`}
              style={{ height: '70vh' }}
            >
              <div className="p-6 pb-2 cursor-pointer bg-transparent" onClick={toggleCollapse}>
                <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 opacity-50" />
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                      {sosMode ? <ShieldCheck className="text-blue-500" /> : <Grid3X3 size={20} />}
                      {sosMode ? 'Flood-Safe Zones' : 'Nearest Parking'}
                    </h2>
                    <p className="text-xs opacity-60 font-medium ml-1">{filteredSpots.length} spots found near destination</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}>
                      {isResultsCollapsed ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                    <Button variant="ghost" className="rounded-full text-xs font-bold" onClick={(e) => { e.stopPropagation(); setShowResults(false); }}>Close</Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pt-2 pb-10 space-y-4">
                {filteredSpots.length === 0 ? <p className="text-center opacity-50 py-10">No spots found.</p> : filteredSpots.map(spot => (
                  <div 
                    key={spot.id} 
                    onClick={() => navigate(`/booking/${spot.id}`)}
                    className={`flex gap-4 p-4 rounded-3xl border transition-all cursor-pointer group ${sosMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 shadow-inner relative">
                      <img src={spot.images?.[0] || 'https://placehold.co/100'} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold text-center py-1.5 flex items-center justify-center gap-1">
                        <MapPin size={10} className="text-emerald-400" /> {spot.distance ? `${spot.distance.toFixed(1)} km` : 'N/A'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold truncate text-base">{spot.title}</h4>
                        <p className={`font-black ${sosMode ? 'text-blue-400' : 'text-emerald-700'}`}>₹{spot.displayPrice}</p>
                      </div>
                      <p className="text-xs opacity-60 truncate mt-1 flex items-center gap-2">
                        <span>{spot.address}</span>
                        {spot.direction && <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded font-bold text-[9px]"><Compass size={10} /> {spot.direction}</span>}
                      </p>
                      <div className="flex gap-2 mt-3 items-center">
                        {spot.price_bike && <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-600"><Bike size={10}/> ₹{spot.price_bike}</span>}
                        {spot.price_car && <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-md text-emerald-700 border border-emerald-100"><Car size={10}/> ₹{spot.price_car}</span>}
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