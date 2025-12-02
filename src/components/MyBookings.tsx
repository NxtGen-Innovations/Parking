import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Calendar, Car } from 'lucide-react';

const mockBookings = [
  {
    id: '1',
    spotTitle: 'Downtown Garage',
    address: '123 Main St, San Francisco',
    date: '2024-01-15',
    time: '10:00 AM - 2:00 PM',
    price: 32,
    status: 'upcoming',
    vehicleNumber: 'ABC 1234',
  },
  {
    id: '2',
    spotTitle: 'Mall Parking Complex',
    address: '789 Shopping Center',
    date: '2024-01-10',
    time: '3:00 PM - 6:00 PM',
    price: 18,
    status: 'completed',
    vehicleNumber: 'ABC 1234',
  },
  {
    id: '3',
    spotTitle: 'Private Driveway Space',
    address: '456 Oak Ave, San Francisco',
    date: '2024-01-05',
    time: '9:00 AM - 11:00 AM',
    price: 10,
    status: 'completed',
    vehicleNumber: 'XYZ 5678',
  },
];

export function MyBookings() {
  const upcomingBookings = mockBookings.filter(b => b.status === 'upcoming');
  const pastBookings = mockBookings.filter(b => b.status === 'completed');

  return (
    <div className="p-4 space-y-6">
      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Upcoming Bookings
        </h2>
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No upcoming bookings
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map(booking => (
              <Card key={booking.id} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{booking.spotTitle}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin size={12} />
                        {booking.address}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Upcoming
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-muted-foreground" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-muted-foreground" />
                      {booking.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Car size={14} className="text-muted-foreground" />
                      {booking.vehicleNumber}
                    </div>
                    <div className="font-semibold text-primary">
                      ${booking.price}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Get Directions
                    </Button>
                    <Button variant="destructive" size="sm">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          Past Bookings
        </h2>
        <div className="space-y-3">
          {pastBookings.map(booking => (
            <Card key={booking.id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{booking.spotTitle}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin size={12} />
                      {booking.address}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    Completed
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{booking.date}</span>
                    <span>{booking.time}</span>
                  </div>
                  <span className="font-semibold">${booking.price}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
