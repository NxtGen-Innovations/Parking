import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, MapPin, Clock, Shield, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

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
      title: 'Find Nearby Spots',
      description: 'Discover available parking spaces near malls, markets, and events',
    },
    {
      icon: Clock,
      title: 'Book Instantly',
      description: 'Reserve your spot in seconds with real-time availability',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Verified locations with secure payment processing',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <Logo />
        <Button variant="outline" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-12">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Smart Parking Made Simple
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Find & Book Parking
            <br />
            <span className="text-primary">In Seconds</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The easiest way to find parking in crowded places. Browse private and commercial spots, compare prices, and book instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => navigate('/auth')}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="hero-outline" 
              size="xl"
              onClick={() => navigate('/auth')}
            >
              List Your Space
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="p-6 rounded-2xl bg-card shadow-soft animate-fade-up"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        © 2024 ParkEase. All rights reserved.
      </footer>
    </div>
  );
}
