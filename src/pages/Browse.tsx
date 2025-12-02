import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Search, MapPin, Star, Clock, ArrowLeft, LogOut, Filter } from 'lucide-react';

const mockParkingSpots = [
  {
    id: '1',
    title: 'Downtown Garage',
    address: '123 Main St, San Francisco',
    price: 8,
    rating: 4.8,
    reviews: 124,
    distance: '0.2 mi',
    type: 'commercial',
    available: true,
  },
  {
    id: '2',
    title: 'Private Driveway Space',
    address: '456 Oak Ave, San Francisco',
    price: 5,
    rating: 4.9,
    reviews: 56,
    distance: '0.4 mi',
    type: 'private',
    available: true,
  },
  {
    id: '3',
    title: 'Mall Parking Complex',
    address: '789 Shopping Center',
    price: 6,
    rating: 4.5,
    reviews: 312,
    distance: '0.6 mi',
    type: 'commercial',
    available: true,
  },
  {
    id: '4',
    title: 'Residential Garage',
    address: '321 Elm Street',
    price: 4,
    rating: 4.7,
    reviews: 28,
    distance: '0.8 mi',
    type: 'private',
    available: false,
  },
  {
    id: '5',
    title: 'Event Center Parking',
    address: '555 Stadium Way',
    price: 12,
    rating: 4.3,
    reviews: 89,
    distance: '1.2 mi',
    type: 'commercial',
    available: true,
  },
];

export default function Browse() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'private' | 'commercial'>('all');

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const filteredSpots = mockParkingSpots.filter(spot => {
    const matchesSearch = spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         spot.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || spot.type === filter;
    return matchesSearch && matchesFilter;
  });

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
      <main className="flex-1 px-4 md:px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <div className="mb-8 animate-fade-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">Find Parking</h1>
            <p className="text-muted-foreground mb-6">
              Browse available parking spots near you
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by location or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filter === 'private' ? 'default' : 'outline'}
                  onClick={() => setFilter('private')}
                  size="sm"
                >
                  Private
                </Button>
                <Button
                  variant={filter === 'commercial' ? 'default' : 'outline'}
                  onClick={() => setFilter('commercial')}
                  size="sm"
                >
                  Commercial
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {filteredSpots.map((spot, index) => (
              <Card 
                key={spot.id}
                className={`cursor-pointer hover:shadow-elevated transition-all duration-300 animate-fade-up ${
                  !spot.available ? 'opacity-60' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => spot.available && navigate(`/booking/${spot.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{spot.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          spot.type === 'private' 
                            ? 'bg-accent/10 text-accent' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {spot.type}
                        </span>
                        {!spot.available && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                            Full
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                        <MapPin size={14} />
                        {spot.address}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{spot.rating}</span>
                          <span className="text-muted-foreground">({spot.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock size={14} />
                          {spot.distance} away
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${spot.price}</p>
                        <p className="text-xs text-muted-foreground">per hour</p>
                      </div>
                      {spot.available && (
                        <Button size="sm">
                          Book Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSpots.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No parking spots found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
