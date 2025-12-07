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

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
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
        await login(email, password);
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in.',
        });
      } else {
        await signup(email, password, name);
        toast({
          title: 'Account created!',
          description: 'Welcome to ParkEase.',
        });
      }
      navigate('/choose-role');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dummy handlers for social auth for now
  const handleGoogle = () => {
    toast({
      title: 'Google sign in',
      description: 'Integrate Google OAuth here.',
    });
  };

  const handleApple = () => {
    toast({
      title: 'Apple sign in',
      description: 'Integrate Apple Sign In here.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
      {/* Soft background vignette to match landing page */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-start px-4 py-4 md:px-8">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 md:py-16">
        {/* Outer glass container like landing page */}
        <motion.div
          className="w-full max-w-5xl rounded-[30px] border border-white/10 bg-white/5 bg-clip-padding backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Left: intro / marketing panel */}
          <div className="hidden md:flex flex-1 flex-col justify-between border-r border-white/10 bg-black/40 px-8 py-10">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full bg-black/50 px-4 py-1.5 text-[11px] font-medium text-sky-300 border border-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2" />
                Secure sign in • 2-step protection
              </p>

              <div className="space-y-3">
                <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
                  One account for
                  <span className="block text-sky-400">parking everywhere.</span>
                </h1>
                <p className="text-sm text-slate-200/85 max-w-md">
                  Save your favorite locations, view your bookings, and switch
                  between driver and parking provider in a single dashboard.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-[11px] text-slate-300">
                <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <p className="font-medium text-slate-50">3x faster</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    check-in with saved vehicles
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <p className="font-medium text-slate-50">All in one</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    history, payments & rewards
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-[11px] text-slate-500">
              Protected with modern encryption • No spam, ever.
            </p>
          </div>

          {/* Right: auth card */}
          <motion.div
            className="flex-1 flex items-center justify-center px-4 py-8 md:px-8 md:py-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            <Card className="w-full max-w-md border border-slate-800 bg-slate-900/95 shadow-2xl rounded-3xl">
              <CardHeader className="text-center pb-3 pt-6 px-6">
                <CardTitle className="text-2xl md:text-3xl font-bold text-slate-50">
                  {isLogin ? 'Welcome back' : 'Create your account'}
                </CardTitle>
                <CardDescription className="text-sm md:text-base text-slate-400 mt-2">
                  {isLogin
                    ? 'Sign in to find and manage your parking spaces.'
                    : 'Join ParkEase and start parking smarter in crowded areas.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 pb-8 px-6 md:px-8">
                {/* Social auth on top (polished) */}
                {!isLogin && (
                  <div className="mb-6 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl border-white/15 bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center text-sm font-medium"
                        onClick={handleGoogle}
                      >
                        <Chrome className="mr-2 h-5 w-5 text-sky-500" />
                        Continue with Google
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl border-white/15 bg-black text-slate-50 hover:bg-slate-900 flex items-center justify-center text-sm font-medium"
                        onClick={handleApple}
                      >
                        <Apple className="mr-2 h-5 w-5" />
                        Continue with Apple
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <div className="h-px flex-1 bg-slate-800" />
                      <span className="text-slate-400">or use email</span>
                      <div className="h-px flex-1 bg-slate-800" />
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-200">
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
                          className="pl-11 h-11 text-base bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">
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
                        className="pl-11 h-11 text-base bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200">
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
                        className="pl-11 pr-11 h-11 text-base bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 mt-1 text-base bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-[0_10px_25px_rgba(56,189,248,0.4)]"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Please wait...'
                      : isLogin
                      ? 'Sign in'
                      : 'Create account'}
                  </Button>
                </form>

                {/* Switch between login <-> signup */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-1 text-sky-400 font-semibold hover:underline"
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
// End of Auth.tsx and hello
// hello all