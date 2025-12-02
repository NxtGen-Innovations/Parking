import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, 
  LayoutDashboard, 
  Plus, 
  MapPin, 
  Star, 
  DollarSign,
  Car,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockMySpaces = [
  {
    id: '1',
    title: 'Home Driveway',
    address: '123 My Street, San Francisco',
    price: 5,
    rating: 4.9,
    reviews: 56,
    totalBookings: 234,
    earnings: 1170,
    isActive: true,
    type: 'private',
  },
  {
    id: '2',
    title: 'Office Parking Lot',
    address: '456 Business Ave',
    price: 8,
    rating: 4.7,
    reviews: 89,
    totalBookings: 456,
    earnings: 3648,
    isActive: true,
    type: 'commercial',
  },
  {
    id: '3',
    title: 'Weekend Spot',
    address: '789 Residential Blvd',
    price: 4,
    rating: 4.5,
    reviews: 23,
    totalBookings: 67,
    earnings: 268,
    isActive: false,
    type: 'private',
  },
];

const stats = {
  totalEarnings: 5086,
  totalBookings: 757,
  activeSpaces: 2,
  avgRating: 4.7,
};

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [spaces, setSpaces] = useState(mockMySpaces);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const toggleSpaceActive = (id: string) => {
    setSpaces(spaces.map(space => 
      space.id === id ? { ...space, isActive: !space.isActive } : space
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="dashboard" className="m-0 p-4 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign size={16} />
                      <span className="text-xs">Total Earnings</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">${stats.totalEarnings}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Car size={16} />
                      <span className="text-xs">Total Bookings</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp size={16} />
                      <span className="text-xs">Active Spaces</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.activeSpaces}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Star size={16} />
                      <span className="text-xs">Avg Rating</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.avgRating}</p>
                  </CardContent>
                </Card>
              </div>

              {/* My Spaces */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">My Parking Spaces</h2>
                  <Button size="sm" onClick={() => navigate('/register-space')}>
                    <Plus size={16} className="mr-1" />
                    Add New
                  </Button>
                </div>

                <div className="space-y-3">
                  {spaces.map(space => (
                    <Card key={space.id} className={!space.isActive ? 'opacity-60' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{space.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                space.isActive 
                                  ? 'bg-green-500/10 text-green-600' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {space.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin size={12} />
                              {space.address}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleSpaceActive(space.id)}>
                                {space.isActive ? (
                                  <>
                                    <ToggleLeft className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <p className="text-lg font-bold text-primary">${space.price}</p>
                            <p className="text-xs text-muted-foreground">/hour</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{space.totalBookings}</p>
                            <p className="text-xs text-muted-foreground">Bookings</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">${space.earnings}</p>
                            <p className="text-xs text-muted-foreground">Earned</p>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="text-lg font-bold">{space.rating}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">({space.reviews})</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="add" className="m-0">
              {/* Redirect to register space */}
              <div className="p-4 text-center">
                <p className="text-muted-foreground mb-4">Add a new parking space</p>
                <Button onClick={() => navigate('/register-type')}>
                  <Plus size={16} className="mr-2" />
                  Register New Space
                </Button>
              </div>
            </TabsContent>
          </div>

          {/* Bottom Tab Bar */}
          <TabsList className="h-16 rounded-none border-t border-border bg-background justify-around mt-auto">
            <TabsTrigger 
              value="dashboard" 
              className="flex-1 flex-col gap-1 h-full data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              <LayoutDashboard size={20} />
              <span className="text-xs">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="add"
              onClick={() => navigate('/register-type')}
              className="flex-1 flex-col gap-1 h-full data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              <Plus size={20} />
              <span className="text-xs">Add Space</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
