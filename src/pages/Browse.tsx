import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet'; 
import { 
  Navigation, 
  ArrowRight,
  Loader2,
  Filter,
  Star,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMAGES ---
import PARKING_1 from '../assets/parking1.jpg'; 
import PARKING_2 from '../assets/image.png';

// --- TOMTOM CONFIGURATION ---
// REPLACE WITH YOUR KEY
const TOMTOM_API_KEY = "LH8w4oyNpv19Ok0SDqxyayikvpw5DrTC"; 

const MAP_TILE_URL = `https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`;

// --- CUSTOM ICONS ---

// 1. Parking Spot Pin (Green/Price)
const createCustomIcon = (price: number, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${isSelected ? '#059669' : '#1e293b'};
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        text-align: center;
        width: max-content;
        transform: translate(-50%, -50%);
        border: 2px solid white;
        font-family: sans-serif;
      ">
        ₹${price}
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${isSelected ? '#059669' : '#1e293b'};
        margin: -2px auto 0;
      "></div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

// 2. Search Result Pin (Red Destination Marker)
const searchResultIcon = L.divIcon({
  className: 'search-pin',
  html: `
    <div style="position: relative; display: flex; justify-content: center; align-items: center;">
      <div style="
        width: 16px;
        height: 16px;
        background-color: #ef4444; 
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 2px #ef4444, 0 4px 10px rgba(0,0,0,0.4);
        animation: pulse 1.5s infinite;
      "></div>
      <div style="
        position: absolute;
        bottom: -24px;
        width: 2px;
        height: 24px;
        background: linear-gradient(to bottom, #ef4444, transparent);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12], // Centered
});

// --- MOCK DATA ---
const NEARBY_SPOTS = [
  {
    id: '1',
    title: 'City Center Mall',
    address: 'Anna Salai, Chennai',
    price: 40,
    rating: 4.8,
    distance: '2 min',
    image: PARKING_2,
    type: 'Commercial',
    lat: 13.0827,
    lng: 80.2707,
  },
  {
    id: '2',
    title: 'Greenways Driveway',
    address: 'Adyar, Chennai',
    price: 25,
    rating: 4.5,
    distance: '5 min',
    image: PARKING_1,
    type: 'Private',
    lat: 13.0012,
    lng: 80.2565,
  },
  {
    id: '3',
    title: 'Metro Station Hub',
    address: 'Guindy, Chennai',
    price: 30,
    rating: 4.2,
    distance: '8 min',
    image: PARKING_2,
    type: 'Commercial',
    lat: 13.0067,
    lng: 80.2206,
  },
];

// Helper: Moves the map when center changes
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
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]);
  
  // Stores the result of a search (name + coords)
  const [searchedLocation, setSearchedLocation] = useState<{lat: number, lng: number, name: string} | null>(null);

  // --- HANDLE SEARCH ---
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

        // 1. Move Map
        setMapCenter([newLat, newLng]);
        
        // 2. Set Marker Data
        setSearchedLocation({ 
          lat: newLat, 
          lng: newLng,
          name: placeName
        });
        
        // 3. Show "Available Spots" sheet (Simulating finding spots near destination)
        setTimeout(() => setShowResults(true), 1200);
      } 
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // --- DETECT LOCATION ---
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
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900 bg-slate-50">
      
      {/* --- REAL MAP BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={12} 
          zoomControl={false} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer 
            url={MAP_TILE_URL} 
            attribution='&copy; TomTom'
          />
          
          <MapUpdater center={mapCenter} />

          {/* Render Parking Pins */}
          {NEARBY_SPOTS.map((spot) => (
            <Marker 
              key={spot.id} 
              position={[spot.lat, spot.lng]}
              icon={createCustomIcon(spot.price, selectedSpot === spot.id)}
              eventHandlers={{
                click: () => {
                  setSelectedSpot(spot.id);
                  setShowResults(true);
                  setMapCenter([spot.lat, spot.lng]); 
                },
              }}
            />
          ))}

          {/* --- SEARCH RESULT POINTER (The Red Flag) --- */}
          {searchedLocation && (
            <Marker 
              position={[searchedLocation.lat, searchedLocation.lng]}
              icon={searchResultIcon}
            >
              <Popup autoPan={false} closeButton={false} className="font-sans font-semibold">
                <div className="text-center text-xs">
                  Destination<br/>
                  <span className="text-emerald-600">{searchedLocation.name}</span>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* --- HEADER --- */}
      <header className="relative z-20 px-6 py-4 flex justify-between items-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg cursor-pointer pointer-events-auto hover:scale-105 transition-transform" onClick={() => navigate('/')}>
          <Logo color="dark" size="sm" />
        </div>
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg pointer-events-auto">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-200">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </header>

      {/* --- MAIN INTERFACE --- */}
      <main className="relative z-10 flex-1 flex flex-col justify-end pb-0 pointer-events-none">
        
        {/* Search Bar Container */}
        <motion.div 
          className="w-full px-4 mb-4 pointer-events-auto"
          initial={{ y: 0 }}
          animate={{ y: showResults ? 0 : -100 }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-[24px] overflow-hidden">
            <CardContent className="p-0">
              
              {!showResults ? (
                <div className="p-6 space-y-6">
                  <h1 className="text-2xl font-bold text-slate-800">Where do you want to park?</h1>
                  
                  <form onSubmit={handleSearch} className="relative">
                    <div className="relative flex items-center bg-slate-100 rounded-xl px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white border border-transparent focus-within:border-emerald-500/50">
                      <div className="w-2 h-2 bg-slate-900 rounded-full mr-4" />
                      <input 
                        type="text"
                        placeholder="Enter destination (e.g. Marina Beach)"
                        className="bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-500 font-medium w-full text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {isSearching && <Loader2 className="animate-spin text-emerald-600" size={20} />}
                    </div>
                  </form>

                  <button 
                    onClick={handleDetectLocation}
                    className="flex items-center gap-4 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 transition-colors">
                      <Navigation size={20} fill="currentColor" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Use current location</div>
                      <div className="text-xs text-slate-500">Enable GPS for better results</div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-4 flex items-center gap-3">
                  <div 
                    className="flex-1 bg-slate-100 rounded-xl px-4 py-3 flex items-center gap-3 cursor-text hover:bg-slate-200 transition-colors"
                    onClick={() => setShowResults(false)}
                  >
                    <ArrowRight size={18} className="text-slate-500" />
                    <span className="font-medium text-slate-900">{searchQuery || "Nearby Spots"}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
                    <Filter size={18} />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results List (Bottom Sheet) */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] min-h-[45vh] max-h-[60vh] overflow-y-auto relative z-30 pointer-events-auto"
            >
              <div className="sticky top-0 bg-white z-10 pt-3 pb-2 flex justify-center">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>

              <div className="px-6 pb-8 space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Available Spots</h2>
                
                <div className="space-y-4">
                  {NEARBY_SPOTS.map((spot) => (
                    <motion.div 
                      key={spot.id}
                      layoutId={spot.id}
                      onClick={() => navigate(`/booking/${spot.id}`)}
                      className={`
                        relative group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer
                        ${selectedSpot === spot.id 
                          ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                          : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg'}
                      `}
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img src={spot.image} alt={spot.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-900 text-base truncate">{spot.title}</h3>
                          <span className="font-bold text-emerald-700 text-base">₹{spot.price}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mb-2">{spot.address}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-medium">
                            {spot.distance} away
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${spot.type === 'Private' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {spot.type}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block text-slate-300 group-hover:text-emerald-500 transition-colors">
                        <ArrowRight size={20} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}