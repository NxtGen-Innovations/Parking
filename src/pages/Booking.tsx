import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, MapPin, Star, Clock, Car, Calendar, Check, 
  LogOut, Shield, Umbrella, Video, UserCheck, Loader2, IndianRupee, Navigation as NavIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';

import BACKGROUND_IMAGE from '../assets/background-hero.jpg';

interface Spot {
  id: string;
  title: string;
  address_street: string;
  city: string;
  price_car: number;
  rating: number; 
  images: string[];
  description: string;
  has_cctv: boolean;
  has_guard: boolean;
  is_flood_safe: boolean;
  owner_id: string;
}

export default function Booking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('2');

  useEffect(() => {
    const fetchSpot = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('parking_spaces')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setSpot(data);
      } catch (error) {
        console.error("Error fetching spot:", error);
        toast({ title: "Error", description: "Could not load parking spot details.", variant: "destructive" });
        navigate('/browse');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpot();
  }, [id, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  const hourlyRate = spot?.price_car || 50; 
  const totalPrice = hourlyRate * parseInt(duration || '0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !spot) return;

    if (!date || !startTime || !duration) {
      toast({ title: "Missing Info", description: "Please fill in all booking details.", variant: "destructive" });
      return;
    }

    setIsBooking(true);

    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60 * 60 * 1000);

      const payload = {
        space_id: spot.id,
        driver_id: user.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        total_price: totalPrice,
        status: 'confirmed'
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if(data) setConfirmedBookingId(data.id);
      setIsSuccess(true);
      toast({ title: "Booking Confirmed!", description: "Your spot has been reserved successfully." });

    } catch (error: any) {
      console.error("Booking error:", error);
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  if (!spot) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col relative font-sans text-slate-900">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} />
        <div className="absolute inset-0 z-0 bg-white/95 backdrop-blur-sm" />
        
        <main className="relative z-10 flex-1 flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Card className="w-full max-w-md text-center rounded-3xl bg-white/80 border-white/60 shadow-2xl p-8 backdrop-blur-xl">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Booking Confirmed!</h2>
              <p className="text-slate-600 mb-6">Your spot at <strong>{spot.title}</strong> is reserved.</p>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Date</span>
                  <span className="font-semibold text-slate-900">{date}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Time</span>
                  <span className="font-semibold text-slate-900">{startTime} ({duration} hrs)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-sm font-bold text-slate-700">Total Paid</span>
                  <span className="text-lg font-bold text-emerald-600">₹{totalPrice}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate(`/navigation/${confirmedBookingId}`)} 
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
                >
                  <NavIcon size={18} className="mr-2" /> Navigate to Spot
                </Button>
                <Button variant="outline" onClick={() => navigate('/my-bookings')} className="w-full h-12 rounded-xl border-slate-300">
                  View My Bookings
                </Button>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  const spotImage = spot.images && spot.images.length > 0 ? spot.images[0] : 'https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900">
      <div className="fixed inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95 backdrop-blur-[2px]" />

      <header className="relative z-20 w-full border-b border-slate-200/60 bg-white/60 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Logo color="dark" size="md" />
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm font-medium text-slate-600">Hi, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50"><LogOut size={18} /></Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 mt-6">
        <Button variant="ghost" onClick={() => navigate('/browse')} className="text-slate-500 hover:text-slate-900 hover:bg-white/50 pl-0"><ArrowLeft size={18} className="mr-2" />Back to Search</Button>
      </div>

      <main className="relative z-10 flex-1 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl overflow-hidden rounded-3xl h-full">
                <div className="h-64 w-full bg-slate-200 relative">
                  <img src={spotImage} alt={spot.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider text-slate-700">Commercial</div>
                </div>
                <CardContent className="p-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{spot.title}</h1>
                  <div className="flex items-center gap-2 text-slate-500 mb-6"><MapPin size={18} /><span>{spot.address_street}, {spot.city}</span></div>
                  <div className="flex gap-4 mb-8">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 text-amber-700 font-bold text-sm"><Star size={16} className="fill-amber-500 text-amber-500" />5.0</div>
                    {spot.is_flood_safe && <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-blue-600 font-bold text-sm"><Umbrella size={16} />Flood Safe</div>}
                  </div>
                  <div className="space-y-4 mb-8">
                    <h3 className="font-bold text-slate-900">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {spot.has_cctv && <div className="flex items-center gap-2 text-sm text-slate-600"><Video size={16} className="text-emerald-500" /> CCTV Surveillance</div>}
                      {spot.has_guard && <div className="flex items-center gap-2 text-sm text-slate-600"><UserCheck size={16} className="text-emerald-500" /> Security Guard</div>}
                      <div className="flex items-center gap-2 text-sm text-slate-600"><Shield size={16} className="text-emerald-500" /> Gated Complex</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200"><div className="text-sm text-slate-500 mb-1">Price per hour</div><div className="text-3xl font-bold text-emerald-600">₹{hourlyRate}</div></div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden sticky top-24">
                <CardHeader className="bg-slate-900 text-white p-6"><CardTitle className="text-xl font-bold flex items-center gap-2"><Calendar className="text-emerald-400" /> Reserve your spot</CardTitle></CardHeader>
                <CardContent className="p-8 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2"><Label htmlFor="date" className="text-slate-700 font-semibold">Date</Label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-emerald-500" required /></div></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="time" className="text-slate-700 font-semibold">Start Time</Label><div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><Input id="time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-emerald-500" required /></div></div>
                      <div className="space-y-2"><Label htmlFor="duration" className="text-slate-700 font-semibold">Duration (Hours)</Label><div className="relative"><Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><Input id="duration" type="number" min="1" max="24" value={duration} onChange={(e) => setDuration(e.target.value)} className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-emerald-500" required /></div></div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div className="flex justify-between text-sm text-slate-600"><span>Rate</span><span>₹{hourlyRate} x {duration} hrs</span></div>
                      <div className="flex justify-between text-sm text-slate-600"><span>Platform Fee</span><span>₹10</span></div>
                      <div className="h-px bg-slate-200 my-2" />
                      <div className="flex justify-between text-lg font-bold text-slate-900"><span>Total to Pay</span><span>₹{totalPrice + 10}</span></div>
                    </div>
                    <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20" disabled={isBooking}>{isBooking ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Processing...</span> : 'Confirm & Pay'}</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}