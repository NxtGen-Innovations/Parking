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
  LayoutDashboard,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Zap,
  ShieldCheck,
  Clock, // Added
  Moon // Added
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES (Updated to include Timing) ---
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
  // New Timing Fields
  availabilityType: '24/7' | 'custom';
  availableFrom: string | null;
  availableTo: string | null;
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
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
          const validBookings = s.bookings?.filter((b: any) => b.status === 'confirmed' || b.status === 'completed') || [];
          const earnings = validBookings.reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);

          return {
            id: s.id,
            title: s.title,
            address: `${s.address_street || ''}, ${s.city || ''}`,
            price: s.price_car || s.price_bike || s.price_suv || 0,
            isActive: s.is_active,
            type: s.space_type,
            rating: 5.0, 
            reviews: 0,
            totalBookings: validBookings.length,
            earnings,
            // Map Timing Fields
            availabilityType: s.availability_type || '24/7',
            availableFrom: s.available_from,
            availableTo: s.available_to
          };
        });

        setSpaces(formattedSpaces);
      } catch (err: any) {
        console.error("Error fetching spaces:", err);
        toast({ title: "Error", description: "Failed to load dashboard.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [user, toast]);

  // --- STATS ---
  const stats = useMemo(() => {
    const totalEarnings = spaces.reduce((s, x) => s + x.earnings, 0);
    const totalBookings = spaces.reduce((s, x) => s + x.totalBookings, 0);
    const activeSpaces = spaces.filter((s) => s.isActive).length;
    const avgRating = spaces.length > 0 
      ? spaces.reduce((s, x) => s + x.rating, 0) / spaces.length 
      : 0;

    return { totalEarnings, totalBookings, activeSpaces, avgRating: avgRating.toFixed(1) };
  }, [spaces]);

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  const toggleSpaceActive = async (id: string, currentStatus: boolean) => {
    setSpaces((s) => s.map((sp) => (sp.id === id ? { ...sp, isActive: !sp.isActive } : sp)));
    const { error } = await supabase.from('parking_spaces').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
      setSpaces((s) => s.map((sp) => (sp.id === id ? { ...sp, isActive: currentStatus } : sp))); // revert
    } else {
      toast({ title: !currentStatus ? "Space Activated" : "Space Deactivated" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from('parking_spaces').delete().eq('id', id);
    if (error) toast({ title: "Error", description: "Could not delete space.", variant: "destructive" });
    else {
      setSpaces((s) => s.filter((x) => x.id !== id));
      toast({ title: "Deleted", description: "Listing removed." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* --- MODERN NAV HEADER --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Logo color="dark" size="sm" />
            <span className="hidden sm:inline-block h-4 w-px bg-slate-200 mx-2"></span>
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-widest text-slate-400">Partner Console</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-100 pl-3 pr-1 py-1 rounded-full border border-slate-200">
              <span className="text-sm font-bold text-slate-600 truncate max-w-[100px]">{user?.name}</span>
              <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-700 font-bold text-sm">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 py-8 max-w-7xl mx-auto space-y-10">
        
        {/* --- HERO SECTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Dashboard <span className="text-emerald-500">.</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-lg max-w-md">
              Overview of your properties, earnings, and operational status.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/register-space')} 
            className="h-14 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-transform hover:scale-105 active:scale-95 font-bold text-base"
          >
            <Plus className="mr-2 h-5 w-5" /> List New Space
          </Button>
        </motion.div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            icon={DollarSign} label="Total Revenue" value={`₹${stats.totalEarnings.toLocaleString()}`} 
            color="emerald" delay={0.1} 
          />
          <StatsCard 
            icon={Car} label="Total Bookings" value={stats.totalBookings} 
            color="blue" delay={0.2} 
          />
          <StatsCard 
            icon={LayoutDashboard} label="Active Listings" value={stats.activeSpaces} 
            color="indigo" delay={0.3} 
          />
          <StatsCard 
            icon={Star} label="Rating Score" value={stats.avgRating} 
            color="amber" delay={0.4} 
          />
        </div>

        {/* --- SPACES LIST --- */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Your Properties</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="text-base font-medium text-slate-400">Loading your empire...</p>
            </div>
          ) : spaces.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <MapPin size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No properties listed yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto text-lg">Start earning by listing your empty parking space today.</p>
              <Button onClick={() => navigate('/register-space')} variant="outline" className="border-slate-300 h-12 px-6">List Your First Space</Button>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {spaces.map((space, index) => (
                  <SpaceItem 
                    key={space.id} 
                    space={space} 
                    index={index} 
                    navigate={navigate}
                    onToggle={() => toggleSpaceActive(space.id, space.isActive)}
                    onDelete={() => handleDelete(space.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatsCard({ icon: Icon, label, value, color, delay }: any) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
        <CardContent className="p-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
            <h3 className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-left">{value}</h3>
          </div>
          <div className={`p-4 rounded-2xl ring-1 ${styles[color as keyof typeof styles]}`}>
            <Icon size={24} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- TIMING HELPER FUNCTION ---
const getStatusDisplay = (space: Space) => {
  // 1. Manually Inactive
  if (!space.isActive) {
    return {
      color: "bg-slate-200 text-slate-500",
      icon: <ToggleLeft size={12} />,
      label: "Offline"
    };
  }

  // 2. Custom Timing Check
  if (space.availabilityType === 'custom' && space.availableFrom && space.availableTo) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [fromH, fromM] = space.availableFrom.split(':').map(Number);
    const [toH, toM] = space.availableTo.split(':').map(Number);
    
    const startMinutes = fromH * 60 + fromM;
    const endMinutes = toH * 60 + toM;

    const isOpen = currentMinutes >= startMinutes && currentMinutes < endMinutes;

    if (!isOpen) {
      return {
        color: "bg-amber-100 text-amber-700",
        icon: <Moon size={12} className="fill-amber-700" />,
        label: "Closed Now"
      };
    }
  }

  // 3. Active & Open
  return {
    color: "bg-emerald-100 text-emerald-700",
    icon: <Zap size={12} className="fill-emerald-700" />,
    label: "Live"
  };
};

function SpaceItem({ space, index, navigate, onToggle, onDelete }: any) {
  const status = getStatusDisplay(space);

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <div 
        onClick={() => navigate(`/space-dashboard/${space.id}`)}
        className={`
          group relative flex flex-col md:flex-row items-stretch bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden
          ${space.isActive 
            ? 'border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200' 
            : 'border-slate-100 bg-slate-50/50 opacity-75 grayscale-[0.5]'}
        `}
      >
        {/* Status Stripe */}
        <div className={`w-full md:w-2 h-2 md:h-auto ${space.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />

        <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          {/* Info Block */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                {space.title}
              </h3>
              
              {/* Dynamic Status Badge */}
              <span className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${status.color}`}>
                {status.icon} {status.label}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-base text-slate-500">
              <MapPin size={16} className="text-slate-400 shrink-0" />
              <span className="truncate">{space.address}</span>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1 text-xs font-semibold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-slate-600">
                  <ShieldCheck size={14} className="text-blue-500" /> {space.type}
               </div>
               
               {/* NEW: Timing Badge */}
               <div className="flex items-center gap-1 text-xs font-semibold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-slate-600">
                  <Clock size={14} className="text-indigo-500" />
                  {space.availabilityType === '24/7' 
                    ? '24/7 Access' 
                    : `${space.availableFrom?.slice(0,5)} - ${space.availableTo?.slice(0,5)}`
                  }
               </div>

               <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <Star size={14} className="fill-amber-500" /> {space.rating}
               </div>
            </div>
          </div>

          {/* Metrics Block */}
          <div className="flex items-center divide-x divide-slate-100 bg-slate-50/50 rounded-xl border border-slate-100 p-4 md:p-0 md:border-0 md:bg-transparent">
             <div className="px-6 text-center md:text-left">
                <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Rate</p>
                <p className="text-xl font-black text-slate-900">₹{space.price}<span className="text-sm text-slate-400 font-medium ml-1">/hr</span></p>
             </div>
             <div className="px-6 text-center md:text-left">
                <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Bookings</p>
                <p className="text-xl font-black text-slate-900">{space.totalBookings}</p>
             </div>
             <div className="px-6 text-center md:text-left">
                <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Earnings</p>
                <p className="text-xl font-black text-emerald-600">₹{space.earnings}</p>
             </div>
          </div>

          {/* Action Menu */}
          <div onClick={(e) => e.stopPropagation()} className="absolute top-4 right-4 md:static md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                  <MoreVertical size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1">
                <DropdownMenuItem onClick={onToggle} className="cursor-pointer font-medium text-sm py-2.5 px-3">
                  {space.isActive ? <><ToggleLeft className="mr-3 h-4 w-4" /> Deactivate Listing</> : <><ToggleRight className="mr-3 h-4 w-4 text-emerald-600" /> Activate Listing</>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/register-space?edit=${space.id}`)} className="cursor-pointer font-medium text-sm py-2.5 px-3">
                  <Edit className="mr-3 h-4 w-4" /> Edit Details
                </DropdownMenuItem>
                <div className="h-px bg-slate-100 my-1" />
                <DropdownMenuItem onClick={onDelete} className="cursor-pointer font-medium text-sm py-2.5 px-3 text-red-600 focus:bg-red-50 focus:text-red-700">
                  <Trash2 className="mr-3 h-4 w-4" /> Delete Listing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
    </motion.div>
  );
}