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

  // --- ANIMATION VARIANTS (Typed to fix errors) ---
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900">
      
      {/* --- BACKGROUND LAYER --- */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 scale-105" 
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }} 
      />
      {/* Modern Gradient Overlay: Improves text readability while keeping the bg visible */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95 backdrop-blur-[2px]" />

      {/* --- HEADER --- */}
      {/* Kept in same place, but cleaned up as requested */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 w-full"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-6 md:px-6">
          <div className="scale-110 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(0)}>
            <Logo color="dark" /> 
          </div>
          {/* Removed Nav Links & Top Button as requested for cleaner look */}
        </div>
      </motion.header>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-10">
        <motion.div 
          className="w-full max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            
          {/* HERO SECTION */}
          {/* Kept placement exact, upgraded styling */}
          <div className="px-4 md:px-8 py-8 md:py-10 text-center md:text-left"> 
            <motion.div variants={itemVariants} className="space-y-8 max-w-4xl">
              
              {/* Badge */}
              <div className="inline-flex items-center rounded-full bg-emerald-50/80 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-emerald-700 border border-emerald-200 shadow-sm">
                <Sparkles size={14} className="mr-2 animate-pulse text-emerald-500" />
                Book a parking spot before you arrive
              </div>

              {/* Title with App Name Integration */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                  Find parking with{' '}
                  <span className="transparent-text bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 inline-block">
                    ParkEase
                  </span>
                  <br />
                  <span className="text-4xl md:text-5xl lg:text-6xl text-slate-700 font-bold">
                    in crowded areas.
                  </span>
                </h1>
                
                <p className="max-w-xl text-lg text-slate-600 leading-relaxed md:mx-0 mx-auto">
                  ParkEase helps you discover and book reliable parking spaces
                  in busy zones before you reach there. Save time, avoid
                  circling, and arrive stress-free.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col items-stretch gap-4 pt-4 sm:flex-row sm:items-center md:justify-start justify-center">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition-transform hover:-translate-y-1" 
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Start parking smarter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 text-lg border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-400 bg-white/50 backdrop-blur-sm"
                  onClick={() => navigate('/auth?mode=login')}
                >
                  Log in
                </Button>
              </div>

              <p className="text-xs text-slate-500 font-medium md:text-left text-center">
                No long forms. Create an account in under a minute.
              </p>
            </motion.div>
          </div>

          {/* FEATURES SECTION */}
          {/* Kept placement exact, upgraded to Glass Cards */}
          <motion.div
            className="px-4 md:px-8 pt-12 pb-8" 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center md:text-left flex items-center gap-2">
              Why drivers choose <span className="text-emerald-600">ParkEase</span>
            </h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300" 
                >
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className="mt-12 text-center text-sm text-slate-400 font-medium uppercase tracking-widest">
              Trusted by drivers across busy city centers
            </p>
          </motion.div>
          
        </motion.div>
      </main>
    </div>
  );
}