import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QrReader } from '@blackbox-vision/react-qr-reader'; // Ensure you installed this
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Camera } from 'lucide-react';

export default function ScanQR() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId'); // We pass booking ID to know what we are updating
  const action = searchParams.get('action'); // 'checkin' or 'checkout'
  
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (result: any, error: any) => {
    if (!!result && scanning && !processing) {
      setScanning(false); // Stop scanning immediately
      setProcessing(true);
      
      try {
        // 1. Parse QR Data
        const data = JSON.parse(result?.text);
        
        if (!data.spaceId) throw new Error("Invalid QR Code");

        // 2. Validate Space ID Matches Booking
        const { data: booking, error: fetchError } = await supabase
          .from('bookings')
          .select('space_id')
          .eq('id', bookingId)
          .single();

        if (fetchError || booking.space_id !== data.spaceId) {
          throw new Error("Wrong Parking Spot! QR does not match booking.");
        }

        // 3. Perform Action (Check-in or Check-out)
        const now = new Date().toISOString();
        
        if (action === 'checkin') {
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'parked', actual_entry_time: now })
            .eq('id', bookingId);
            
          if (updateError) throw updateError;
          toast({ title: "Welcome!", description: "Vehicle parked successfully." });
        } 
        else if (action === 'checkout') {
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'completed', actual_exit_time: now })
            .eq('id', bookingId);
            
          if (updateError) throw updateError;
          toast({ title: "Goodbye!", description: "Session ended. Have a safe drive." });
        }

        navigate('/my-bookings');

      } catch (err: any) {
        console.error(err);
        toast({ title: "Scan Failed", description: err.message, variant: "destructive" });
        setScanning(true); // Resume scanning on error
        setProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      
      {/* Overlay UI */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center text-white">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
          <ArrowLeft />
        </Button>
        <span className="font-bold uppercase tracking-widest">{action === 'checkin' ? 'Entry Scan' : 'Exit Scan'}</span>
        <div className="w-10"></div>
      </div>

      {/* Scanner Viewport */}
      <Card className="w-full max-w-md aspect-square relative overflow-hidden border-0 bg-transparent shadow-2xl rounded-3xl">
        {processing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-emerald-500 z-30">
            <Loader2 className="w-16 h-16 animate-spin mb-4" />
            <p className="font-bold text-lg">Verifying...</p>
          </div>
        ) : (
          <>
            {/* The Scanner Camera */}
            <div className="absolute inset-0 z-0">
               <QrReader
                  onResult={handleScan}
                  constraints={{ facingMode: 'environment' }} // Use Back Camera
                  containerStyle={{ width: '100%', height: '100%' }}
                  videoStyle={{ objectFit: 'cover' }}
               />
            </div>
            
            {/* Scanning Guide Overlay */}
            <div className="absolute inset-0 z-10 border-[40px] border-black/50 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-emerald-500/50 rounded-xl relative animate-pulse">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1"></div>
              </div>
            </div>
          </>
        )}
      </Card>

      <p className="text-slate-400 mt-8 text-center px-6">
        Align the QR code found at the parking location within the frame to {action === 'checkin' ? 'start' : 'end'} your session.
      </p>

      {/* DEV ONLY: Simulate Button (Remove in Production) */}
      <Button 
        variant="outline" 
        className="mt-8 border-slate-700 text-slate-400 hover:bg-slate-800"
        onClick={() => handleScan({ text: JSON.stringify({ spaceId: '2d332dbc-5a05-4f45-a95c-0211cef3ab5d' }) }, null)} // Replace ID with real one for testing
      >
        <Camera className="mr-2 h-4 w-4" /> Simulate Scan (Dev)
      </Button>
    </div>
  );
}