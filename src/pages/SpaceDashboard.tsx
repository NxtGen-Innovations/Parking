import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Users, Clock, Calendar, Car, Bike, Truck, 
  CheckCircle, XCircle, MoreHorizontal, Phone, Hash
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import BACKGROUND_IMAGE from '../assets/background-hero.jpg';

export default function SpaceDashboard() {
  const { id } = useParams(); // Get Space ID from URL
  const navigate = useNavigate();
  
  const [space, setSpace] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [occupancy, setOccupancy] = useState({
    car: { total: 0, booked: 0 },
    bike: { total: 0, booked: 0 },
    suv: { total: 0, booked: 0 },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // 1. Fetch Space Details (Capacity)
      const { data: spaceData, error: spaceError } = await supabase
        .from('parking_spaces')
        .select('*')
        .eq('id', id)
        .single();

      if (spaceError) {
        console.error(spaceError);
        navigate('/provider-dashboard');
        return;
      }
      setSpace(spaceData);

      // 2. Fetch Bookings (Who booked) - Join with Profiles for Name/Phone
      // Assuming 'profiles' table has 'full_name' and 'phone_number'
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:driver_id (full_name, phone_number, avatar_url) 
        `)
        .eq('space_id', id)
        .order('start_time', { ascending: false }); // Newest first

      if (!bookingError && bookingData) {
        setBookings(bookingData);
        calculateOccupancy(spaceData, bookingData);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const calculateOccupancy = (spaceData: any, bookingList: any[]) => {
    const now = new Date();
    
    // Filter active bookings (Start time passed, End time in future, Status confirmed)
    const activeBookings = bookingList.filter((b: any) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return b.status === 'confirmed' && now >= start && now <= end;
    });

    // NOTE: In a real app, you need a 'vehicle_type' column in 'bookings' table 
    // to separate car vs bike counts precisely. 
    // For this demo, we will estimate or assume mostly cars if not specified.
    
    // Mocking counts for demo purposes since 'vehicle_type' might be missing in bookings table schema
    // In production: Count activeBookings where vehicle_type === 'car'
    const carBooked = activeBookings.length; 

    setOccupancy({
      car: { total: spaceData.slots_car || 0, booked: carBooked }, // Simplified logic
      bike: { total: spaceData.slots_bike || 0, booked: 0 },
      suv: { total: spaceData.slots_suv || 0, booked: 0 },
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col relative font-sans text-slate-900 bg-slate-50">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-slate-50" />
      
      {/* Header */}
      <header className="relative z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/provider-dashboard')}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{space.title}</h1>
            <p className="text-xs text-slate-500">{space.address_street}, {space.city}</p>
          </div>
        </div>
        <Logo color="dark" size="sm" />
      </header>

      <main className="relative z-10 p-4 max-w-6xl mx-auto w-full space-y-6">
        
        {/* --- 1. LIVE OCCUPANCY CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OccupancyCard 
            label="Car Slots" 
            icon={Car} 
            total={occupancy.car.total} 
            booked={occupancy.car.booked} 
            color="blue" 
          />
          <OccupancyCard 
            label="Bike Slots" 
            icon={Bike} 
            total={occupancy.bike.total} 
            booked={occupancy.bike.booked} 
            color="emerald" 
          />
          <OccupancyCard 
            label="SUV/Truck Slots" 
            icon={Truck} 
            total={occupancy.suv.total} 
            booked={occupancy.suv.booked} 
            color="amber" 
          />
        </div>

        {/* --- 2. BOOKING HISTORY TABLE --- */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="text-slate-400" size={20} /> Booking History
              </CardTitle>
              <div className="text-sm text-slate-500">
                Total Bookings: <span className="font-bold text-slate-900">{bookings.length}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No bookings yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-bold">Driver</th>
                      <th className="px-6 py-4 font-bold">Time Slot</th>
                      <th className="px-6 py-4 font-bold">Duration</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => (
                      <motion.tr 
                        key={booking.id} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                              {booking.profiles?.avatar_url ? (
                                <img src={booking.profiles.avatar_url} className="w-full h-full object-cover" />
                              ) : (
                                <Users size={16} className="text-slate-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{booking.profiles?.full_name || 'Guest User'}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Phone size={10} /> {booking.profiles?.phone_number || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">
                              {format(new Date(booking.start_time), 'MMM dd, yyyy')}
                            </span>
                            <span className="text-xs text-slate-500">
                              {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {Math.ceil((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60))} hrs
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          ₹{booking.total_price}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function OccupancyCard({ label, icon: Icon, total, booked, color }: any) {
  const free = Math.max(0, total - booked);
  const percentage = total > 0 ? (booked / total) * 100 : 0;
  
  const colors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500"
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-slate-100`}>
              <Icon size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{free} <span className="text-sm text-slate-400 font-normal">/ {total} Free</span></h3>
            </div>
          </div>
          {/* Circular Progress (CSS simplified) */}
          <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-4 border-slate-100">
             <span className="text-[10px] font-bold text-slate-600">{Math.round(percentage)}%</span>
             {/* Simulating progress border would require SVG, keeping simple for code block limit */}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${colors[color as keyof typeof colors]}`} 
            style={{ width: `${percentage}%` }} 
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
          <span>{booked} Occupied</span>
          <span>{free} Available</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-blue-50 text-blue-700 border-blue-100",
    cancelled: "bg-red-50 text-red-700 border-red-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100"
  };

  const labels = {
    confirmed: "Active",
    completed: "Done",
    cancelled: "Cancelled",
    pending: "Pending"
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${styles[status as keyof typeof styles] || styles.pending}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}