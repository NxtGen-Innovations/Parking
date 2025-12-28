import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Clock, Car, Bike, Truck, 
  Users, Phone, QrCode, MessageSquare 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import QRCode from "react-qr-code";
import { ChatSheet } from '@/components/ChatSheet';

export default function SpaceDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [space, setSpace] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Occupancy State
  const [occupancy, setOccupancy] = useState({
    car: { total: 0, booked: 0 },
    bike: { total: 0, booked: 0 },
    suv: { total: 0, booked: 0 },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // 1. Fetch Space Details
      const { data: spaceData, error: spaceError } = await supabase
        .from('parking_spaces')
        .select('*')
        .eq('id', id)
        .single();

      if (spaceError) {
        console.error("Error fetching space:", spaceError);
        navigate('/provider-dashboard');
        return;
      }
      setSpace(spaceData);

      // 2. Fetch Bookings + Profiles + Messages (for unread counts)
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
        setBookings(bookingData);
        calculateOccupancy(spaceData, bookingData);
      }
      
      setLoading(false);
    };

    fetchData();

    // 3. REALTIME SUBSCRIPTION FOR NOTIFICATIONS
    // This makes the badge update instantly when a new message arrives
    const messageChannel = supabase
      .channel('dashboard-chat-notifications')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          setBookings((prevBookings) => 
            prevBookings.map((b) => {
              if (b.id === payload.new.booking_id) {
                // Add the new message to the state to update the count
                return {
                  ...b,
                  messages: [...(b.messages || []), payload.new]
                };
              }
              return b;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };

  }, [id, navigate]);

  const calculateOccupancy = (spaceData: any, bookingList: any[]) => {
    const now = new Date();
    
    // Calculate currently active bookings (Parked OR Confirmed & Ongoing)
    const activeBookings = bookingList.filter((b: any) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return (b.status === 'parked' || (b.status === 'confirmed' && now >= start && now <= end));
    });

    // Note: To be precise, you should check b.vehicle_type here.
    // For this dashboard view, we count total active.
    const activeCount = activeBookings.length; 

    setOccupancy({
      car: { total: spaceData.slots_car || 0, booked: activeCount },
      bike: { total: spaceData.slots_bike || 0, booked: 0 },
      suv: { total: spaceData.slots_suv || 0, booked: 0 },
    });
  };

  // Helper to count unread messages from the driver
  const getUnreadCount = (msgs: any[]) => {
    if (!msgs || !user) return 0;
    // Count messages where I am NOT the sender and is_read is false
    return msgs.filter(m => m.sender_id !== user.id && !m.is_read).length;
  };

  // Function to locally mark messages read when opening chat
  const handleChatOpen = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId && b.messages) {
        return {
          ...b,
          messages: b.messages.map((m: any) => ({ ...m, is_read: true }))
        };
      }
      return b;
    }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col relative font-sans text-slate-900 bg-slate-50">
      
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
        
        {/* --- QR CODE CARD --- */}
        <Card className="border-0 shadow-sm bg-slate-900 text-white overflow-hidden">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                <QrCode /> DIGITAL GATE PASS
              </div>
              <h2 className="text-2xl font-bold mb-2">Entry & Exit QR Code</h2>
              <p className="text-slate-400 text-sm max-w-md">
                Drivers must scan this code to <strong>Check-In</strong> (Start Timer) and <strong>Check-Out</strong> (End Parking). 
                Print this card and place it at the parking entrance.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-lg shadow-emerald-500/20">
              <QRCode 
                value={JSON.stringify({ spaceId: space.id })} 
                size={120} 
                level="H" 
              />
            </div>
          </CardContent>
        </Card>

        {/* --- LIVE OCCUPANCY --- */}
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

        {/* --- BOOKING HISTORY & CHAT --- */}
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
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-center">Chat</th>
                      <th className="px-6 py-4 font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => {
                      const unreadCount = getUnreadCount(booking.messages);
                      
                      return (
                        <motion.tr 
                          key={booking.id} 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Driver Info */}
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

                          {/* Time */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">
                                {format(new Date(booking.start_time), 'MMM dd')}
                              </span>
                              <span className="text-xs text-slate-500">
                                {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <StatusBadge status={booking.status} />
                          </td>

                          {/* Chat Button with Badge */}
                          <td className="px-6 py-4 text-center">
                            <ChatSheet 
                              bookingId={booking.id}
                              partnerName={booking.profiles?.full_name || 'Driver'}
                              onOpenChange={(open) => {
                                // Clear badge locally when chat opens
                                if (open) handleChatOpen(booking.id);
                              }}
                              trigger={
                                <div className="relative inline-block">
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors">
                                    <MessageSquare size={16} />
                                  </Button>
                                  {unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                                      {unreadCount}
                                    </div>
                                  )}
                                </div>
                              }
                            />
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-right font-bold text-slate-900">
                            ₹{booking.total_price}
                          </td>
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
    </div>
  );
}

// --- SUB-COMPONENTS ---

function OccupancyCard({ label, icon: Icon, total, booked, color }: any) {
  const free = Math.max(0, total - booked);
  const percentage = total > 0 ? (booked / total) * 100 : 0;
  
  const colors: any = {
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
          <div className="text-xs font-bold text-slate-600 border px-2 py-1 rounded-full">
             {Math.round(percentage)}%
          </div>
        </div>
        
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${colors[color]}`} 
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
  const styles: any = {
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    parked: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-700 border-red-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100"
  };

  const labels: any = {
    confirmed: "Booked",
    parked: "Parked Now",
    completed: "Completed",
    cancelled: "Cancelled",
    pending: "Pending"
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}