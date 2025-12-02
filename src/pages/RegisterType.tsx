import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Building2, ArrowLeft, ArrowRight, LogOut } from 'lucide-react';

export default function RegisterType() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const providerTypes = [
    {
      id: 'private',
      title: 'Private Parking Provider',
      description: 'Home owners, shop keepers, and apartment residents',
      icon: Home,
      examples: ['Driveway spaces', 'Garage spots', 'Shop front parking'],
      path: '/register-space?type=private',
    },
    {
      id: 'commercial',
      title: 'Commercial Parking Provider',
      description: 'Paid parking lots, operators, and commercial facilities',
      icon: Building2,
      examples: ['Parking lots', 'Multi-level garages', 'Event venues'],
      path: '/register-space?type=commercial',
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

      {/* Back Button */}
      <div className="px-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/choose-role')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10 animate-fade-up">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              What type of provider are you?
            </h1>
            <p className="text-muted-foreground text-lg">
              Select the option that best describes your parking space
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {providerTypes.map((type, index) => (
              <Card
                key={type.id}
                className="group cursor-pointer hover:shadow-elevated hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-primary/20 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(type.path)}
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4">
                    <type.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                  <CardDescription className="text-base">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-sm font-medium text-foreground mb-2">Examples:</p>
                    <ul className="space-y-2">
                      {type.examples.map((example) => (
                        <li key={example} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full group-hover:translate-x-1 transition-transform">
                    Select
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
