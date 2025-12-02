import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Star, Clock, Car, Calendar, Check, LogOut } from 'lucide-react';

const mockParkingSpots: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Downtown Garage',
    address: '123 Main St, San Francisco',
    price: 8,
    rating: 4.8,
    reviews: 124,
    type: 'commercial',
    description: 'Secure underground parking with 24/7 access. CCTV monitored, well-lit, and easy access to downtown attractions.',
    amenities: ['24/7 Access', 'CCTV', 'EV Charging', 'Covered'],
  },
  '2': {
    id: '2',
    title: 'Private Driveway Space',
    address: '456 Oak Ave, San Francisco',
    price: 5,
    rating: 4.9,
    reviews: 56,
    type: 'private',
    description: 'Quiet residential driveway with easy street access. Perfect for short-term parking during work hours.',
    amenities: ['Covered', 'Street Access', 'Quiet Area'],
  },
  '3': {
    id: '3',
    title: 'Mall Parking Complex',
    address: '789 Shopping Center',
    price: 6,
    rating: 4.5,
    reviews: 312,
    type: 'commercial',
    description: 'Large multi-level parking structure with direct mall access. Validated parking available with purchases.',
    amenities: ['Multi-level', 'Mall Access', 'Security', 'Well-lit'],
  },
  '5': {
    id: '5',
    title: 'Event Center Parking',
    address: '555 Stadium Way',
    price: 12,
    rating: 4.3,
    reviews: 89,
    type: 'commercial',
    description: 'Premium parking for events and concerts. Pre-book to guarantee your spot during busy events.',
    amenities: ['Event Access', 'Security', 'Large Spaces', 'Well-lit'],
  },
};

export default function Booking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
  const spot = mockParkingSpots[id || '1'];

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('2');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const totalPrice = spot ? spot.price * parseInt(duration || '1') : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSuccess(true);
    toast({ 
      title: "Booking Confirmed!", 
      description: `Your parking spot at ${spot.title} has been reserved.` 
    });
  };

  if (!spot) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground">Parking spot not found.</p>
      </div>
    );
  }

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
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-4">
                Your parking spot has been reserved.
              </p>
              <div className="bg-secondary rounded-lg p-4 mb-6 text-left">
                <p className="font-semibold">{spot.title}</p>
                <p className="text-sm text-muted-foreground">{spot.address}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Total Paid</span>
                  <span className="font-bold text-primary">${totalPrice}</span>
                </div>
              </div>
              <div className="space-y-3">
                <Button onClick={() => navigate('/browse')} className="w-full">
                  Book Another Spot
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
          onClick={() => navigate('/browse')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Search
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Spot Details */}
            <Card className="animate-fade-up">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    spot.type === 'private' 
                      ? 'bg-accent/10 text-accent' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {spot.type}
                  </span>
                </div>
                <CardTitle className="text-2xl">{spot.title}</CardTitle>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin size={14} />
                  {spot.address}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{spot.rating}</span>
                    <span className="text-muted-foreground text-sm">({spot.reviews} reviews)</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{spot.description}</p>

                <div className="mb-4">
                  <p className="font-medium mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {spot.amenities.map((amenity: string) => (
                      <span 
                        key={amenity}
                        className="text-xs px-3 py-1.5 bg-secondary rounded-full text-secondary-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-3xl font-bold text-primary">
                    ${spot.price}
                    <span className="text-sm font-normal text-muted-foreground">/hour</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="animate-fade-up" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle>Book This Spot</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Start Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="24"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">
                        ${spot.price} × {duration} hour{parseInt(duration) > 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold">${totalPrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">${totalPrice}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
