import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, ArrowRight, LogOut } from 'lucide-react';

export default function ChooseRole() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const roles = [
    {
      id: 'book',
      title: 'Book a Parking Space',
      description: 'Find and reserve parking spots near malls, markets, and events',
      icon: Search,
      color: 'primary',
      path: '/browse',
      features: ['Browse nearby spots', 'Compare prices', 'Instant booking'],
    },
    {
      id: 'register',
      title: 'Register a Parking Space',
      description: 'List your parking space and earn money from unused spots',
      icon: Plus,
      color: 'accent',
      path: '/provider-dashboard',
      features: ['List your space', 'Set your prices', 'Manage bookings'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            Hi, {user?.name}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={18} />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10 animate-fade-up">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              What would you like to do?
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose how you want to use ParkEase today
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((role, index) => (
              <Card
                key={role.id}
                className="group cursor-pointer hover:shadow-elevated hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-primary/20 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(role.path)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    role.color === 'primary' ? 'bg-gradient-primary' : 'bg-gradient-accent'
                  }`}>
                    <role.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full group-hover:translate-x-1 transition-transform" 
                    variant={role.color === 'primary' ? 'default' : 'accent'}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
