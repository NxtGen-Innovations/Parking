import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
  ArrowLeft
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

  // Form state
  const [providerType, setProviderType] = useState<SpaceType>(initialType);
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [spots, setSpots] = useState<number | ''>(1);
  const [description, setDescription] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState<{ car: boolean; bike: boolean; suv: boolean }>({
    car: true,
    bike: false,
    suv: false,
  });
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });

  // Commercial-specific
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [operationalHours, setOperationalHours] = useState('24/7');

  // Security & features
  const [securityCCTV, setSecurityCCTV] = useState(true);
  const [securityGuard, setSecurityGuard] = useState(false);
  const [instantEntry, setInstantEntry] = useState(true);

  // Pricing rules (simple)
  const [weekendMultiplier, setWeekendMultiplier] = useState<number | ''>(1.25);
  const [payoutAccount, setPayoutAccount] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setProviderType(initialType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramType, stateType]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
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

  const validate = () => {
    if (!title.trim()) return 'Please enter a title.';
    if (!address.trim()) return 'Please enter an address or use "Detect current location".';
    if (!city.trim()) return 'Please enter a city.';
    if (!price || Number(price) <= 0) return 'Please enter a valid hourly price.';
    if (!spots || Number(spots) < 1) return 'Please enter number of spots (>= 1).';
    if (providerType === 'commercial') {
      if (!businessName.trim()) return 'Please enter business name for commercial provider.';
      if (!capacity || Number(capacity) < 1) return 'Please enter capacity for commercial provider.';
      if (!payoutAccount.trim()) return 'Please enter payout account details.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: 'Validation', description: err, variant: 'destructive' });
      return;
    }

    const payload = {
      providerType,
      title,
      address,
      city,
      price: Number(price),
      spots: Number(spots),
      description,
      accessInstructions,
      vehicleTypes,
      dimensions,
      businessName: providerType === 'commercial' ? businessName : undefined,
      gstNumber: providerType === 'commercial' ? gstNumber : undefined,
      capacity: providerType === 'commercial' ? Number(capacity) : undefined,
      operationalHours: providerType === 'commercial' ? operationalHours : undefined,
      security: { cctv: securityCCTV, guard: securityGuard, instantEntry },
      pricing: { weekendMultiplier: Number(weekendMultiplier) || 1 },
      payoutAccount: providerType === 'commercial' ? payoutAccount : undefined,
      photosCount: photos.length,
    };

    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1400));
    setIsLoading(false);
    setIsSuccess(true);
    console.log('Submitted payload (simulated):', payload);
    toast({ title: 'Space Registered', description: 'Your parking space is live (simulated).' });
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Location unavailable', description: 'Geolocation is not supported by your browser.' });
      return;
    }
    toast({ title: 'Detecting location', description: 'Allow location permission in your browser.' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setCity('');
        toast({
          title: 'Location detected',
          description: 'Coordinates filled. Edit address/city if you want a human-readable address.',
        });
      },
      (err) => {
        console.error(err);
        toast({ title: 'Location error', description: 'Could not get location. Check permissions.' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col relative font-sans text-slate-900">
         <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} 
        />
        <div className="absolute inset-0 z-0 bg-white/95 backdrop-blur-sm" />

        <header className="relative z-10 w-full border-b border-slate-200 bg-white/80">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Logo color="dark" />
          </div>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md text-center rounded-3xl bg-white/80 border border-white/60 shadow-xl p-8 backdrop-blur-xl">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Successfully Registered</h2>
            <p className="text-slate-600 mb-8">Your listing is now live and drivers can start booking.</p>
            <div className="space-y-3">
              <Button onClick={() => { setIsSuccess(false); navigate('/provider-dashboard'); }} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => { setIsSuccess(false); setPhotos([]); }} className="w-full h-12 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50">
                Add Another Space
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} 
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-20 w-full border-b border-slate-200/60 bg-white/60 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <Logo color="dark" size="md" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm font-medium text-slate-600">{user?.name}</div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          className="w-full max-w-5xl rounded-[32px] bg-white/70 border border-white/60 backdrop-blur-xl p-6 md:p-10 shadow-2xl shadow-slate-200/50"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 -ml-2 text-slate-400 hover:text-slate-700"
                    onClick={() => navigate('/provider-dashboard')}
                 >
                    <ArrowLeft size={16} className="mr-1" /> Back
                 </Button>
                 <span className="text-slate-300">|</span>
                 <p className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" />
                    {providerType === 'commercial' ? 'Commercial' : 'Private'} Provider
                  </p>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Register your space</h1>
              <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">
                Fill in the details below. Use "Detect location" for faster entry.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Main Details Card */}
              <Card className="border-0 shadow-sm bg-white/50">
                <CardContent className="p-6 space-y-5">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-slate-700 font-medium">Space title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Covered garage near City Mall"
                      className="bg-white border-slate-200 focus:border-emerald-500 h-11"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                       <Label htmlFor="address" className="text-slate-700 font-medium">Street address</Label>
                       <button
                          type="button"
                          onClick={detectCurrentLocation}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
                        >
                          <Crosshair size={14} /> Detect location
                        </button>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-10 bg-white border-slate-200 h-11"
                        placeholder="Enter address..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                       <Label htmlFor="city" className="text-slate-700 font-medium">City</Label>
                       <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="bg-white border-slate-200 h-11"
                          placeholder="e.g., Chennai"
                       />
                    </div>
                    <div className="grid gap-2">
                       <Label htmlFor="price" className="text-slate-700 font-medium">Price / hr (₹)</Label>
                       <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="price"
                            type="number"
                            value={price ?? ''}
                            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                            className="pl-9 bg-white border-slate-200 h-11"
                            placeholder="50"
                            min={1}
                          />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="spots" className="text-slate-700 font-medium">Spots</Label>
                        <div className="relative">
                           <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                           <Input
                              id="spots"
                              type="number"
                              value={spots ?? ''}
                              onChange={(e) => setSpots(e.target.value === '' ? '' : Number(e.target.value))}
                              className="pl-9 bg-white border-slate-200 h-11"
                              min={1}
                           />
                        </div>
                     </div>
                     <div className="grid gap-2">
                        <Label className="text-slate-700 font-medium">Vehicle Types</Label>
                        <div className="flex gap-2">
                           {['car', 'bike', 'suv'].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setVehicleTypes((v) => ({ ...v, [type]: !v[type as keyof typeof v] }))}
                                className={`
                                  flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide border transition-all
                                  ${vehicleTypes[type as keyof typeof vehicleTypes] 
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
                                `}
                              >
                                {type}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label className="text-slate-700 font-medium">Description</Label>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Add notes about your space..." 
                      className="w-full min-h-[100px] rounded-xl bg-white border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Photos Card */}
              <Card className="border-0 shadow-sm bg-white/50">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                          <FileText size={18} className="text-emerald-500" /> Photos
                       </h3>
                       <span className="text-xs text-slate-400 font-medium">Max 6 images</span>
                    </div>
                    
                    <div className="flex gap-3 flex-wrap">
                       <label className="cursor-pointer flex flex-col items-center justify-center w-28 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-slate-400 hover:text-emerald-600">
                          <span className="text-xs font-medium">Upload</span>
                          <input type="file" accept="image/*" multiple onChange={onPhotoSelect} className="hidden" />
                       </label>
                       {photos.map((f, idx) => (
                          <div key={idx} className="w-28 h-24 rounded-xl overflow-hidden relative shadow-sm group">
                             <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                             <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <LogOut size={12} className="rotate-45" />
                             </button>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN */}
            <aside className="space-y-6">
               {/* Preview Card */}
               <Card className="border-0 shadow-sm bg-slate-900 text-white overflow-hidden">
                  <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Preview</h3>
                     <div className="text-lg font-bold truncate">{title || 'Your Space Title'}</div>
                     <div className="text-sm text-slate-400 truncate">{address || 'Location...'}</div>
                     <div className="mt-4 text-2xl font-bold text-emerald-400">₹{price || 0}<span className="text-sm text-slate-500 font-normal"> / hr</span></div>
                  </div>
               </Card>

               {/* Commercial Fields */}
               {providerType === 'commercial' && (
                 <Card className="border-0 shadow-sm bg-white/50">
                    <CardContent className="p-5 space-y-4">
                       <h3 className="font-semibold text-slate-800">Business Details</h3>
                       <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name" className="bg-white" />
                       <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="GST Number" className="bg-white" />
                       <Input value={operationalHours} onChange={(e) => setOperationalHours(e.target.value)} placeholder="Hours (e.g. 9AM - 9PM)" className="bg-white" />
                       <Input value={payoutAccount} onChange={(e) => setPayoutAccount(e.target.value)} placeholder="Payout Account / UPI" className="bg-white" />
                    </CardContent>
                 </Card>
               )}

               {/* Security & Features */}
               <Card className="border-0 shadow-sm bg-white/50">
                  <CardContent className="p-5">
                     <h3 className="font-semibold text-slate-800 mb-4">Features</h3>
                     <div className="space-y-2">
                        {[
                           { label: 'CCTV', state: securityCCTV, set: setSecurityCCTV, icon: Shield },
                           { label: 'Guard', state: securityGuard, set: setSecurityGuard, icon: Users },
                           { label: 'Instant Entry', state: instantEntry, set: setInstantEntry, icon: Check },
                        ].map((item) => (
                           <label key={item.label} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${item.state ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                 <item.icon size={16} className={item.state ? 'text-emerald-600' : 'text-slate-400'} /> {item.label}
                              </div>
                              <input type="checkbox" checked={item.state} onChange={() => item.set(!item.state)} className="accent-emerald-600 w-4 h-4" />
                           </label>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               <div className="sticky top-6">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-semibold rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20"
                  >
                     {isLoading ? 'Registering...' : 'Register Space'}
                  </Button>
               </div>
            </aside>
          </form>

        </motion.div>
      </main>
    </div>
  );
}