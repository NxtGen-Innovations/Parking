import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  LogOut,
  Check,
  Shield,
  Users,
  Crosshair,
  MapPin,
  IndianRupee,
  ArrowLeft,
  Car,
  Bike,
  Truck, 
  Umbrella, 
  AlertTriangle,
  X,
  FileText,
  Building2,
  Home,
  Upload,
  Hash,
  Clock,      
  ShieldCheck,
  Loader2
} from 'lucide-react';

import BACKGROUND_IMAGE from '../assets/background-hero.jpg';

type SpaceType = 'private' | 'commercial';

export default function RegisterSpace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. CHECK FOR EDIT MODE
  const editId = searchParams.get('edit');
  const { user, logout } = useAuth();

  // --- FORM STATE ---
  const [providerType, setProviderType] = useState<SpaceType>('private');
  const [title, setTitle] = useState('');
  
  // Address
  const [addrDoor, setAddrDoor] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Mandatory GPS States
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Timing State
  const [availabilityType, setAvailabilityType] = useState<'24/7' | 'custom'>('24/7');
  const [availableFrom, setAvailableFrom] = useState('09:00');
  const [availableTo, setAvailableTo] = useState('21:00');

  // Vehicle Selection
  const [vehicleTypes, setVehicleTypes] = useState<{ car: boolean; bike: boolean; suv: boolean }>({
    car: true,
    bike: true,
    suv: false,
  });

  // Pricing State
  const [prices, setPrices] = useState({ car: '', bike: '', suv: '' });
  const [slots, setSlots] = useState({ car: '', bike: '', suv: '' });

  const [description, setDescription] = useState('');
  
  // Commercial Specifics
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [operationalHours, setOperationalHours] = useState('24/7');

  // Security
  const [securityCCTV, setSecurityCCTV] = useState(true);
  const [securityGuard, setSecurityGuard] = useState(false);
  const [instantEntry, setInstantEntry] = useState(true);

  // Images & Docs
  const [photos, setPhotos] = useState<File[]>([]); 
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [existingVerificationDoc, setExistingVerificationDoc] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Elevation Verification States
  const [isVerifyingElevation, setIsVerifyingElevation] = useState(false);
  const [elevationData, setElevationData] = useState<{ elevation: number; isSafe: boolean } | null>(null);

  // 2. FETCH EXISTING DATA IF EDITING
  useEffect(() => {
    const fetchSpaceData = async () => {
      if (!editId || !user) return;

      setIsLoading(true);
      const { data, error } = await supabase
        .from('parking_spaces')
        .select('*')
        .eq('id', editId)
        .single();

      if (error) {
        toast({ title: 'Error', description: 'Could not load space details.', variant: 'destructive' });
        navigate('/provider-dashboard');
        return;
      }

      // Populate State
      setTitle(data.title);
      setProviderType(data.space_type as SpaceType);
      
      setAddrDoor(data.address_door || '');
      setAddrStreet(data.address_street || '');
      setAddrLandmark(data.address_landmark || '');
      setCity(data.city || '');
      setPincode(data.pincode || ''); 
      setDescription(data.description || '');

      setLat(data.latitude);
      setLng(data.longitude);

      setAvailabilityType(data.availability_type || '24/7');
      if (data.available_from) setAvailableFrom(data.available_from.slice(0, 5));
      if (data.available_to) setAvailableTo(data.available_to.slice(0, 5));

      setVehicleTypes({
        car: data.price_car !== null,
        bike: data.price_bike !== null,
        suv: data.price_suv !== null,
      });
      setPrices({
        car: data.price_car ? String(data.price_car) : '',
        bike: data.price_bike ? String(data.price_bike) : '',
        suv: data.price_suv ? String(data.price_suv) : '',
      });

      if (data.slots_car) setSlots(prev => ({...prev, car: String(data.slots_car)}));
      if (data.slots_bike) setSlots(prev => ({...prev, bike: String(data.slots_bike)}));
      if (data.slots_suv) setSlots(prev => ({...prev, suv: String(data.slots_suv)}));

      setSecurityCCTV(data.has_cctv);
      setSecurityGuard(data.has_guard);
      setInstantEntry(data.has_auto_entry);

      if (data.space_type === 'commercial') {
        setBusinessName(data.business_name || '');
        setGstNumber(data.gst_number || '');
        setOperationalHours(data.operational_hours || '24/7');
      }

      if (data.images) setExistingImages(data.images);
      if (data.verification_doc) setExistingVerificationDoc(data.verification_doc);

      setIsLoading(false);
    };

    fetchSpaceData();
  }, [editId, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  const handlePriceChange = (type: 'car' | 'bike' | 'suv', val: string) => {
    setPrices(prev => ({ ...prev, [type]: val }));
  };

  const handleSlotChange = (type: 'car' | 'bike' | 'suv', val: string) => {
    setSlots(prev => ({ ...prev, [type]: val }));
  };

  const getPriceDisplay = () => {
    const activePrices = [];
    if (vehicleTypes.bike && prices.bike) activePrices.push(Number(prices.bike));
    if (vehicleTypes.car && prices.car) activePrices.push(Number(prices.car));
    if (vehicleTypes.suv && prices.suv) activePrices.push(Number(prices.suv));
    
    if (activePrices.length === 0) return '0';
    const min = Math.min(...activePrices);
    const max = Math.max(...activePrices);
    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
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

  const removeExistingPhoto = (index: number) => {
    setExistingImages((p) => p.filter((_, i) => i !== index));
  };

  // --- UPDATED: GPS Detection + Smarter Geocoding ---
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) return;
    
    setIsLocating(true);
    toast({ title: 'Locating...', description: 'Getting exact coordinates via GPS.' });
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        
        setLat(latitude);
        setLng(longitude);

        // REVERSE GEOCODING (OpenStreetMap Nominatim)
        try {
            toast({ title: 'Fetching Address...', description: 'Decoding GPS to address.' });
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            if (data && data.address) {
                const a = data.address;

                // 1. DOOR NUMBER (Rare, but we check)
                if (a.house_number) setAddrDoor(a.house_number);

                // 2. STREET NAME (Improved Logic)
                // Priority: Specific Road -> Building Name (Amenity) -> Area Name (Suburb) -> Display Name
                let detectedStreet = a.road || a.pedestrian || a.path || a.amenity || a.building || a.suburb || a.neighbourhood || '';
                
                // If everything above is empty, use the first part of the full display name (e.g. "SRM University")
                if (!detectedStreet && data.display_name) {
                    detectedStreet = data.display_name.split(',')[0];
                }
                
                if (detectedStreet) setAddrStreet(detectedStreet);

                // 3. CITY (Logic to catch City > Town > Village)
                const detectedCity = a.city || a.town || a.village || a.city_district || a.county || '';
                if (detectedCity) setCity(detectedCity);

                // 4. PINCODE
                if (a.postcode) setPincode(a.postcode);

                // 5. LANDMARK
                const detectedLandmark = a.suburb || a.neighbourhood || a.commercial || a.industrial || '';
                if (detectedLandmark && detectedLandmark !== detectedStreet) setAddrLandmark(detectedLandmark);
                
                toast({ title: 'Address Auto-Filled', description: 'Address details updated from GPS.' });
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            toast({ title: 'GPS Locked', description: 'Location saved. Please fill address details manually.' });
        } finally {
            setIsLocating(false);
        }
      },
      () => {
          setIsLocating(false);
          toast({ title: 'GPS Error', description: 'Could not detect location. Check permissions.', variant: 'destructive' });
      }
    );
  };

  // --- NEW: Verify Elevation (Open-Meteo) ---
  const verifyElevation = async () => {
    if (lat === null || lng === null) return;
    setIsVerifyingElevation(true);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
      const data = await response.json();
      const elevation = data.elevation?.[0] || 0;
      
      // Chennai Specific Logic: >10m is generally flood safe
      setElevationData({
        elevation,
        isSafe: elevation >= 10
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Elevation check failed", description: "Defaulting to standard listing.", variant: "destructive" });
      submitFinalData(false);
    } finally {
      setIsVerifyingElevation(false);
    }
  };

  // --- UPDATED: Submission Handler ---
  const handleSubmitTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDATION
    if (!title || !addrStreet || !city || !pincode) {
      toast({ title: 'Missing Info', description: 'Basic address fields are mandatory.', variant: 'destructive' });
      return;
    }
    
    if (providerType === 'commercial' && !gstNumber) {
      toast({ title: 'GST Required', description: 'Commercial spaces must provide a GST Number.', variant: 'destructive' });
      return;
    }

    // MANDATORY GPS
    if (lat === null || lng === null) {
      toast({ title: 'GPS Verification Required', description: 'Please click "Verify GPS" to lock the location.', variant: 'destructive' });
      return;
    }

    if (!verificationFile && !existingVerificationDoc) {
      toast({ title: 'Verification Required', description: 'Please upload Aadhaar, PAN, or Property Proof.', variant: 'destructive' });
      return;
    }

    // Trigger Verification -> Opens Modal
    verifyElevation();
  };

  // --- NEW: Final Data Submission (After Elevation Check) ---
  const submitFinalData = async (optInStorm: boolean) => {
    if (!user) return;
    setIsLoading(true);
    const finalElevation = elevationData?.elevation || 0;
    setElevationData(null); // Close modal

    try {
      // 1. Upload Space Images
      const newImageUrls: string[] = [];
      for (const file of photos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `space-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error } = await supabase.storage.from('space-images').upload(filePath, file);
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('space-images').getPublicUrl(filePath);
        newImageUrls.push(publicUrl);
      }

      // 2. Upload Verification Doc (If new one selected)
      let verificationUrl = existingVerificationDoc;
      if (verificationFile) {
        const fileExt = verificationFile.name.split('.').pop();
        const fileName = `verify-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/verification/${fileName}`;

        const { error } = await supabase.storage.from('space-images').upload(filePath, verificationFile);
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('space-images').getPublicUrl(filePath);
        verificationUrl = publicUrl;
      }

      const finalImages = [...existingImages, ...newImageUrls];

      // 3. Prepare Payload (Updated with new fields)
      const payload = {
        title,
        space_type: providerType,
        is_active: true,
        
        address_door: addrDoor,
        address_street: addrStreet,
        address_landmark: addrLandmark,
        city: city,
        pincode: pincode,
        latitude: lat,
        longitude: lng,
        
        elevation: finalElevation,
        is_flood_safe: optInStorm, 
        
        availability_type: availabilityType,
        available_from: availabilityType === 'custom' ? availableFrom : null,
        available_to: availabilityType === 'custom' ? availableTo : null,

        // Prices
        price_car: vehicleTypes.car && prices.car ? parseFloat(prices.car) : null,
        price_bike: vehicleTypes.bike && prices.bike ? parseFloat(prices.bike) : null,
        price_suv: vehicleTypes.suv && prices.suv ? parseFloat(prices.suv) : null,

        // Slots
        slots_car: vehicleTypes.car && slots.car ? parseInt(slots.car) : 0,
        slots_bike: vehicleTypes.bike && slots.bike ? parseInt(slots.bike) : 0,
        slots_suv: vehicleTypes.suv && slots.suv ? parseInt(slots.suv) : 0,

        has_cctv: securityCCTV,
        has_guard: securityGuard,
        has_auto_entry: instantEntry,

        business_name: providerType === 'commercial' ? businessName : null,
        gst_number: providerType === 'commercial' ? gstNumber : null,
        operational_hours: providerType === 'commercial' ? operationalHours : null,

        images: finalImages,
        verification_doc: verificationUrl, 
        description: description || null
      };

      if (editId) {
        const { error } = await supabase.from('parking_spaces').update(payload).eq('id', editId);
        if (error) throw error;
        toast({ title: 'Updated Successfully', description: 'Changes saved.' });
      } else {
        const { error } = await supabase.from('parking_spaces').insert({ ...payload, owner_id: user.id });
        if (error) throw error;
        toast({ title: 'Space Registered', description: 'Your space is under review.' });
      }

      setIsSuccess(true);

    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUCCESS SCREEN ---
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
               <h2 className="text-2xl font-bold mb-2 text-slate-900">Success!</h2>
               <p className="text-slate-600 mb-8">Your dashboard has been updated.</p>
               <Button onClick={() => navigate('/provider-dashboard')} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">Go to Dashboard</Button>
            </Card>
         </main>
      </div>
    );
  }

  const fullAddress = [addrDoor, addrStreet, addrLandmark, city, pincode].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900">
      <div className="fixed inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95 backdrop-blur-[2px]" />

      <header className="relative z-20 w-full border-b border-slate-200/60 bg-white/60 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <Logo color="dark" size="md" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm font-medium text-slate-600">Hi, {user?.name}</div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50"><LogOut size={18} /></Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <motion.div className="w-full max-w-6xl" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
             <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800" onClick={() => navigate('/provider-dashboard')}>
                   <ArrowLeft size={18} className="mr-1" /> Back
                </Button>
                <div className="h-6 w-px bg-slate-300" />
                <h1 className="text-2xl font-bold text-slate-900">{editId ? 'Edit Listing' : 'Register Space'}</h1>
             </div>
          </div>

          <form onSubmit={handleSubmitTrigger} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. TYPE SELECTOR TOGGLE */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-xl border-white/50 overflow-hidden">
                <div className="p-2 bg-slate-100/50 m-2 rounded-xl flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProviderType('private')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${providerType === 'private' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
                  >
                    <Home size={18} className={providerType === 'private' ? 'text-blue-500' : ''} />
                    Private Space
                  </button>
                  <button
                    type="button"
                    onClick={() => setProviderType('commercial')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${providerType === 'commercial' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
                  >
                    <Building2 size={18} className={providerType === 'commercial' ? 'text-emerald-500' : ''} />
                    Commercial
                  </button>
                </div>
              </Card>

              {/* 2. Basic Details & Address */}
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl border-white/50">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-700 font-semibold">Space Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={providerType === 'private' ? "e.g. My Driveway" : "e.g. Phoenix Mall Parking B1"} className="h-12 bg-white/80" />
                  </div>

                  {/* UPDATED: GPS + REVERSE GEOCODING */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-slate-700 font-semibold flex items-center gap-2"><MapPin size={16} /> Location & GPS Lock</Label>
                        <button type="button" onClick={detectCurrentLocation} disabled={isLocating} className={`text-xs font-bold flex items-center px-3 py-1.5 rounded cursor-pointer transition-colors ${lat ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600 hover:text-emerald-700'}`}>
                           {isLocating ? <Loader2 size={14} className="animate-spin mr-1"/> : <Crosshair size={14} className="mr-1"/>} 
                           {isLocating ? 'Detecting...' : lat ? 'Location Verified' : 'Verify GPS *'}
                        </button>
                    </div>

                    {/* NEW: Lat/Lng Display Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <Label className="text-[10px] text-slate-400 uppercase font-bold">Latitude</Label>
                             <Input readOnly value={lat || ''} placeholder="Detected via GPS" className="bg-slate-50/50 text-slate-500 border-slate-200" />
                        </div>
                        <div className="space-y-1">
                             <Label className="text-[10px] text-slate-400 uppercase font-bold">Longitude</Label>
                             <Input readOnly value={lng || ''} placeholder="Detected via GPS" className="bg-slate-50/50 text-slate-500 border-slate-200" />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1 space-y-2">
                            <Label className="text-xs text-slate-500">Door / Flat No</Label>
                            <Input value={addrDoor} onChange={(e) => setAddrDoor(e.target.value)} placeholder="No. 42" className="bg-white/80" />
                        </div>
                        <div className="col-span-3 space-y-2">
                            <Label className="text-xs text-slate-500">Street Name</Label>
                            <Input value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Street name" className="bg-white/80" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-500">Landmark</Label>
                            <Input value={addrLandmark} onChange={(e) => setAddrLandmark(e.target.value)} placeholder="Landmark" className="bg-white/80" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-500">City</Label>
                            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Chennai" className="bg-white/80" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Pincode</Label>
                        <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="600001" className="bg-white/80" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Operational Timing Card */}
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl border-white/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2"><Clock size={20} className="text-slate-600"/><h3 className="font-bold text-slate-700">Operational Timing</h3></div>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button type="button" onClick={() => setAvailabilityType('24/7')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${availabilityType === '24/7' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>24/7 Access</button>
                    <button type="button" onClick={() => setAvailabilityType('custom')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${availabilityType === 'custom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Custom Window</button>
                  </div>
                  {availabilityType === 'custom' && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Open From</Label><Input type="time" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} className="bg-white"/></div>
                      <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Close At</Label><Input type="time" value={availableTo} onChange={(e) => setAvailableTo(e.target.value)} className="bg-white"/></div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 4. Vehicles, Pricing & Slots */}
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl border-white/50">
                 <CardContent className="p-6">
                    <Label className="text-slate-700 font-semibold mb-4 block">Vehicles, Pricing & Slots</Label>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                       {[
                          { id: 'bike', label: 'Bike', icon: Bike },
                          { id: 'car', label: 'Car', icon: Car },
                          { id: 'suv', label: 'SUV', icon: Truck },
                       ].map((v) => (
                          <div key={v.id} onClick={() => setVehicleTypes(prev => ({ ...prev, [v.id]: !prev[v.id as keyof typeof prev] }))} className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 relative ${vehicleTypes[v.id as keyof typeof vehicleTypes] ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}`}>
                             {vehicleTypes[v.id as keyof typeof vehicleTypes] && (<div className="absolute top-2 right-2 text-emerald-600"><Check size={14} strokeWidth={3} /></div>)}
                             <v.icon size={28} />
                             <span className="text-xs font-bold uppercase">{v.label}</span>
                          </div>
                       ))}
                    </div>
                    
                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {['bike', 'car', 'suv'].map((type) => {
                            if (!vehicleTypes[type as keyof typeof vehicleTypes]) return null;
                            const Icon = type === 'bike' ? Bike : type === 'car' ? Car : Truck;
                            return (
                                <div key={type} className="flex items-center gap-3">
                                    <div className="w-8 flex justify-center text-slate-500"><Icon size={20} /></div>
                                    <div className="text-sm font-medium text-slate-700 w-12 capitalize">{type}</div>
                                    <div className="relative flex-1">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input type="number" placeholder="Price/hr" className="pl-8 h-9 bg-white" value={prices[type as keyof typeof prices]} onChange={(e) => handlePriceChange(type as any, e.target.value)} />
                                    </div>
                                    <div className="relative w-24">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input type="number" placeholder="Slots" className="pl-8 h-9 bg-white" value={slots[type as keyof typeof slots]} onChange={(e) => handleSlotChange(type as any, e.target.value)} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 </CardContent>
              </Card>

              {/* 5. VERIFICATION DOCUMENTS */}
              <Card className="border-0 shadow-sm bg-white/60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-slate-700 font-semibold flex items-center gap-2"><FileText size={18} /> Identity Verification</Label>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">Mandatory</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Please upload Aadhaar, PAN, or Proof of Ownership.</p>
                  
                  {existingVerificationDoc && !verificationFile && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg mb-3">
                      <Check size={16} className="text-emerald-600" />
                      <span className="text-sm text-emerald-700 font-medium">Verification document on file</span>
                      <button type="button" onClick={() => setExistingVerificationDoc(null)} className="ml-auto text-xs text-red-500 hover:underline">Replace</button>
                    </div>
                  )}

                  <Input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.pdf" 
                    onChange={(e) => setVerificationFile(e.target.files?.[0] || null)} 
                    className="bg-white"
                  />
                </CardContent>
              </Card>

              {/* 6. Photos */}
              <Card className="border-0 shadow-sm bg-white/60">
                 <CardContent className="p-6">
                    <Label className="text-slate-700 font-semibold mb-3 block">Space Photos</Label>
                    <div className="flex gap-3 flex-wrap">
                       <label className="cursor-pointer flex flex-col items-center justify-center w-28 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-slate-400 hover:text-emerald-600 bg-white/50">
                          <span className="text-xs font-bold">Add Photo</span>
                          <input type="file" accept="image/*" multiple onChange={onPhotoSelect} className="hidden" />
                       </label>
                       {existingImages.map((url, idx) => (
                          <div key={`existing-${idx}`} className="w-28 h-24 rounded-xl overflow-hidden relative shadow-sm group">
                             <img src={url} alt="existing" className="w-full h-full object-cover" />
                             <button type="button" onClick={() => removeExistingPhoto(idx)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                          </div>
                       ))}
                       {photos.map((f, idx) => (
                          <div key={`new-${idx}`} className="w-28 h-24 rounded-xl overflow-hidden relative shadow-sm group border-2 border-emerald-400">
                             <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                             <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><LogOut size={12} /></button>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-1 space-y-6 sticky top-24">
               {/* PREVIEW */}
               <Card className="border-0 shadow-lg bg-slate-900 text-white overflow-hidden rounded-2xl">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
                  <div className="p-5">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Preview</h3>
                     <div className="space-y-3 mb-4">
                        <div className="text-xl font-bold truncate leading-tight">{title || 'Your Title Here'}</div>
                        <div className="text-sm text-slate-400 flex items-start gap-2">
                           <MapPin size={14} className="mt-0.5 shrink-0" /> 
                           <span className="line-clamp-2">{fullAddress || 'Address...'}</span>
                        </div>
                     </div>
                     <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <div className="flex flex-col">
                           <span className="text-xs text-slate-500">Earnings Range</span>
                           <span className="text-xl font-bold text-emerald-400">{getPriceDisplay()}<span className="text-sm text-slate-500 font-normal">/hr</span></span>
                        </div>
                        <div className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                              <Clock size={10} /> {availabilityType === '24/7' ? '24/7' : 'Custom'}
                        </div>
                     </div>
                  </div>
               </Card>

               {/* COMMERCIAL FIELDS (Conditional) */}
               {providerType === 'commercial' && (
                 <Card className="border-0 shadow-sm bg-white/60">
                    <CardContent className="p-5 space-y-3">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2"><Building2 size={16}/> Business Info</h3>
                       <div className="space-y-1">
                         <Label className="text-xs">Business Name</Label>
                         <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Mall / Complex Name" className="bg-white" />
                       </div>
                       <div className="space-y-1">
                         <div className="flex justify-between"><Label className="text-xs">GST Number</Label><span className="text-[10px] text-red-500 font-bold">*Required</span></div>
                         <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="GSTIN..." className="bg-white border-red-200 focus:border-red-500" />
                       </div>
                    </CardContent>
                 </Card>
               )}

               {/* AMENITIES */}
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
                  {isLoading ? 'Processing...' : editId ? 'Update Listing' : 'Publish Listing'}
               </Button>
            </div>

          </form>

          {/* NEW: ELEVATION VERIFICATION OVERLAY (MODAL) */}
        <AnimatePresence>
          {(isVerifyingElevation || elevationData) && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
            >
              <Card className="w-full max-w-md overflow-hidden rounded-[32px] shadow-2xl border-0 bg-white">
                {isVerifyingElevation ? (
                  <div className="p-12 text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-full h-full border-4 border-slate-100 border-t-emerald-600 rounded-full" />
                       <MapPin className="absolute inset-0 m-auto text-emerald-600 animate-bounce" size={32} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900">Verifying Elevation</h2>
                      <p className="text-slate-500 text-sm">Querying Open-Meteo for geospatial safety data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className={`h-2 ${elevationData?.isSafe ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="p-8 text-center space-y-6">
                      {elevationData?.isSafe ? (
                        <>
                          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <ShieldCheck size={40} />
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Flood Safe Zone!</h2>
                            <p className="text-slate-500 text-sm font-medium">Elevation: <span className="text-slate-900 font-bold">{elevationData.elevation}m</span> above sea level.</p>
                            <p className="text-slate-600 leading-relaxed mt-4">
                              Would you like to list your spot for <span className="font-bold text-emerald-600 italic">Storm Mode</span>? You'll earn higher returns during flood emergencies.
                            </p>
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => submitFinalData(false)}>No, Regular Only</Button>
                            <Button className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-lg shadow-emerald-200" onClick={() => submitFinalData(true)}>Yes, Storm Ready</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <AlertTriangle size={40} />
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Standard Zone</h2>
                            <p className="text-slate-500 text-sm font-medium">Elevation: <span className="text-slate-900 font-bold">{elevationData?.elevation}m</span></p>
                            <p className="text-slate-600 leading-relaxed mt-4">
                              This spot is below 10m and not classified as flood-safe. It will be listed for normal hours but hidden during Storm Mode.
                            </p>
                          </div>
                          <Button className="w-full h-12 rounded-2xl bg-slate-900 font-bold text-white mt-4" onClick={() => submitFinalData(false)}>Understood, Publish</Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        </motion.div>
      </main>
    </div>
  );
}