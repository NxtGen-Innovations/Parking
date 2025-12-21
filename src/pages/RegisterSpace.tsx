import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  LogOut,
  Check,
  FileText,
  Shield,
  Users,
  Crosshair,
  MapPin,
  DollarSign,
  Clock,
  ArrowLeft,
  Car,
  Bike,
  Truck, // Using Truck icon for SUV representation
  Umbrella, // For Flood Safety
  AlertTriangle
} from 'lucide-react';

// Shared Background Image
import BACKGROUND_IMAGE from '../assets/background-hero.jpg';

type SpaceType = 'private' | 'commercial';

export default function RegisterSpace() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const paramType = (searchParams.get('type') as SpaceType) || undefined;
  const stateType = (location.state as any)?.type as SpaceType | undefined;
  const initialType: SpaceType = (paramType || stateType || 'private') as SpaceType;

  const { user, logout } = useAuth();

  // --- FORM STATE ---
  const [providerType, setProviderType] = useState<SpaceType>(initialType);
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [spots, setSpots] = useState<number | ''>(1);
  const [description, setDescription] = useState('');
  
  // Vehicle Types
  const [vehicleTypes, setVehicleTypes] = useState<{ car: boolean; bike: boolean; suv: boolean }>({
    car: true,
    bike: false,
    suv: false,
  });

  // Flood Safety (Chennai SOS) Feature
  const [floorLevel, setFloorLevel] = useState('0'); // 0 = Ground, 1 = 1st Floor, etc.
  const [isFloodSafe, setIsFloodSafe] = useState(false);

  // Commercial-specific
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [operationalHours, setOperationalHours] = useState('24/7');
  const [payoutAccount, setPayoutAccount] = useState('');

  // Security
  const [securityCCTV, setSecurityCCTV] = useState(true);
  const [securityGuard, setSecurityGuard] = useState(false);
  const [instantEntry, setInstantEntry] = useState(true);

  const [photos, setPhotos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setProviderType(initialType);
  }, [paramType, stateType]);

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  const onPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files).slice(0, 6);
    setPhotos((p) => [...p, ...arr].slice(0, 6));
  };

  const removePhoto = (index: number) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !address || !price) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({ title: 'Space Registered', description: 'Your parking space is now live.' });
    }, 1500);
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) return;
    toast({ title: 'Locating...', description: 'Getting your coordinates.' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddress(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        toast({ title: 'Location Found', description: 'Address updated with coordinates.' });
      },
      () => toast({ title: 'Error', description: 'Could not detect location.', variant: 'destructive' })
    );
  };

  // --- SUCCESS VIEW ---
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col relative font-sans text-slate-900">
         <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} />
         <div className="absolute inset-0 z-0 bg-white/95 backdrop-blur-sm" />
         
         <main className="relative z-10 flex-1 flex items-center justify-center px-4">
            <Card className="w-full max-w-md text-center rounded-3xl bg-white/80 border-white/60 shadow-2xl p-8 backdrop-blur-xl">
               <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-emerald-600" />
               </div>
               <h2 className="text-2xl font-bold mb-2 text-slate-900">Listing Published!</h2>
               <p className="text-slate-600 mb-8">Your space is now visible to drivers. Get ready for your first booking.</p>
               <Button onClick={() => navigate('/provider-dashboard')} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Go to Dashboard
               </Button>
            </Card>
         </main>
      </div>
    );
  }

  // --- MAIN FORM VIEW ---
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900">
      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-20 w-full border-b border-slate-200/60 bg-white/60 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <Logo color="dark" size="md" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm font-medium text-slate-600">Hi, {user?.name}</div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
             <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800" onClick={() => navigate('/provider-dashboard')}>
                   <ArrowLeft size={18} className="mr-1" /> Back
                </Button>
                <div className="h-6 w-px bg-slate-300" />
                <h1 className="text-2xl font-bold text-slate-900">Register Space</h1>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-100">
                   {providerType}
                </span>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN (The Form) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Basic Details */}
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl border-white/50">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-700 font-semibold">Space Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spacious Driveway in Adyar" className="h-12 bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                       <Label className="text-slate-700 font-semibold">Address</Label>
                       <button type="button" onClick={detectCurrentLocation} className="text-xs font-bold text-emerald-600 flex items-center hover:text-emerald-700"><Crosshair size={14} className="mr-1"/> Use GPS</button>
                    </div>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                       <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full street address..." className="pl-10 h-12 bg-white/80 border-slate-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">City</Label>
                        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Chennai" className="h-12 bg-white/80 border-slate-200" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Price / Hour</Label>
                        <div className="relative">
                           <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={18} />
                           <Input type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="40" className="pl-10 h-12 bg-white/80 border-slate-200 font-medium" />
                        </div>
                     </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Vehicle Types (Visual Selector) */}
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl border-white/50">
                 <CardContent className="p-6">
                    <Label className="text-slate-700 font-semibold mb-4 block">Allowed Vehicles</Label>
                    <div className="grid grid-cols-3 gap-4">
                       {[
                          { id: 'bike', label: 'Bike', icon: Bike },
                          { id: 'car', label: 'Car', icon: Car },
                          { id: 'suv', label: 'SUV/Van', icon: Truck },
                       ].map((v) => (
                          <div 
                             key={v.id}
                             onClick={() => setVehicleTypes(prev => ({ ...prev, [v.id]: !prev[v.id as keyof typeof prev] }))}
                             className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200
                                ${vehicleTypes[v.id as keyof typeof vehicleTypes] 
                                   ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                   : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}
                             `}
                          >
                             <v.icon size={28} />
                             <span className="text-xs font-bold uppercase">{v.label}</span>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>

              {/* 3. NEW FEATURE: FLOOD HAVEN (SOS Mode) */}
              <Card className="border-0 shadow-md bg-blue-50/50 border-blue-100 relative overflow-hidden">
                 {/* Decorative background blob */}
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
                 
                 <CardContent className="p-6 space-y-4 relative z-10">
                    <div className="flex items-start gap-3">
                       <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <Umbrella size={24} />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-slate-900">Flood Safety (Chennai SOS)</h3>
                          <p className="text-sm text-slate-600">Help neighbors save their cars during heavy rains. Is this spot elevated?</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                       <div>
                          <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Floor Level</Label>
                          <select 
                             className="w-full mt-1 h-10 bg-white border border-blue-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                             value={floorLevel}
                             onChange={(e) => setFloorLevel(e.target.value)}
                          >
                             <option value="-1">Basement (Risk Zone)</option>
                             <option value="0">Ground Floor / Driveway</option>
                             <option value="1">1st Floor (Safe)</option>
                             <option value="2">2nd Floor+ (Safe)</option>
                          </select>
                       </div>
                       
                       <div className="flex items-end">
                          <label className="flex items-center gap-3 p-2.5 w-full rounded-lg border border-blue-200 bg-white cursor-pointer hover:bg-blue-50 transition-colors">
                             <input 
                                type="checkbox" 
                                checked={isFloodSafe}
                                onChange={(e) => setIsFloodSafe(e.target.checked)}
                                className="accent-blue-600 w-5 h-5" 
                             />
                             <span className="text-sm font-medium text-slate-700">Mark as "Flood Safe"</span>
                          </label>
                       </div>
                    </div>
                    
                    {floorLevel === '0' && (
                       <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-100">
                          <AlertTriangle size={14} /> Ground floor spots may be hidden during heavy rain alerts.
                       </div>
                    )}
                 </CardContent>
              </Card>

              {/* 4. Photos */}
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl border-white/50">
                 <CardContent className="p-6">
                    <Label className="text-slate-700 font-semibold mb-3 block">Photos</Label>
                    <div className="flex gap-3 flex-wrap">
                       <label className="cursor-pointer flex flex-col items-center justify-center w-28 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-slate-400 hover:text-emerald-600 bg-white/50">
                          <span className="text-xs font-bold">Add Photo</span>
                          <input type="file" accept="image/*" multiple onChange={onPhotoSelect} className="hidden" />
                       </label>
                       {photos.map((f, idx) => (
                          <div key={idx} className="w-28 h-24 rounded-xl overflow-hidden relative shadow-sm group">
                             <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                             <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <LogOut size={12} />
                             </button>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN (Sticky Sidebar) */}
            <div className="lg:col-span-1 space-y-6 sticky top-24">
               {/* Preview */}
               <Card className="border-0 shadow-lg bg-slate-900 text-white overflow-hidden rounded-2xl">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
                  <div className="p-5">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Preview</h3>
                     <div className="space-y-1 mb-4">
                        <div className="text-xl font-bold truncate leading-tight">{title || 'Your Title Here'}</div>
                        <div className="text-sm text-slate-400 truncate flex items-center gap-1">
                           <MapPin size={12} /> {address || 'Address...'}
                        </div>
                     </div>
                     <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <div className="flex flex-col">
                           <span className="text-xs text-slate-500">Earnings</span>
                           <span className="text-2xl font-bold text-emerald-400">₹{price || 0}<span className="text-sm text-slate-500 font-normal">/hr</span></span>
                        </div>
                        {isFloodSafe && (
                           <div className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                              <Umbrella size={10} /> Safe
                           </div>
                        )}
                     </div>
                  </div>
               </Card>

               {/* Commercial Fields */}
               {providerType === 'commercial' && (
                 <Card className="border-0 shadow-sm bg-white/60">
                    <CardContent className="p-5 space-y-3">
                       <h3 className="font-bold text-slate-800">Business Info</h3>
                       <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name" className="bg-white" />
                       <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="GST (Optional)" className="bg-white" />
                       <Input value={operationalHours} onChange={(e) => setOperationalHours(e.target.value)} placeholder="Hours (e.g. 9-9)" className="bg-white" />
                    </CardContent>
                 </Card>
               )}

               {/* Features */}
               <Card className="border-0 shadow-sm bg-white/60">
                  <CardContent className="p-5">
                     <h3 className="font-bold text-slate-800 mb-3">Amenities</h3>
                     <div className="space-y-2">
                        {[
                           { label: 'CCTV Camera', state: securityCCTV, set: setSecurityCCTV, icon: Shield },
                           { label: 'Security Guard', state: securityGuard, set: setSecurityGuard, icon: Users },
                           { label: 'Auto Entry (QR)', state: instantEntry, set: setInstantEntry, icon: Check },
                        ].map((item) => (
                           <label key={item.label} className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${item.state ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-emerald-200'}`}>
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                 <item.icon size={16} className={item.state ? 'text-emerald-600' : 'text-slate-400'} /> {item.label}
                              </div>
                              <input type="checkbox" checked={item.state} onChange={() => item.set(!item.state)} className="accent-emerald-600 w-4 h-4" />
                           </label>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               <Button 
                 type="submit" 
                 disabled={isLoading}
                 className="w-full h-14 text-lg font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02]"
               >
                  {isLoading ? 'Publishing...' : 'Publish Listing'}
               </Button>
            </div>

          </form>
        </motion.div>
      </main>
    </div>
  );
}