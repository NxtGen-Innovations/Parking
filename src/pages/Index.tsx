import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, MapPin, Clock, Shield } from 'lucide-react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
      {/* Background gradients (liquid-like glow) */}
      <div className="pointer-events-none absolute inset-0">
        {/* lighting blobs removed here */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-6 md:px-6">
          <Logo />
          <div className="hidden md:flex items-center gap-6 text-xs md:text-sm text-slate-300">
            <button className="text-slate-100 font-medium">Home</button>
            <button className="hover:text-slate-100 text-slate-400">
              How it works
            </button>
            <button className="hover:text-slate-100 text-slate-400">
              For providers
            </button>
            <button className="hover:text-slate-100 text-slate-400">
              Pricing
            </button>
          </div>
          <Button
            size="sm"
            className="hidden md:inline-flex rounded-full px-5 bg-sky-500 hover:bg-sky-600 text-xs md:text-sm"
            onClick={() => navigate('/auth?mode=signup')}
          >
            Get started
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 md:py-10">
        {/* Outer glass container (like .container in your HTML) */}
        <motion.div
          className="w-full max-w-6xl rounded-[30px] border border-white/10 bg-white/5 bg-clip-padding backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.6)] overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Inner top nav strip (subtle glass) */}
          <div className="flex items-center justify-between border-b border-white/8 bg-black/40 px-4 md:px-8 py-3">
            <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-400">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              Live in: <span className="text-slate-100">Chennai metro zone</span>
            </div>
            <div className="flex gap-2 text-[11px] md:text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Driver
              </span>
              <span className="rounded-full border border-white/5 bg-black/40 px-3 py-1 opacity-70">
                Provider
              </span>
            </div>
          </div>

          {/* Hero + Snapshot section inside glass container */}
          <div className="px-4 md:px-8 py-8 md:py-10 flex flex-col md:flex-row gap-10 md:gap-12">
            {/* Left: hero text */}
            <div className="flex-1 space-y-7">
              <div className="inline-flex items-center rounded-full bg-black/40 px-4 py-1.5 text-[11px] md:text-xs font-medium text-sky-300 border border-white/10 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-sky-400 mr-2" />
                Book a parking spot before you arrive
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-slate-50">
                  Find parking in
                  <span className="block text-sky-400">
                    crowded areas in minutes.
                  </span>
                </h1>
                <p className="max-w-xl text-sm md:text-base text-slate-200/80">
                  ParkEase helps you discover and book reliable parking spaces
                  in busy zones before you reach there. Save time, avoid
                  circling, and arrive stress-free.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 py-6 bg-sky-500 hover:bg-sky-600 text-white text-sm md:text-base shadow-[0_12px_30px_rgba(56,189,248,0.4)]"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Start parking smarter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full px-8 py-6 border-white/15 text-slate-100 bg-white/5 hover:bg-white/10 text-sm md:text-base"
                  onClick={() => navigate('/auth?mode=login')}
                >
                  Log in
                </Button>
              </div>

              <p className="text-[11px] md:text-xs text-slate-300 pt-1">
                No long forms. Create an account in under a minute and start
                booking secure spots immediately.
              </p>
            </div>

            {/* Right: glass snapshot panel, more like your reference cards */}
            <motion.div
              className="flex-1 flex items-center"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
            >
              <div className="w-full max-w-md mx-auto space-y-4">
                {/* Main glass card */}
                <div className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl p-6 md:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
                  <div className="space-y-6">
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] md:text-xs font-medium text-slate-400 uppercase tracking-[0.12em]">
                          Live snapshot
                        </p>
                        <p className="text-lg md:text-xl font-semibold text-slate-50">
                          Parking activity today
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
                        <span className="rounded-full bg-white/5 border border-white/15 px-3 py-1">
                          Today
                        </span>
                        <span className="rounded-full bg-transparent border border-white/8 px-3 py-1 opacity-70">
                          Weekly
                        </span>
                      </div>
                    </div>

                    {/* Spots booked */}
                    <motion.div
                      className="flex items-center justify-between rounded-2xl bg-white/5 px-5 py-4 border border-white/12"
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.5, delay: 0.15 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="space-y-1">
                        <p className="text-[10px] md:text-xs font-medium text-slate-300 uppercase tracking-[0.14em]">
                          Spots booked
                        </p>
                        <p className="text-3xl md:text-4xl font-semibold text-slate-50">
                          842
                        </p>
                        <p className="text-[10px] text-slate-300/80">
                          across busiest areas
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] md:text-xs font-medium text-emerald-300 inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          +18% today
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Peak 5–8 PM
                        </p>
                      </div>
                    </motion.div>

                    {/* Middle stats row */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div
                        className="rounded-2xl bg-white/5 px-4 py-4 border border-white/10"
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <p className="text-[10px] text-slate-300 uppercase tracking-[0.12em]">
                          Avg time saved
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-50">
                          14 min
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          vs street parking
                        </p>
                      </motion.div>

                      <motion.div
                        className="rounded-2xl bg-white/5 px-4 py-4 border border-white/10"
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <p className="text-[10px] text-slate-300 uppercase tracking-[0.12em]">
                          Active zones
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-50">
                          32
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          malls & CBDs
                        </p>
                      </motion.div>
                    </div>

                    {/* City chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] md:text-xs text-slate-300/90">
                      <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                        Chennai · Bengaluru · Mumbai
                      </span>
                      <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                        Live pricing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Small glass sub-row like “stats tiles” under the main card */}
                <div className="grid grid-cols-2 gap-3 text-[11px] md:text-xs">
                  <div className="rounded-2xl bg-black/50 border border-white/10 px-4 py-3 flex items-center justify-between">
                    <span className="text-slate-300">Instant entry</span>
                    <span className="text-slate-100 font-medium">QR pass</span>
                  </div>
                  <div className="rounded-2xl bg-black/50 border border-white/10 px-4 py-3 flex items-center justify-between">
                    <span className="text-slate-300">Support</span>
                    <span className="text-slate-100 font-medium">24/7</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features section inside same glass container bottom area */}
          <motion.div
            className="border-t border-white/10 bg-black/30 px-4 md:px-8 py-8 md:py-10"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="text-sm md:text-base font-semibold text-slate-100 mb-6">
              Why drivers choose ParkEase
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.45)]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.08 * index }}
                  whileHover={{ y: -4 }}
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-slate-50 mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-200/85">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className="mt-8 text-center text-[11px] md:text-xs text-slate-400">
              Trusted by drivers across busy city centers and commercial hubs.
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 bg-black/80">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs md:text-sm text-slate-500 md:text-left">
          © 2024 ParkEase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
