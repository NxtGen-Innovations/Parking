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
      title: 'Private Parking Provider',
      description: 'Home owners, shopkeepers, and apartment residents.',
      icon: Home,
      accent: 'sky',
      examples: ['Driveway spaces', 'Garage spots', 'Shop front parking'],
      path: '/register-space?type=private',
    },
    {
      id: 'commercial',
      title: 'Commercial Parking Provider',
      description: 'Paid parking lots, operators, and commercial facilities.',
      icon: Building2,
      accent: 'emerald',
      examples: ['Parking lots', 'Multi-level garages', 'Event venues'],
      path: '/register-space?type=commercial',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
      {/* Background vignette to match other pages */}
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

      {/* Back button row */}
      <div className="relative z-20 w-full border-b border-slate-800/70 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/choose-role')}
            className="text-slate-400 hover:text-slate-100 px-0 text-sm md:text-base"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to choices
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 md:py-14">
        {/* Outer glass container */}
        <motion.div
          className="w-full max-w-5xl rounded-[30px] border border-white/10 bg-white/5 bg-clip-padding backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.6)] px-5 md:px-8 py-8 md:py-10"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="text-center mb-10 md:mb-12">
            <p className="inline-flex items-center rounded-full bg-black/40 px-4 py-1.5 text-[11px] md:text-xs font-medium text-sky-300 border border-white/10 mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2" />
              For parking providers on ParkEase
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-3">
              What type of provider are you?
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              Select the option that best describes the parking space you want
              to list. We’ll tailor the setup to match your needs.
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
                  onClick={() => navigate(type.path)}
                >
                  <CardHeader className="pb-5 pt-6 px-7 md:px-8">
                    <div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mb-5
                        bg-gradient-to-br 
                        ${
                          type.accent === 'sky'
                            ? 'from-sky-500/25 to-sky-300/10'
                            : 'from-emerald-500/25 to-emerald-300/10'
                        }
                        border border-white/15
                      `}
                    >
                      <type.icon
                        className={`
                          h-8 w-8 
                          ${
                            type.accent === 'sky'
                              ? 'text-sky-300'
                              : 'text-emerald-300'
                          }
                        `}
                      />
                    </div>

                    <CardTitle className="text-xl md:text-2xl text-slate-50 font-semibold">
                      {type.title}
                    </CardTitle>

                    <CardDescription className="text-slate-400 text-sm md:text-base mt-2 leading-relaxed">
                      {type.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-7 md:px-8 pb-7 md:pb-8">
                    <div className="mb-6">
                      <p className="text-sm md:text-base font-medium text-slate-100 mb-2">
                        Examples
                      </p>
                      <ul className="space-y-2">
                        {type.examples.map((example) => (
                          <li
                            key={example}
                            className="flex items-center gap-2 text-sm md:text-base text-slate-300"
                          >
                            <div
                              className={`h-2 w-2 rounded-full ${
                                type.accent === 'sky'
                                  ? 'bg-sky-400'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className={`
                        w-full h-11 md:h-12 text-sm md:text-base rounded-xl
                        flex items-center justify-center
                        group-hover:translate-x-1
                        transition-all duration-300
                        ${
                          type.accent === 'sky'
                            ? 'bg-sky-500 hover:bg-sky-600'
                            : 'bg-emerald-500 hover:bg-emerald-600'
                        }
                        shadow-[0_10px_25px_rgba(56,189,248,0.35)]
                      `}
                    >
                      Select
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
