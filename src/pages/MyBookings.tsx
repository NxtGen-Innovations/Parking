import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar, MapPin, Navigation, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// --- TYPES ---
interface Booking {
  id: string;
  parking_space_id: string;
  driver_id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_price: number;
  status: string;
  parking_spaces: {
    title: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    is_flood_safe: boolean;
  };
}

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, parking_spaces(title, address_street, city, images, latitude, longitude)')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/browse')}><ArrowLeft size={20} /></Button>
        <h1 className="text-lg font-bold text-slate-900">My Bookings</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white p-6 rounded-full inline-block shadow-sm mb-4"><Calendar size={32} className="text-slate-300" /></div>
            <h3 className="text-lg font-bold text-slate-700">No bookings yet</h3>
            <p className="text-slate-500 mb-6">Find a spot and book it today.</p>
            <Button onClick={() => navigate('/browse')}>Find Parking</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500 overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{booking.parking_spaces?.title || 'Parking Spot'}</h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1"><MapPin size={14} />{booking.parking_spaces?.address}, {booking.parking_spaces?.city}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>{booking.status}</span>
                    </div>
                    <div className="flex gap-6 mb-6 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Start Time</p>
                        <p className="font-semibold text-slate-700 flex items-center gap-2"><Calendar size={14} className="text-emerald-500"/> {new Date(booking.booking_date).toLocaleDateString()} <span className="text-slate-300">|</span> {booking.booking_time}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Paid</p>
                        <p className="font-semibold text-slate-900">₹{booking.total_price}</p>
                      </div>
                    </div>
                    {booking.status === 'confirmed' && (
                      <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => navigate(`/navigation/${booking.id}`)}><Navigation size={16} className="mr-2" /> Navigate to Spot</Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}