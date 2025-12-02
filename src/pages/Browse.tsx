import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Map, CalendarDays, ChevronUp } from 'lucide-react';
import ParkingMap from '@/components/ParkingMap';
import { ParkingSpotCard } from '@/components/ParkingSpotCard';
import { MyBookings } from '@/components/MyBookings';
import { Input } from '@/components/ui/input';

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
    lat: 37.7749,
    lng: -122.4194,
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
    lat: 37.7759,
    lng: -122.4174,
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
    lat: 37.7739,
    lng: -122.4214,
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
    lat: 37.7729,
    lng: -122.4154,
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
    lat: 37.7769,
    lng: -122.4234,
  },
];

// For demo - in real app this would come from environment/secrets
const MAPBOX_TOKEN = '';

export default function Browse() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('map');
  const [selectedSpot, setSelectedSpot] = useState<typeof mockParkingSpots[0] | null>(null);
  const [showSpotsList, setShowSpotsList] = useState(true);
  const [mapboxToken, setMapboxToken] = useState(MAPBOX_TOKEN);
  const [tempToken, setTempToken] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSpotSelect = (spot: typeof mockParkingSpots[0]) => {
    setSelectedSpot(spot);
  };

  const handleBook = (spotId: string) => {
    navigate(`/booking/${spotId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm z-20">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.name}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Tab Content */}
          <div className="flex-1 relative">
            <TabsContent value="map" className="h-full m-0 data-[state=inactive]:hidden">
              {/* Map Token Input (temporary until Cloud is set up) */}
              {!mapboxToken && (
                <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
                  <div className="max-w-md w-full space-y-4 text-center">
                    <Map className="h-16 w-16 mx-auto text-primary" />
                    <h2 className="text-xl font-semibold">Enable Map View</h2>
                    <p className="text-muted-foreground text-sm">
                      Enter your Mapbox public token to view the map. Get one free at{' '}
                      <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        mapbox.com
                      </a>
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="pk.eyJ1..."
                        value={tempToken}
                        onChange={(e) => setTempToken(e.target.value)}
                      />
                      <Button onClick={() => setMapboxToken(tempToken)} disabled={!tempToken}>
                        Enable
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-sm"
                      onClick={() => setActiveTab('bookings')}
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="h-full">
                <ParkingMap 
                  spots={mockParkingSpots} 
                  onSpotSelect={handleSpotSelect}
                  mapboxToken={mapboxToken}
                />
              </div>

              {/* Bottom Spots List */}
              <div className={`absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-elevated transition-transform duration-300 ${
                showSpotsList ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'
              }`}>
                <button 
                  onClick={() => setShowSpotsList(!showSpotsList)}
                  className="w-full py-3 flex items-center justify-center"
                >
                  <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
                  <ChevronUp className={`absolute right-4 h-5 w-5 text-muted-foreground transition-transform ${
                    showSpotsList ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <div className="px-4 pb-2">
                  <h3 className="font-semibold text-sm mb-2">
                    {mockParkingSpots.filter(s => s.available).length} spots nearby
                  </h3>
                </div>

                <div className="max-h-[40vh] overflow-y-auto px-4 pb-4 space-y-3">
                  {mockParkingSpots.map(spot => (
                    <ParkingSpotCard
                      key={spot.id}
                      spot={spot}
                      onBook={() => handleBook(spot.id)}
                      compact
                    />
                  ))}
                </div>
              </div>

              {/* Selected Spot Detail */}
              {selectedSpot && (
                <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-elevated p-4 animate-fade-up z-20">
                  <button 
                    onClick={() => setSelectedSpot(null)}
                    className="absolute top-3 right-4 text-muted-foreground"
                  >
                    ✕
                  </button>
                  <ParkingSpotCard 
                    spot={selectedSpot} 
                    onBook={() => handleBook(selectedSpot.id)}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookings" className="h-full m-0 overflow-y-auto data-[state=inactive]:hidden">
              <MyBookings />
            </TabsContent>
          </div>

          {/* Bottom Tab Bar */}
          <TabsList className="h-16 rounded-none border-t border-border bg-background justify-around">
            <TabsTrigger 
              value="map" 
              className="flex-1 flex-col gap-1 h-full data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              <Map size={20} />
              <span className="text-xs">Find Parking</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bookings"
              className="flex-1 flex-col gap-1 h-full data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              <CalendarDays size={20} />
              <span className="text-xs">My Bookings</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
