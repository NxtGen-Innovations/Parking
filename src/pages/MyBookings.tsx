import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Calendar, MapPin, Navigation, 
  Loader2, ScanLine, LogOut, MessageCircle, XCircle, Ban 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ChatSheet } from '@/components/ChatSheet';

// --- TYPES ---
interface Booking {
  id: string;
  space_id: string;
  driver_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'parked' | 'completed' | 'cancelled';
  parking_spaces: {
    title: string;
    address_street: string;
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
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, parking_spaces(title, address_street, city, latitude, longitude)')
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

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // --- LOGIC: Check if cancellation is allowed ( > 2 hours before start) ---
  const isCancellable = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diffInHours = (start - now) / (1000 * 60 * 60);
    return diffInHours >= 2;
  };

  // --- ACTION: Cancel Booking ---
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel? This action cannot be undone.")) return;
    
    setCancellingId(bookingId);
    try {
      console.log("Attempting to cancel booking ID:", bookingId); // Debug Log

      // 1. Send Update Request
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select(); // Returns the updated row

      if (error) {
        console.error("Supabase Update Error:", error);
        throw error;
      }

      console.log("Cancellation Success:", data);

      toast({ title: "Booking Cancelled", description: "Your reservation has been cancelled." });
      
      // 2. Refresh List to update UI
      fetchBookings(); 

    } catch (error: any) {
      console.error("Catch Error:", error);
      toast({ title: "Error", description: error.message || "Could not cancel booking.", variant: "destructive" });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'parked': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  // Helper to determine card border/bg styles based on status
  const getCardStyle = (status: string) => {
    if (status === 'cancelled') return 'border-red-200 bg-red-50/50 opacity-90';
    if (status === 'parked') return 'border-blue-200 bg-white border-l-4 border-l-blue-500';
    if (status === 'confirmed') return 'border-emerald-200 bg-white border-l-4 border-l-emerald-500';
    return 'border-slate-200 bg-slate-50 border-l-4 border-l-slate-300';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/browse')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-bold text-slate-900">My Bookings</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white p-6 rounded-full inline-block shadow-sm mb-4">
              <Calendar size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No bookings yet</h3>
            <p className="text-slate-500 mb-6">Find a spot and book it today.</p>
            <Button onClick={() => navigate('/browse')}>Find Parking</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div 
                key={booking.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`shadow-sm overflow-hidden transition-all border ${getCardStyle(booking.status)}`}>
                  <CardContent className="p-5">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className={booking.status === 'cancelled' ? 'opacity-50' : ''}>
                        <h3 className="font-bold text-lg text-slate-900">
                          {booking.parking_spaces?.title || 'Parking Spot'}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <MapPin size={14} />
                          {booking.parking_spaces?.address_street}, {booking.parking_spaces?.city}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className={`flex gap-6 mb-6 text-sm ${booking.status === 'cancelled' ? 'opacity-50 grayscale' : ''}`}>
                      <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Start Time</p>
                        <p className="font-semibold text-slate-700 flex items-center gap-2">
                          <Calendar size={14} className="text-emerald-500"/> 
                          {new Date(booking.start_time).toLocaleDateString()} 
                          <span className="text-slate-300">|</span> 
                          {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Paid</p>
                        <p className={`font-semibold text-slate-900 ${booking.status === 'cancelled' ? 'line-through decoration-red-500' : ''}`}>
                          ₹{booking.total_price}
                        </p>
                      </div>
                    </div>

                    {/* --- CONFIRMED STATE --- */}
                    {booking.status === 'confirmed' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Button className="bg-slate-900 hover:bg-slate-800" onClick={() => navigate(`/navigation/${booking.id}`)}>
                            <Navigation size={16} className="mr-2" /> Navigate
                          </Button>
                          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate(`/scan-qr?bookingId=${booking.id}&action=checkin`)}>
                            <ScanLine size={16} className="mr-2" /> Scan to Park
                          </Button>
                        </div>
                        
                        {/* Cancel Option */}
                        {isCancellable(booking.start_time) ? (
                          <Button 
                            variant="outline"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? <Loader2 className="animate-spin h-4 w-4" /> : <><XCircle size={16} className="mr-2" /> Cancel Booking</>}
                          </Button>
                        ) : (
                          <p className="text-[10px] text-slate-400 text-center italic">Cancellation unavailable (less than 2 hours to start)</p>
                        )}
                      </div>
                    )}

                    {/* --- PARKED STATE --- */}
                    {booking.status === 'parked' && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                        <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Vehicle Parked
                        </div>
                        <p className="text-xs text-blue-600/80 mb-4">Timer is running. Scan QR to exit.</p>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate(`/scan-qr?bookingId=${booking.id}&action=checkout`)}>
                          <LogOut size={16} className="mr-2" /> Scan to Leave
                        </Button>
                      </div>
                    )}

                    {/* --- CANCELLED STATE --- */}
                    {booking.status === 'cancelled' && (
                      <div className="mt-4 p-3 bg-red-100 rounded-lg flex items-center justify-center gap-2 text-red-800 text-sm font-bold border border-red-200">
                        <Ban size={16} /> Booking Cancelled
                      </div>
                    )}

                    {/* --- CHAT (Only for active states) --- */}
                    {(booking.status === 'confirmed' || booking.status === 'parked') && (
                      <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
                        <ChatSheet 
                          bookingId={booking.id} 
                          partnerName="Parking Host" 
                          trigger={
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                              <MessageCircle size={16} className="mr-2" /> Chat with Host
                            </Button>
                          }
                        />
                      </div>
                    )}

                    {/* --- REBOOK --- */}
                    {(booking.status === 'completed' || booking.status === 'cancelled') && (
                       <div className="mt-2 text-center">
                          <Button variant="outline" size="sm" className="w-full text-slate-500 mt-2" onClick={() => navigate('/browse')}>Book Again</Button>
                       </div>
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