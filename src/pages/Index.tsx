import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, MapPin, Clock, Shield, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

// Image Import
import BACKGROUND_IMAGE from '../assets/background-hero.jpg'; 

const BACKGROUND_IMAGE_URL = BACKGROUND_IMAGE; 

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
      description: 'Instantly see nearby parking spaces around malls, offices, and busy streets.',
    },
    {
      icon: Clock,
      title: 'Real-time availability',
      description: 'Reserve in advance or book on the go with up-to-date availability and pricing.',
    },
    {
      icon: Shield,
      title: 'Safe & verified',
      description: 'Only trusted, verified providers with clear directions and secure access.',
    },
  ];

  // --- ANIMATION VARIANTS ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 50, damping: 20 } 
    },
  };

  // --- HELPER COMPONENT FOR BRANDING ---
  const ParkEaseText = () => (
    <span className="tracking-tight">
      Park<span className="text-emerald-600 font-extrabold">Ease</span>
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900">
      
      {/* --- BACKGROUND LAYER --- */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 scale-105" 
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }} 
      />
      
      {/* --- UPDATED OVERLAY --- */}
      {/* Reduced opacity from 85% to 60% in the middle, and 95% to 90% at edges */}
      {/* This makes the background image significantly more visible */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/90 via-white/60 to-white/90 backdrop-blur-[2px]" />

      {/* --- HEADER --- */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 w-full"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-6">
          <div className="scale-105 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(0)}>
            <Logo color="dark" /> 
          </div>
        </div>
      </motion.header>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div 
          className="w-full max-w-7xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            
          {/* HERO SECTION */}
          <div className="px-4 py-10 text-center md:text-left"> 
            <motion.div variants={itemVariants} className="space-y-8 max-w-3xl">
              
              {/* Badge */}
              <div className="inline-flex items-center rounded-full bg-emerald-50/90 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-emerald-800 border border-emerald-200/50 shadow-sm">
                <Sparkles size={14} className="mr-2 animate-pulse text-emerald-600" />
                Book a parking spot before you arrive
              </div>

              {/* Title with App Name Integration */}
              <div className="space-y-5">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 drop-shadow-sm">
                  Find parking with{' '}
                  <span className="whitespace-nowrap"><ParkEaseText /></span>
                  <br />
                  <span className="text-slate-800">
                    in crowded areas.
                  </span>
                </h1>
                
                <p className="max-w-xl text-lg text-slate-700 leading-relaxed md:mx-0 mx-auto font-semibold">
                  <ParkEaseText /> helps you discover and book reliable parking spaces
                  in busy zones before you reach there. Save time, avoid
                  circling, and arrive stress-free.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col items-stretch gap-4 pt-4 sm:flex-row sm:items-center md:justify-start justify-center">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_8px_30px_rgba(5,150,105,0.4)] transition-transform hover:-translate-y-1 font-bold border-none" 
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Start parking smarter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 text-lg border-slate-300 text-slate-800 hover:bg-white hover:text-slate-900 hover:border-slate-400 bg-white/70 backdrop-blur-md font-bold"
                  onClick={() => navigate('/auth?mode=login')}
                >
                  Log in
                </Button>
              </div>

              <p className="text-xs text-slate-600 font-bold md:text-left text-center tracking-wide uppercase">
                No long forms. Create an account in under a minute.
              </p>
            </motion.div>
          </div>

          {/* FEATURES SECTION */}
          <motion.div
            className="px-4 pt-16 pb-8" 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center md:text-left tracking-tight drop-shadow-sm">
              Why drivers choose <ParkEaseText />
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group rounded-[2rem] border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300" 
                >
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-emerald-100">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-base text-slate-700 leading-relaxed font-semibold">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className="mt-16 text-center text-sm text-slate-500 font-extrabold uppercase tracking-widest">
              Trusted by drivers across busy city centers
            </p>
          </motion.div>
          
        </motion.div>
      </main>
    </div>
  );
}