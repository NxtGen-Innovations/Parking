import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, DollarSign, Clock, Car, LogOut, Check } from 'lucide-react';

export default function RegisterSpace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerType = searchParams.get('type') || 'private';
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    price: '',
    spots: '1',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSuccess(true);
    toast({ 
      title: "Space Registered!", 
      description: "Your parking space has been successfully listed." 
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <header className="p-6">
          <Logo />
        </header>
        <main className="flex-1 flex items-center justify-center px-4 pb-12">
          <Card className="w-full max-w-md text-center animate-scale-in">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Successfully Registered!</h2>
              <p className="text-muted-foreground mb-6">
                Your parking space is now live and ready to receive bookings.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/register-space?type=' + providerType)} className="w-full">
                  Register Another Space
                </Button>
                <Button variant="outline" onClick={() => navigate('/choose-role')} className="w-full">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
          onClick={() => navigate('/register-type')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg animate-fade-up shadow-elevated">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
              <span className="px-2 py-1 bg-primary/10 rounded-md capitalize">
                {providerType} Provider
              </span>
            </div>
            <CardTitle className="text-2xl">Register Your Parking Space</CardTitle>
            <CardDescription>
              Fill in the details below to list your space on ParkEase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Space Title</Label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="title"
                    placeholder="e.g., Covered Garage Near Mall"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Hour ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="5"
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spots">Number of Spots</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="spots"
                      type="number"
                      placeholder="1"
                      min="1"
                      value={formData.spots}
                      onChange={(e) => setFormData({ ...formData, spots: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  placeholder="Describe your parking space, amenities, access instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-lg border-2 border-input bg-card px-4 py-3 text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register Space'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
