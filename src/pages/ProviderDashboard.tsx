import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

// Background Image Import
import BACKGROUND_IMAGE from '../assets/background-hero.jpg';

// Mock Data
const mockMySpaces = [
  {
    id: '1',
    title: 'Home Driveway',
    address: '123 My Street, Chennai',
    price: 50,
    rating: 4.9,
    reviews: 56,
    totalBookings: 234,
    earnings: 11700,
    isActive: true,
    type: 'private',
  },
  {
    id: '2',
    title: 'Office Parking Lot',
    address: '456 Business Ave',
    price: 80,
    rating: 4.7,
    reviews: 89,
    totalBookings: 456,
    earnings: 36480,
    isActive: true,
    type: 'commercial',
  },
  {
    id: '3',
    title: 'Weekend Spot',
    address: '789 Residential Blvd',
    price: 40,
    rating: 4.5,
    reviews: 23,
    totalBookings: 67,
    earnings: 2680,
    isActive: false,
    type: 'private',
  },
];

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Handle pre-selection from RegisterType page
  const incomingPreselect = (location.state as any)?.preselect as 'private' | 'commercial' | undefined;
  const [preselect, setPreselect] = useState(incomingPreselect);

  const [spaces, setSpaces] = useState(mockMySpaces);

  const stats = useMemo(() => {
    const totalEarnings = spaces.reduce((s, x) => s + x.earnings, 0);
    const totalBookings = spaces.reduce((s, x) => s + x.totalBookings, 0);
    const activeSpaces = spaces.filter((s) => s.isActive).length;
    const avgRating = spaces.reduce((s, x) => s + x.rating, 0) / Math.max(spaces.length, 1);
    return { totalEarnings, totalBookings, activeSpaces, avgRating: +avgRating.toFixed(1) };
  }, [spaces]);

  useEffect(() => {
    if (incomingPreselect) setPreselect(incomingPreselect);
  }, [incomingPreselect]);

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  const toggleSpaceActive = (id: string) => {
    setSpaces((s) => s.map((sp) => (sp.id === id ? { ...sp, isActive: !sp.isActive } : sp)));
  };

  const onAddClick = () => {
    if (preselect) {
      navigate(`/register-space?type=${preselect}`);
      setPreselect(undefined);
      return;
    }
    navigate('/register-type');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900">
      
      {/* --- BACKGROUND LAYER --- */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} 
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/95 via-white/85 to-white/95 backdrop-blur-[2px]" />

      {/* --- HEADER --- */}
      <header className="relative z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Logo color="dark" size="sm" />
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm font-medium text-slate-600">
              Welcome, {user?.name}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 flex-1 px-4 py-8">
        <motion.div
          className="w-full max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          
          {/* DASHBOARD HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Provider Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage your parking spaces and track earnings.</p>
            </div>

            <div className="flex items-center gap-3">
              {preselect && (
                <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                  <span>Adding:</span>
                  <span className="capitalize">{preselect} Space</span>
                </div>
              )}
              <Button 
                onClick={onAddClick} 
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-6"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Space
              </Button>
            </div>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatsCard 
              icon={DollarSign} 
              label="Total Earnings" 
              value={`₹${stats.totalEarnings.toLocaleString()}`} 
              trend="+12% this month"
              color="emerald"
            />
            <StatsCard 
              icon={Car} 
              label="Total Bookings" 
              value={stats.totalBookings} 
              color="blue"
            />
            <StatsCard 
              icon={TrendingUp} 
              label="Active Spaces" 
              value={stats.activeSpaces} 
              color="indigo"
            />
            <StatsCard 
              icon={Star} 
              label="Avg Rating" 
              value={stats.avgRating} 
              subValue="/ 5.0"
              color="amber"
            />
          </div>

          {/* SPACES LIST */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">My Listings</h2>
            </div>

            <div className="grid gap-5">
              {spaces.map((space) => (
                <motion.div 
                  key={space.id}
                  layout
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                >
                  <Card className={`
                    border-0 shadow-md transition-all duration-300 overflow-hidden
                    ${space.isActive ? 'bg-white/80' : 'bg-slate-50/60 opacity-80'}
                    backdrop-blur-sm hover:shadow-lg hover:translate-y-[-2px]
                  `}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        
                        {/* LEFT: Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900 truncate">{space.title}</h3>
                            <span className={`
                              text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider
                              ${space.isActive 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-200 text-slate-500'}
                            `}>
                              {space.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                              {space.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <MapPin size={14} className="text-slate-400" />
                            {space.address}
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-slate-700">{space.rating}</span>
                            <span>({space.reviews} reviews)</span>
                          </div>
                        </div>

                        {/* MIDDLE: Stats */}
                        <div className="flex items-center gap-8 md:gap-12 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                          <div className="text-left">
                            <div className="text-lg font-bold text-slate-900">₹{space.price}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">/ hour</div>
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-bold text-slate-900">{space.totalBookings}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">Bookings</div>
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-bold text-emerald-600">₹{space.earnings.toLocaleString()}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">Earned</div>
                          </div>
                        </div>

                        {/* RIGHT: Actions */}
                        <div className="flex items-center justify-end md:border-l border-slate-100 md:pl-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                                <MoreVertical size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => toggleSpaceActive(space.id)}>
                                {space.isActive ? (
                                  <>
                                    <ToggleLeft className="mr-2 h-4 w-4" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="mr-2 h-4 w-4" /> Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/register-space?edit=${space.id}`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => setSpaces((s) => s.filter((x) => x.id !== space.id))}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}

// --- Helper Component for Stats ---
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