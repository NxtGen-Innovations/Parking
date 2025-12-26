import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Navigation as NavIcon, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TOMTOM_API_KEY = "LH8w4oyNpv19Ok0SDqxyayikvpw5DrTC";
const DARK_MAP_URL = `https://api.tomtom.com/map/1/tile/basic/night/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`;

const carIcon = L.divIcon({
  className: 'car-pin',
  html: `<div style="background:#3b82f6; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 15px #3b82f6;"></div>`,
  iconSize: [20, 20],
});

const destIcon = L.divIcon({
  className: 'dest-pin',
  html: `<div style="font-size:30px;">🏁</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

export default function Navigation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, parking_spaces(*)')
        .eq('id', bookingId)
        .single();
      
      if (!error && data) setSpot(data.parking_spaces);
    };
    fetchDetails();

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [bookingId]);

  if (!spot) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-50"><Loader2 className="animate-spin" /></div>;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-screen w-full relative bg-slate-950 flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between text-white">
          <Button variant="ghost" size="icon" onClick={() => navigate('/my-bookings')} className="text-white hover:bg-white/10"><ArrowLeft /></Button>
          <div className="text-center"><h2 className="font-bold text-lg">{spot.title}</h2><p className="text-xs text-slate-300">{spot.address_street}</p></div><div className="w-10" />
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer center={[spot.latitude || 13.0827, spot.longitude || 80.2707]} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url={DARK_MAP_URL} />
          <Marker position={[spot.latitude || 13.0827, spot.longitude || 80.2707]} icon={destIcon}><Popup>Parking Spot</Popup></Marker>
          {userLocation && <Marker position={userLocation} icon={carIcon} />}
        </MapContainer>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-slate-900 rounded-t-3xl border-t border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><MapPin size={24} /></div>
          <div><p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Destination</p><p className="text-white font-bold text-lg">{spot.title}</p></div>
        </div>
        <Button onClick={openGoogleMaps} className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.5)] animate-pulse"><NavIcon className="mr-2" /> Start Navigation</Button>
      </div>
    </div>
  );
}