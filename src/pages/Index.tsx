import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, MapPin, Clock, Shield } from 'lucide-react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

// ----------------------------------------------------------------------
// *** CORRECTED: Import the image using the relative path and new file name ***
// ----------------------------------------------------------------------
// Path from src/pages/Index.tsx to src/assets/background-hero.jpg is:
import BACKGROUND_IMAGE from '../assets/background-hero.jpg'; 

const BACKGROUND_IMAGE_URL = BACKGROUND_IMAGE; 
// ----------------------------------------------------------------------

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/choose-role');
    }
  }, [user, isLoading, navigate]);

  const features = [
    {
      icon: MapPin,
      title: 'Smart location search',
      description:
        'Instantly see nearby parking spaces around malls, offices, and busy streets.',
    },
    {
      icon: Clock,
      title: 'Real-time availability',
      description:
        'Reserve in advance or book on the go with up-to-date availability and pricing.',
    },
    {
      icon: Shield,
      title: 'Safe & verified',
      description:
        'Only trusted, verified providers with clear directions and secure access.',
    },
  ];

  // --- Theme Colors (Kept for contrast against the light overlay) ---
  const ACCENT_COLOR_CLASS = 'bg-emerald-600 hover:bg-emerald-700 text-white';
  const PRIMARY_TEXT_COLOR_CLASS = 'text-slate-900'; 
  const SECONDARY_TEXT_COLOR_CLASS = 'text-slate-700';
  const FEATURE_ICON_COLOR_CLASS = 'bg-emerald-600/15 text-emerald-700';

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${PRIMARY_TEXT_COLOR_CLASS}`}>
      
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        // Using the imported constant here
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }} 
      >
        {/* Semi-transparent overlay to ensure all text remains readable */}
        <div className="absolute inset-0 bg-white/80 backdrop-filter backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-6 md:px-6">
          <Logo color="dark" /> 
          <div className={`hidden md:flex items-center gap-6 text-xs md:text-sm ${SECONDARY_TEXT_COLOR_CLASS}`}>
            <button className={`${PRIMARY_TEXT_COLOR_CLASS} font-medium`}>Home</button>
            <button className="hover:text-slate-900">
              How it works
            </button>
            <button className="hover:text-slate-900">
              For providers
            </button>
            <button className="hover:text-slate-900">
              Pricing
            </button>
          </div>
          <Button
            size="sm"
            className={`hidden md:inline-flex rounded-full px-5 text-xs md:text-sm ${ACCENT_COLOR_CLASS}`}
            onClick={() => navigate('/auth?mode=signup')}
          >
            Get started
          </Button>
        </div>
      </header>

      {/* Main content - Directly on the background */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-10">
        <div className="w-full max-w-6xl">
            
          {/* Hero section */}
          <div className="px-4 md:px-8 py-8 md:py-10"> 
            <motion.div 
              className="space-y-7 max-w-3xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-[11px] md:text-xs font-medium text-emerald-800 border border-emerald-300 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-600 mr-2" />
                Book a parking spot before you arrive
              </div>

              <div className="space-y-4">
                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight ${PRIMARY_TEXT_COLOR_CLASS}`}>
                  Find parking in
                  <span className="block text-emerald-700">
                    crowded areas in minutes.
                  </span>
                </h1>
                <p className="max-w-xl text-base text-slate-700">
                  ParkEase helps you discover and book reliable parking spaces
                  in busy zones before you reach there. Save time, avoid
                  circling, and arrive stress-free.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className={`w-full sm:w-auto rounded-full px-8 py-6 ${ACCENT_COLOR_CLASS} text-base shadow-[0_12px_30px_rgba(16,185,129,0.4)]`} 
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Start parking smarter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full px-8 py-6 border-slate-400 text-slate-800 bg-transparent hover:bg-slate-100/70 text-base"
                  onClick={() => navigate('/auth?mode=login')}
                >
                  Log in
                </Button>
              </div>

              <p className="text-[11px] md:text-xs text-slate-600 pt-1">
                No long forms. Create an account in under a minute and start
                booking secure spots immediately.
              </p>
            </motion.div>
          </div>

          {/* Features section - Now a distinct block below the hero */}
          <motion.div
            className="px-4 md:px-8 pt-16 pb-8" 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className={`text-xl font-bold ${PRIMARY_TEXT_COLOR_CLASS} mb-8 text-center md:text-left`}>
              Why drivers choose ParkEase
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white/95 p-6 shadow-xl" 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.08 * index }}
                  whileHover={{ y: -4, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.25)' }} 
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${FEATURE_ICON_COLOR_CLASS}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className={`text-lg font-bold ${PRIMARY_TEXT_COLOR_CLASS} mb-1.5`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className="mt-12 text-center text-xs text-slate-600">
              Trusted by drivers across busy city centers and commercial hubs.
            </p>
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}
