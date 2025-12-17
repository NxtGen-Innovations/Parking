import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Building2, ArrowLeft, ArrowRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

import BACKGROUND_IMAGE from '../assets/background-hero.jpg';
import PARKING_1 from '../assets/parking1.jpg';
import PARKING_2 from '../assets/image.png';

const PRIMARY_TEXT = 'text-slate-900';
const SECONDARY_TEXT = 'text-slate-600';

const PRIVATE_ACCENT = {
  bg: 'bg-sky-500 hover:bg-sky-600',
  text: 'text-sky-400',
  dot: 'bg-sky-500',
  gradient: 'from-sky-500/20 to-sky-500/5',
  border: 'border-sky-500/20',
  shadow: 'shadow-[0_10px_25px_rgba(14,165,233,0.4)]',
};

const COMMERCIAL_ACCENT = {
  bg: 'bg-emerald-600 hover:bg-emerald-700',
  text: 'text-emerald-400',
  dot: 'bg-emerald-600',
  gradient: 'from-emerald-500/20 to-emerald-500/5',
  border: 'border-emerald-500/20',
  shadow: 'shadow-[0_10px_25px_rgba(16,185,129,0.4)]',
};

export default function RegisterType() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  const providerTypes = [
    {
      id: 'private',
      title: 'Private Parking',
      description: 'Perfect for homeowners and residents renting out driveway or garage spots.',
      icon: Home,
      accent: PRIVATE_ACCENT,
      examples: ['Driveway spaces', 'Garage spots', 'Apartment parking'],
      imageUrl: PARKING_1,
    },
    {
      id: 'commercial',
      title: 'Commercial Parking',
      description: 'Designed for parking lot operators, businesses, and event venues.',
      icon: Building2,
      accent: COMMERCIAL_ACCENT,
      examples: ['Public parking lots', 'Office complexes', 'Event venues'],
      imageUrl: PARKING_2,
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${PRIMARY_TEXT}`}>
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} 
      >
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Logo color="dark" />
          <div className="flex items-center gap-4">
            <span className={`hidden sm:block text-sm ${SECONDARY_TEXT}`}>
              Hi, {user?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut size={18} />
              <span className="ml-2 hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Back Button (Removed the strip/border) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/choose-role')}
          className="group text-slate-600 hover:text-slate-900 bg-white/40 hover:bg-white/60 backdrop-blur-md shadow-sm border border-white/20 rounded-full px-4 transition-all"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to choices
        </Button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 md:py-10">
        <div className="w-full max-w-5xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="text-center mb-10 md:mb-12">
              <p className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-[11px] md:text-xs font-medium text-slate-600 border border-slate-200 mb-4 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-slate-400 mr-2" />
                Step 2: Select Provider Type
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                What kind of space do you have?
              </h1>
              <p className={`text-sm md:text-base ${SECONDARY_TEXT} max-w-2xl mx-auto leading-relaxed`}>
                Select the option that best describes your parking space. 
                We’ll customize the setup process based on your selection.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-7 md:gap-8">
              {providerTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.1 * index }}
                >
                  <Card
                    // Redirects to Dashboard with pre-selection logic
                    onClick={() => navigate('/provider-dashboard', { state: { preselect: type.id } })}
                    className={`
                      group cursor-pointer h-full relative overflow-hidden rounded-3xl border-0
                      shadow-xl shadow-slate-900/20
                      transition-all duration-300
                      hover:scale-[1.02] hover:shadow-2xl
                    `}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${type.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-slate-950/70 group-hover:bg-slate-950/60 transition-colors duration-300" />

                    <div className="relative z-10 flex flex-col h-full">
                      <CardHeader className="pb-5 pt-8 px-8 flex-1">
                        <div
                          className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                            backdrop-blur-md bg-white/10
                            border ${type.accent.border}
                            shadow-inner
                          `}
                        >
                          <type.icon className={`h-7 w-7 ${type.accent.text}`} />
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-bold text-white">
                          {type.title}
                        </CardTitle>
                        <CardDescription className="text-slate-200 text-sm md:text-base mt-3 leading-relaxed">
                          {type.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-8 pb-8">
                        <div className="mb-8 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                            Examples
                          </p>
                          <ul className="space-y-2.5">
                            {type.examples.map((example) => (
                              <li key={example} className="flex items-center gap-3 text-sm font-medium text-slate-100">
                                <div className={`h-1.5 w-1.5 rounded-full ${type.accent.dot}`} />
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          className={`
                            w-full h-11 md:h-12 text-sm md:text-base rounded-xl font-medium text-white
                            transition-all duration-300
                            group-hover:translate-x-1 border-0
                            ${type.accent.bg} ${type.accent.shadow}
                          `}
                        >
                          Select Option
                          <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 opacity-90" />
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}