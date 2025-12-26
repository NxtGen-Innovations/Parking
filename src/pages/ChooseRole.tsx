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
import { Search, Plus, ArrowRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

import BACKGROUND_IMAGE from '../assets/background-hero.jpg'; 
const BACKGROUND_IMAGE_URL = BACKGROUND_IMAGE; 

import DRIVER_ROLE_BG from '../assets/driver-role.png'; 
import PARKING_ROLE_BG from '../assets/parking-role.png'; 

const PRIMARY_TEXT_COLOR_CLASS = 'text-slate-900';
const SECONDARY_TEXT_COLOR_CLASS = 'text-slate-700';

const SKY_ACCENT_COLORS = {
    bg: 'bg-sky-500 hover:bg-sky-600',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    gradient: 'from-sky-100/70 to-sky-50/50',
    shadow: 'shadow-[0_10px_25px_rgba(56,189,248,0.25)]',
    cardText: 'text-white', 
    cardDescription: 'text-sky-100',
    cardSecondary: 'text-sky-200',
};

const EMERALD_ACCENT_COLORS = {
    bg: 'bg-emerald-600 hover:bg-emerald-700',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    gradient: 'from-emerald-100/70 to-emerald-50/50',
    shadow: 'shadow-[0_10px_25px_rgba(16,185,129,0.25)]',
    cardText: 'text-white', 
    cardDescription: 'text-emerald-100', 
    cardSecondary: 'text-emerald-200', 
};

export default function ChooseRole() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  const roles = [
    {
      id: 'book',
      title: 'Book a Parking Space',
      description: 'Find and reserve secure parking near malls, markets & crowded areas.',
      icon: Search,
      accent: SKY_ACCENT_COLORS, 
      path: '/browse',
      features: ['Nearby discovery', 'Live pricing', 'Instant booking'],
      imageUrl: DRIVER_ROLE_BG, 
    },
    {
      id: 'register',
      title: 'Register Your Space',
      description: 'Earn money by listing unused private or commercial parking spots.',
      icon: Plus,
      accent: EMERALD_ACCENT_COLORS, 
      // 👇 UPDATED: Directly to Dashboard, skipping RegisterType
      path: '/provider-dashboard', 
      features: ['Smart listing tools', 'Price control', 'Booking management'],
      imageUrl: PARKING_ROLE_BG, 
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${PRIMARY_TEXT_COLOR_CLASS}`}>
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }} 
      >
        <div className="absolute inset-0 bg-white/85 backdrop-filter backdrop-blur-sm" />
      </div>

      <header className="relative z-20 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Logo color="dark" />
          <div className="flex items-center gap-4">
            <span className={`hidden sm:block text-sm ${SECONDARY_TEXT_COLOR_CLASS}`}>
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

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 md:py-14">
        <div className="w-full max-w-5xl px-5 md:px-8 py-8 md:py-10"> 
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="text-center mb-10 md:mb-12">
              <p className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-[11px] md:text-xs font-medium text-emerald-800 border border-emerald-300 mb-4">
                <span className="h-2 w-2 rounded-full bg-emerald-600 mr-2" />
                Choose your ParkEase journey
              </p>
              <h1 className={`text-3xl md:text-4xl font-bold ${PRIMARY_TEXT_COLOR_CLASS} mb-2`}>
                What would you like to do?
              </h1>
              <p className={`text-sm md:text-base ${SECONDARY_TEXT_COLOR_CLASS}`}>
                Pick a role to get a tailored experience for drivers or providers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-7 md:gap-8">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.1 * index }}
                >
                  <Card
                    onClick={() => navigate(role.path)}
                    className={`
                      group cursor-pointer relative overflow-hidden
                      ${role.imageUrl ? 'text-white' : 'bg-white/80 border border-slate-200'}
                      backdrop-blur-xl shadow-lg transition-all duration-300
                      hover:scale-[1.03] rounded-3xl
                    `}
                  >
                      {role.imageUrl && (
                          <div
                              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                              style={{ backgroundImage: `url(${role.imageUrl})` }}
                          >
                              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                          </div>
                      )}
                      
                      <div className="relative z-10">
                        <CardHeader className="pb-5 pt-6 px-7 md:px-8">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${role.imageUrl ? 'bg-white/20 border-white/20' : 'bg-white border-slate-200'} ${role.accent.gradient}`}>
                            <role.icon className={`h-8 w-8 ${role.accent.text}`} />
                          </div>
                          <CardTitle className={`text-xl md:text-2xl font-semibold ${role.accent.cardText}`}>
                            {role.title}
                          </CardTitle>
                          <CardDescription className={`text-sm md:text-base mt-2 leading-relaxed ${role.accent.cardDescription}`}>
                            {role.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="px-7 md:px-8 pb-7 md:pb-8">
                          <div className="space-y-3 mb-6">
                            {role.features.map((feature, i) => (
                              <div key={i} className={`flex items-center gap-2 text-sm ${role.accent.cardSecondary}`}>
                                <div className={`h-2 w-2 rounded-full ${role.accent.dot}`} />
                                {feature}
                              </div>
                            ))}
                          </div>
                          <Button className={`w-full h-11 md:h-12 text-sm md:text-base rounded-xl transition-all duration-300 group-hover:translate-x-1 ${role.accent.bg} ${role.accent.shadow}`}>
                            Get started
                            <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
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