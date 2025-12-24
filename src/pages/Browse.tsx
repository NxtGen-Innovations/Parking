import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet'; 
// FIX: Added 'CloudRain' and 'Droplets' to this import list
import { 
  Navigation, 
  ArrowRight,
  Loader2,
  Filter,
  Umbrella, 
  CloudLightning, 
  CloudRain,
  ShieldCheck,
  Droplets,
  MapPin as MapPinIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMAGES ---
import PARKING_1 from '../assets/parking1.jpg'; 
import PARKING_2 from '../assets/image.png';

// --- TOMTOM CONFIGURATION ---
// ⚠️ REPLACE THIS WITH YOUR NEW KEY FROM THE DASHBOARD
const TOMTOM_API_KEY = "LH8w4oyNpv19Ok0SDqxyayikvpw5DrTC";

const LIGHT_MAP_URL = `https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`;
const DARK_MAP_URL = `https://api.tomtom.com/map/1/tile/basic/night/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`;

// --- CUSTOM ICONS ---

const createParkingIcon = (price: number, isSelected: boolean, isSafeMode: boolean) => {
  const bgColor = isSafeMode ? '#3b82f6' : (isSelected ? '#10b981' : '#1e293b');
  const glow = isSafeMode ? 'box-shadow: 0 0 15px #3b82f6, 0 0 4px white;' : 'box-shadow: 0 4px 10px rgba(0,0,0,0.3);';
  
  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        padding: 6px 12px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 13px;
        ${glow}
        text-align: center;
        width: max-content;
        transform: translate(-50%, -50%);
        border: 2px solid white;
        font-family: sans-serif;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.3s ease;
      ">
        ${isSafeMode ? '<span style="font-size:14px">🛡️</span>' : ''} ₹${price}
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 10px solid ${bgColor};
        margin: -4px auto 0;
      "></div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });
};

// --- NEW ATTENTION-SEEKING 3D POINTER ---
const searchResultIcon = L.divIcon({
  className: 'search-pin',
  html: `
    <div style="position: relative; width: 50px; height: 50px; display: flex; justify-content: center; align-items: center;">
      
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(239, 68, 68, 0.4);
        border-radius: 50%;
        animation: ripple 1.5s infinite ease-out;
        z-index: 0;
      "></div>

      <div style="
        position: relative;
        z-index: 10;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #ef4444, #b91c1c);
        border: 3px solid white;
        border-radius: 50% 50% 0 50%;
        transform: rotate(45deg);
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
      
      <div style="
        position: absolute;
        bottom: -5px;
        width: 20px;
        height: 6px;
        background-color: rgba(0,0,0,0.3);
        border-radius: 50%;
        filter: blur(2px);
      "></div>

    </div>
    <style>
      @keyframes ripple {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [50, 50],
  iconAnchor: [25, 45], // Anchored at the bottom tip
});

// --- MOCK DATA ---
const NEARBY_SPOTS = [
  { id: '1', title: 'City Center Mall (Level 3)', address: 'Anna Salai, Chennai', price: 40, rating: 4.8, distance: '2 min', image: PARKING_2, type: 'Commercial', lat: 13.0827, lng: 80.2707, isFloodSafe: true },
  { id: '2', title: 'Greenways Driveway', address: 'Adyar, Chennai', price: 25, rating: 4.5, distance: '5 min', image: PARKING_1, type: 'Private', lat: 13.0012, lng: 80.2565, isFloodSafe: false },
  { id: '3', title: 'Metro Station Hub', address: 'Guindy, Chennai', price: 30, rating: 4.2, distance: '8 min', image: PARKING_2, type: 'Commercial', lat: 13.0067, lng: 80.2206, isFloodSafe: true },
];

// --- FULL SCREEN STORM INTRO ANIMATION ---
const StormIntro = () => {
  const drops = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    delay: Math.random() * 0.5,
    duration: 0.2 + Math.random() * 0.3
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
    >
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          initial={{ top: -100, x: 0 }}
          animate={{ top: '120%', x: -50 }}
          transition={{ duration: drop.duration, repeat: Infinity, delay: drop.delay, ease: "linear" }}
          className="absolute w-[2px] h-24 bg-blue-400/60 blur-[1px]"
          style={{ left: drop.left }}
        />
      ))}
      <motion.div
        animate={{ opacity: [0, 0, 1, 0, 0.8, 0] }}
        transition={{ duration: 1.5, times: [0, 0.4, 0.45, 0.5, 0.55, 1], repeat: 1 }}
        className="absolute inset-0 bg-white z-20 mix-blend-overlay"
      />
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-30 flex flex-col items-center"
      >
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
          <CloudLightning size={64} className="text-blue-400 fill-white animate-pulse mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Activating Storm Protocol</h1>
          <p className="text-blue-200 mt-2 text-center font-medium">Scanning for elevated safe zones...</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 2 });
  }, [center, map]);
  return null;
}

export default function Browse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [sosMode, setSosMode] = useState(false);
  const [showStormIntro, setShowStormIntro] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]);
  const [searchedLocation, setSearchedLocation] = useState<{lat: number, lng: number, name: string} | null>(null);

  const filteredSpots = NEARBY_SPOTS.filter(spot => sosMode ? spot.isFloodSafe : true);

  const handleToggleRainMode = () => {
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
    setShowResults(false);

    try {
      const response = await fetch(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(searchQuery)}.json?key=${TOMTOM_API_KEY}&limit=1`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newLat = result.position.lat;
        const newLng = result.position.lon;
        const placeName = result.address.freeformAddress || searchQuery;

        setMapCenter([newLat, newLng]);
        setSearchedLocation({ lat: newLat, lng: newLng, name: placeName });
        setTimeout(() => setShowResults(true), 1200);
      } 
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setSearchQuery("Current Location");
        setSearchedLocation({ lat: latitude, lng: longitude, name: "Current Location" });
        setIsSearching(false);
        setShowResults(true);
      });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden font-sans transition-colors duration-1000 ease-in-out ${sosMode ? 'bg-slate-950 text-blue-50' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* STORM INTRO */}
      <AnimatePresence>
        {showStormIntro && <StormIntro />}
      </AnimatePresence>

      {/* MAP */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          zoomControl={false} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer 
            url={sosMode ? DARK_MAP_URL : LIGHT_MAP_URL} 
            attribution='&copy; TomTom'
          />
          <MapUpdater center={mapCenter} />

          {filteredSpots.map((spot) => (
            <Marker 
              key={spot.id} 
              position={[spot.lat, spot.lng]}
              icon={createParkingIcon(spot.price, selectedSpot === spot.id, sosMode && spot.isFloodSafe)}
              eventHandlers={{
                click: () => {
                  setSelectedSpot(spot.id);
                  setShowResults(true);
                  setMapCenter([spot.lat, spot.lng]); 
                },
              }}
            />
          ))}

          {/* NEW 3D POINTER MARKER */}
          {searchedLocation && (
            <Marker 
              position={[searchedLocation.lat, searchedLocation.lng]}
              icon={searchResultIcon}
            >
              <Popup autoPan={false} closeButton={false} className="font-sans">
                <div className="text-center pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Destination</div>
                  <div className="font-bold text-sm text-slate-900">{searchedLocation.name}</div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* HEADER */}
      <header className="relative z-20 px-6 py-4 flex justify-between items-center pointer-events-none">
        <div 
          className={`backdrop-blur-xl p-2 rounded-full shadow-lg cursor-pointer pointer-events-auto transition-all duration-500 ${sosMode ? 'bg-slate-900/60 border border-slate-700/50' : 'bg-white/90 shadow-slate-200'}`}
          onClick={() => navigate('/')}
        >
          <Logo color={sosMode ? 'light' : 'dark'} size="sm" />
        </div>
        <div className={`backdrop-blur-xl p-1.5 rounded-full shadow-lg pointer-events-auto transition-all duration-500 ${sosMode ? 'bg-slate-900/60 border border-slate-700/50' : 'bg-white/90 shadow-slate-200'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${sosMode ? 'bg-blue-900/30 text-blue-200 border-blue-500/30' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </header>

      {/* MAIN INTERFACE */}
      <main className="relative z-10 flex-1 flex flex-col justify-end pb-0 pointer-events-none">
        
        <motion.div 
          className="w-full px-4 mb-4 pointer-events-auto"
          initial={{ y: 0 }}
          animate={{ y: showResults ? 0 : -100 }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          <Card className={`border-0 shadow-2xl backdrop-blur-xl rounded-[32px] overflow-hidden transition-all duration-700 ${sosMode ? 'bg-slate-900/70 text-white shadow-blue-900/20' : 'bg-white/90 text-slate-900 shadow-slate-200/50'}`}>
            <CardContent className="p-0">
              
              {!showResults ? (
                <div className="p-6 space-y-6">
                  
                  {/* TITLE + TOGGLE */}
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm">Where to park?</h1>
                    
                    {/* --- TOGGLE WITH "NORMAL" and "FLOOD" --- */}
                    <div 
                      onClick={handleToggleRainMode}
                      className={`
                        relative w-44 h-12 rounded-full cursor-pointer transition-all duration-500 flex items-center px-1 shadow-inner
                        ${sosMode ? 'bg-slate-800 border border-blue-500/30' : 'bg-slate-100 border border-slate-200'}
                      `}
                    >
                      <div className="absolute inset-0 flex justify-between px-5 items-center text-[10px] font-extrabold tracking-widest uppercase pointer-events-none select-none">
                         <span className={sosMode ? 'text-slate-600' : 'text-slate-400'}>NORMAL</span>
                         <span className={sosMode ? 'text-blue-400' : 'text-slate-300'}>FLOOD</span>
                      </div>

                      <motion.div 
                        className={`
                          absolute h-10 w-20 rounded-full shadow-md flex items-center justify-center gap-2 z-10
                          ${sosMode ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}
                        `}
                        animate={{ x: sosMode ? '110%' : '0%' }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                         {sosMode ? <CloudLightning size={18} className="fill-white" /> : <CloudRain size={18} />}
                      </motion.div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSearch} className="relative">
                    <div className={`relative flex items-center rounded-2xl px-4 py-4 transition-all border ${sosMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-100 border-transparent focus-within:bg-white focus-within:border-emerald-500/50'}`}>
                      <div className={`w-2 h-2 rounded-full mr-4 ${sosMode ? 'bg-blue-400 shadow-[0_0_10px_#60a5fa]' : 'bg-slate-900'}`} />
                      <input 
                        type="text"
                        placeholder="Enter destination (e.g. Marina Beach)"
                        className={`bg-transparent border-none outline-none font-medium w-full text-lg placeholder:text-opacity-60 ${sosMode ? 'text-white placeholder:text-slate-400' : 'text-slate-900 placeholder:text-slate-500'}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {isSearching && <Loader2 className={`animate-spin ${sosMode ? 'text-blue-400' : 'text-emerald-600'}`} size={20} />}
                    </div>
                  </form>

                  <button 
                    onClick={handleDetectLocation}
                    className={`flex items-center gap-4 w-full p-3 rounded-2xl transition-colors text-left group ${sosMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${sosMode ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Navigation size={22} fill="currentColor" />
                    </div>
                    <div>
                      <div className="font-bold text-base">Use current location</div>
                      <div className={`text-xs ${sosMode ? 'text-slate-400' : 'text-slate-500'}`}>Enable GPS for better results</div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-4 flex items-center gap-3">
                  <div 
                    className={`flex-1 rounded-2xl px-4 py-3 flex items-center gap-3 cursor-text transition-colors ${sosMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}
                    onClick={() => setShowResults(false)}
                  >
                    <ArrowRight size={18} className={sosMode ? 'text-slate-400' : 'text-slate-500'} />
                    <span className="font-bold">{searchQuery || "Nearby Spots"}</span>
                  </div>
                  <Button size="icon" variant="ghost" className={`rounded-full ${sosMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <Filter size={18} />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* BOTTOM SHEET */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] min-h-[45vh] max-h-[60vh] overflow-y-auto relative z-30 pointer-events-auto backdrop-blur-3xl border-t ${sosMode ? 'bg-slate-900/80 text-white border-white/10' : 'bg-white/95 text-slate-900 border-transparent'}`}
            >
              <div className={`sticky top-0 z-10 pt-3 pb-2 flex justify-center ${sosMode ? 'bg-slate-900/0' : 'bg-white/0'}`}>
                <div className={`w-12 h-1.5 rounded-full ${sosMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
              </div>

              <div className="px-6 pb-8 space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-lg font-bold flex items-center gap-2">
                     {sosMode && <ShieldCheck className="text-blue-500 fill-blue-500/20" />}
                     {sosMode ? 'Safe Haven Spots' : 'Available Spots'}
                   </h2>
                   {sosMode && <span className="text-[10px] font-bold text-blue-300 bg-blue-900/40 px-2 py-1 rounded-md border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">FLOOR 1+ ONLY</span>}
                </div>
                
                <div className="space-y-4">
                  {filteredSpots.map((spot) => (
                    <motion.div 
                      key={spot.id}
                      layoutId={spot.id}
                      onClick={() => navigate(`/booking/${spot.id}`)}
                      className={`
                        relative group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden
                        ${selectedSpot === spot.id 
                          ? (sosMode ? 'bg-blue-900/30 border-blue-500/50 ring-1 ring-blue-500' : 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500') 
                          : (sosMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg')}
                      `}
                    >
                      {sosMode && spot.isFloodSafe && (
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}

                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm relative z-10">
                        <img src={spot.image} alt={spot.title} className="w-full h-full object-cover" />
                        {spot.isFloodSafe && sosMode && (
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[9px] font-bold text-center py-1 tracking-wider shadow-lg">
                            SAFE
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 z-10">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-base truncate">{spot.title}</h3>
                          <span className={`font-bold text-base ${sosMode ? 'text-blue-400' : 'text-emerald-700'}`}>₹{spot.price}</span>
                        </div>
                        <p className={`text-xs truncate mb-2 ${sosMode ? 'text-slate-400' : 'text-slate-500'}`}>{spot.address}</p>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium ${sosMode ? 'text-slate-400' : 'text-slate-400'}`}>
                            {spot.distance} away
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${spot.type === 'Private' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-purple-500/10 text-purple-500'}`}>
                            {spot.type}
                          </span>
                          {spot.isFloodSafe && (
                             <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 flex items-center gap-1 border border-blue-500/20">
                               <Umbrella size={8} /> Safe
                             </span>
                          )}
                        </div>
                      </div>
                      <div className={`hidden sm:block transition-colors ${sosMode ? 'text-slate-600 group-hover:text-blue-400' : 'text-slate-300 group-hover:text-emerald-500'}`}>
                        <ArrowRight size={20} />
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredSpots.length === 0 && (
                    <div className={`text-center py-12 rounded-3xl border border-dashed flex flex-col items-center justify-center ${sosMode ? 'bg-slate-800/20 border-slate-700/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                       <div className={`p-4 rounded-full mb-3 ${sosMode ? 'bg-slate-800' : 'bg-white'}`}>
                          <Droplets size={32} className={sosMode ? 'text-blue-500' : 'text-slate-300'} />
                       </div>
                       <p className="font-bold">No safe spots nearby.</p>
                       <p className="text-xs mt-1 opacity-70">Try searching for Malls or Multi-level parking.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}