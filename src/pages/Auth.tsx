import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { toast } from '@/hooks/use-toast';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Apple,
  Chrome,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ----------------------------------------------------------------------
// *** THEME SETUP ***
// ----------------------------------------------------------------------
import BACKGROUND_IMAGE from '../assets/background-hero.jpg'; 
const BACKGROUND_IMAGE_URL = BACKGROUND_IMAGE; 

// Theme Colors
const ACCENT_COLOR_CLASS = 'bg-emerald-600 hover:bg-emerald-700 text-white';
const PRIMARY_TEXT_COLOR_CLASS = 'text-slate-900';
const SECONDARY_TEXT_COLOR_CLASS = 'text-slate-700';
const CARD_COLOR_CLASS = 'bg-white/95 border-slate-200 shadow-xl';
const INPUT_COLOR_CLASS = 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl';

// ----------------------------------------------------------------------

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // 🔹 Read ?mode= from URL and switch auth mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        await login(email, password);
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in.',
        });
        navigate('/choose-role');
      } else {
        // --- SIGNUP FLOW ---
        await signup(email, password, name);
        toast({
          title: 'Account created!',
          description: 'Your account has been created successfully. Please sign in.',
        });
        // Switch to login mode automatically so user can sign in
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Something went wrong. Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dummy handlers for social auth
  const handleGoogle = () => {
    toast({
      title: 'Google sign in',
      description: 'Social login requires additional Supabase configuration.',
    });
  };

  const handleApple = () => {
    toast({
      title: 'Apple sign in',
      description: 'Social login requires additional Supabase configuration.',
    });
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${PRIMARY_TEXT_COLOR_CLASS}`}>
      
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }} 
      >
        <div className="absolute inset-0 bg-white/85 backdrop-filter backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-start px-4 py-4 md:px-8">
          <Logo color="dark" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 md:py-16">
        <motion.div
          className={`w-full max-w-5xl rounded-[30px] border border-slate-200 ${CARD_COLOR_CLASS} overflow-hidden flex flex-col md:flex-row shadow-[0_18px_60px_rgba(0,0,0,0.15)]`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Left: Intro / Marketing Panel */}
          <div className="hidden md:flex flex-1 flex-col justify-between border-r border-slate-200 bg-emerald-50/50 px-8 py-10">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-[11px] font-medium text-emerald-800 border border-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-600 mr-2" />
                Secure sign in • 2-step protection
              </p>

              <div className="space-y-3">
                <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
                  One account for
                  <span className="block text-emerald-700">parking everywhere.</span>
                </h1>
                <p className="text-sm text-slate-700 max-w-md">
                  Save your favorite locations, view your bookings, and switch
                  between driver and parking provider in a single dashboard.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="font-medium text-slate-900">3x faster</p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    check-in with saved vehicles
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="font-medium text-slate-900">All in one</p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    history, payments & rewards
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-[11px] text-slate-500">
              Protected with modern encryption • No spam, ever.
            </p>
          </div>

          {/* Right: Auth Card */}
          <motion.div
            className="flex-1 flex items-center justify-center px-4 py-8 md:px-8 md:py-10 bg-white/70"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            <Card className="w-full max-w-md border-none bg-transparent shadow-none rounded-3xl">
              <CardHeader className="text-center pb-3 pt-6 px-0">
                <CardTitle className={`text-2xl md:text-3xl font-bold ${PRIMARY_TEXT_COLOR_CLASS}`}>
                  {isLogin ? 'Welcome back' : 'Create your account'}
                </CardTitle>
                <CardDescription className={`text-sm md:text-base ${SECONDARY_TEXT_COLOR_CLASS} mt-2`}>
                  {isLogin
                    ? 'Sign in to find and manage your parking spaces.'
                    : 'Join ParkEase and start parking smarter in crowded areas.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 pb-8 px-0">
                {/* Social Auth Buttons */}
                {!isLogin && (
                  <div className="mb-6 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl border-slate-300 bg-white text-slate-900 hover:bg-slate-50/80 flex items-center justify-center text-sm font-medium"
                        onClick={handleGoogle}
                      >
                        <Chrome className="mr-2 h-5 w-5 text-emerald-600" />
                        Google
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl border-slate-300 bg-white text-slate-900 hover:bg-slate-50/80 flex items-center justify-center text-sm font-medium"
                        onClick={handleApple}
                      >
                        <Apple className="mr-2 h-5 w-5 text-slate-900" /> 
                        Apple
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <div className="h-px flex-1 bg-slate-300" />
                      <span className="text-slate-600">or use email</span>
                      <div className="h-px flex-1 bg-slate-300" />
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field (Only for Signup) */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className={PRIMARY_TEXT_COLOR_CLASS}>
                        Full name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`pl-11 h-11 text-base ${INPUT_COLOR_CLASS}`}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className={PRIMARY_TEXT_COLOR_CLASS}>
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-11 h-11 text-base ${INPUT_COLOR_CLASS}`}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className={PRIMARY_TEXT_COLOR_CLASS}>
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-11 pr-11 h-11 text-base ${INPUT_COLOR_CLASS}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className={`w-full h-11 mt-1 text-base ${ACCENT_COLOR_CLASS} rounded-xl shadow-[0_10px_25px_rgba(16,185,129,0.4)]`}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Please wait...'
                      : isLogin
                      ? 'Sign in'
                      : 'Create account'}
                  </Button>
                </form>

                {/* Switch Login/Signup Toggle */}
                <div className="mt-6 text-center">
                  <p className={SECONDARY_TEXT_COLOR_CLASS}>
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-1 text-emerald-600 font-semibold hover:underline"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}