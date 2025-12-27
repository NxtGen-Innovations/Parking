import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  LogOut,
  Plus,
  MapPin,
  Star,
  DollarSign,
  Car,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

import BACKGROUND_IMAGE from '../assets/background-hero.jpg';

// Define the shape of our Space for the frontend
interface Space {
  id: string;
  title: string;
  address: string;
  price: number;
  rating: number;
  reviews: number;
  totalBookings: number;
  earnings: number;
  isActive: boolean;
  type: 'private' | 'commercial';
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA (With Bookings Join) ---
  useEffect(() => {
    const fetchSpaces = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('parking_spaces')
          .select(`
            *,
            bookings (
              total_price,
              status
            )
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedSpaces: Space[] = (data || []).map((s: any) => {
          // Calculate Earnings & Count from related bookings
          const validBookings = s.bookings?.filter((b: any) => b.status === 'confirmed' || b.status === 'completed') || [];
          const earnings = validBookings.reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);
          const totalBookings = validBookings.length;

          return {
            id: s.id,
            title: s.title,
            address: `${s.address_street || ''}, ${s.city || ''}`,
            price: s.price_car || s.price_bike || s.price_suv || 0,
            isActive: s.is_active,
            type: s.space_type,
            rating: 5.0, // Default until review system is live
            reviews: 0,
            totalBookings,
            earnings
          };
        });

        setSpaces(formattedSpaces);
      } catch (err: any) {
        console.error("Error fetching spaces:", err);
        toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [user, toast]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalEarnings = spaces.reduce((s, x) => s + x.earnings, 0);
    const totalBookings = spaces.reduce((s, x) => s + x.totalBookings, 0);
    const activeSpaces = spaces.filter((s) => s.isActive).length;
    const avgRating = spaces.length > 0 
      ? spaces.reduce((s, x) => s + x.rating, 0) / spaces.length 
      : 0;

    return { 
      totalEarnings, 
      totalBookings, 
      activeSpaces, 
      avgRating: +avgRating.toFixed(1) 
    };
  }, [spaces]);

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  const toggleSpaceActive = async (id: string, currentStatus: boolean) => {
    // Optimistic UI Update
    setSpaces((s) => s.map((sp) => (sp.id === id ? { ...sp, isActive: !sp.isActive } : sp)));

    const { error } = await supabase
      .from('parking_spaces')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
      // Revert on error
      setSpaces((s) => s.map((sp) => (sp.id === id ? { ...sp, isActive: currentStatus } : sp)));
    } else {
      toast({ title: !currentStatus ? "Space Activated" : "Space Deactivated" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    const { error } = await supabase.from('parking_spaces').delete().eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Could not delete space.", variant: "destructive" });
    } else {
      setSpaces((s) => s.filter((x) => x.id !== id));
      toast({ title: "Space Deleted", description: "Listing removed successfully." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900">
      
      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/95 via-white/85 to-white/95 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Logo color="dark" size="sm" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm font-medium text-slate-600">Welcome, {user?.name}</div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 py-8">
        <motion.div className="w-full max-w-7xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Provider Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage your parking spaces and track earnings.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/register-space')} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-6">
                <Plus className="mr-2 h-4 w-4" /> Add New Space
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatsCard icon={DollarSign} label="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString()}`} trend="+0% this month" color="emerald" />
            <StatsCard icon={Car} label="Total Bookings" value={stats.totalBookings} color="blue" />
            <StatsCard icon={TrendingUp} label="Active Spaces" value={stats.activeSpaces} color="indigo" />
            <StatsCard icon={Star} label="Avg Rating" value={stats.avgRating} subValue="/ 5.0" color="amber" />
          </div>

          {/* Spaces List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">My Listings</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 mb-4">You haven't listed any spaces yet.</p>
                <Button variant="outline" onClick={() => navigate('/register-space')}>List your first space</Button>
              </div>
            ) : (
              <div className="grid gap-5">
                <AnimatePresence>
                  {spaces.map((space) => (
                    <motion.div key={space.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
                      <Card 
                        // Click Handler to Navigate to Detail View
                        onClick={() => navigate(`/space-dashboard/${space.id}`)}
                        className={`border-0 shadow-md transition-all duration-300 overflow-hidden cursor-pointer ${space.isActive ? 'bg-white/80' : 'bg-slate-50/60 opacity-80'} backdrop-blur-sm hover:shadow-lg hover:translate-y-[-2px]`}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            
                            {/* Info Section */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-slate-900 truncate">{space.title}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${space.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{space.isActive ? 'Active' : 'Inactive'}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-blue-50 text-blue-600 border border-blue-100">{space.type}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1"><MapPin size={14} className="text-slate-400" />{space.address}</div>
                              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-slate-700">{space.rating}</span><span>({space.reviews} reviews)</span></div>
                            </div>

                            {/* Stats Section */}
                            <div className="flex items-center gap-8 md:gap-12 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                              <div className="text-left"><div className="text-lg font-bold text-slate-900">₹{space.price}</div><div className="text-xs text-slate-400 uppercase tracking-wide">/ hour</div></div>
                              <div className="text-left"><div className="text-lg font-bold text-slate-900">{space.totalBookings}</div><div className="text-xs text-slate-400 uppercase tracking-wide">Bookings</div></div>
                              <div className="text-left"><div className="text-lg font-bold text-emerald-600">₹{space.earnings.toLocaleString()}</div><div className="text-xs text-slate-400 uppercase tracking-wide">Earned</div></div>
                            </div>

                            {/* Actions Menu (Stop Propagation to prevent card click) */}
                            <div className="flex items-center justify-end md:border-l border-slate-100 md:pl-6" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-100"><MoreVertical size={18} /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => toggleSpaceActive(space.id, space.isActive)}>{space.isActive ? <><ToggleLeft className="mr-2 h-4 w-4" /> Deactivate</> : <><ToggleRight className="mr-2 h-4 w-4" /> Activate</>}</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/register-space?edit=${space.id}`)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(space.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </motion.div>
      </main>
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, subValue, trend, color }: any) {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-md">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colorStyles[color as keyof typeof colorStyles] || "bg-slate-100"}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{value}</span>
              {subValue && <span className="text-sm text-slate-400">{subValue}</span>}
            </div>
            {trend && <p className="text-xs font-medium text-emerald-600 mt-0.5">{trend}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}