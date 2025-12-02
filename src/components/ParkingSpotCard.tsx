import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Clock, Navigation } from 'lucide-react';

interface ParkingSpot {
  id: string;
  title: string;
  address: string;
  price: number;
  rating: number;
  reviews: number;
  distance: string;
  type: string;
  available: boolean;
}

interface ParkingSpotCardProps {
  spot: ParkingSpot;
  onBook: () => void;
  compact?: boolean;
}

export function ParkingSpotCard({ spot, onBook, compact = false }: ParkingSpotCardProps) {
  if (compact) {
    return (
      <Card 
        className={`cursor-pointer hover:shadow-elevated transition-all duration-300 ${
          !spot.available ? 'opacity-60' : ''
        }`}
        onClick={() => spot.available && onBook()}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{spot.title}</h3>
                {!spot.available && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive flex-shrink-0">
                    Full
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Navigation size={10} />
                  {spot.distance}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {spot.rating}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-primary">${spot.price}</p>
              <p className="text-xs text-muted-foreground">/hr</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-elevated transition-all duration-300 ${
        !spot.available ? 'opacity-60' : ''
      }`}
      onClick={() => spot.available && onBook()}
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
  );
}
