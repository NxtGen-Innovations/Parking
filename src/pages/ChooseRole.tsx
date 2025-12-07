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
      description:
        'Find and reserve secure parking near malls, markets & crowded areas.',
      icon: Search,
      accent: 'sky',
      path: '/browse',
      features: ['Nearby discovery', 'Live pricing', 'Instant booking'],
    },
    {
      id: 'register',
      title: 'Register Your Space',
      description:
        'Earn money by listing unused private or commercial parking spots.',
      icon: Plus,
      accent: 'emerald',
      path: '/register-type',
      features: ['Smart listing tools', 'Price control', 'Booking management'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
      {/* Background vignette to match Index/Auth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-slate-400">
              Hi, {user?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-300 hover:text-white"
            >
              <LogOut size={18} />
              <span className="ml-2 hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 md:py-14">
        {/* Glass container like Auth/Index */}
        <motion.div
          className="w-full max-w-5xl rounded-[30px] border border-white/10 bg-white/5 bg-clip-padding backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.6)] px-5 md:px-8 py-8 md:py-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Header inside card */}
          <div className="text-center mb-10 md:mb-12">
            <p className="inline-flex items-center rounded-full bg-black/40 px-4 py-1.5 text-[11px] md:text-xs font-medium text-sky-300 border border-white/10 mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2" />
              Choose your ParkEase journey
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">
              What would you like to do?
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Pick a role to get a tailored experience for drivers or providers.
            </p>
          </div>

          {/* Cards */}
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
                    group cursor-pointer
                    bg-slate-900/60 
                    backdrop-blur-xl 
                    border border-white/10
                    shadow-2xl shadow-black/50
                    transition-all duration-300
                    hover:scale-[1.03]
                    rounded-3xl
                  `}
                >
                  <CardHeader className="pb-5 pt-6 px-7 md:px-8">
                    <div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mb-5
                        bg-gradient-to-br 
                        ${
                          role.accent === 'sky'
                            ? 'from-sky-500/25 to-sky-300/10'
                            : 'from-emerald-500/25 to-emerald-300/10'
                        }
                        border border-white/15
                      `}
                    >
                      <role.icon
                        className={`
                          h-8 w-8 
                          ${
                            role.accent === 'sky'
                              ? 'text-sky-300'
                              : 'text-emerald-300'
                          }
                        `}
                      />
                    </div>

                    <CardTitle className="text-xl md:text-2xl text-slate-50 font-semibold">
                      {role.title}
                    </CardTitle>

                    <CardDescription className="text-slate-400 text-sm md:text-base mt-2 leading-relaxed">
                      {role.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-7 md:px-8 pb-7 md:pb-8">
                    <div className="space-y-3 mb-6">
                      {role.features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-slate-200 text-sm"
                        >
                          <div
                            className={`
                              h-2 w-2 rounded-full 
                              ${
                                role.accent === 'sky'
                                  ? 'bg-sky-400'
                                  : 'bg-emerald-400'
                              }
                            `}
                          />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`
                        w-full h-11 md:h-12 text-sm md:text-base rounded-xl
                        transition-all duration-300
                        group-hover:translate-x-1
                        ${
                          role.accent === 'sky'
                            ? 'bg-sky-500 hover:bg-sky-600'
                            : 'bg-emerald-500 hover:bg-emerald-600'
                        }
                        shadow-[0_10px_25px_rgba(56,189,248,0.35)]
                      `}
                    >
                      Get started
                      <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
