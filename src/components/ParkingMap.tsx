import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Navigation } from 'lucide-react';

interface ParkingSpot {
  id: string;
  title: string;
  address: string;
  price: number;
  rating: number;
  lat: number;
  lng: number;
  available: boolean;
}

interface ParkingMapProps {
  spots: ParkingSpot[];
  onSpotSelect: (spot: ParkingSpot) => void;
  mapboxToken: string;
}

const ParkingMap: React.FC<ParkingMapProps> = ({ spots, onSpotSelect, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 13,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'bottom-right'
    );

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate, 'bottom-right');

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for parking spots
    spots.forEach(spot => {
      const el = document.createElement('div');
      el.className = 'parking-marker';
      el.innerHTML = `
        <div class="relative cursor-pointer transform hover:scale-110 transition-transform">
          <div class="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-sm font-bold shadow-lg">
            $${spot.price}/hr
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
        </div>
      `;

      if (!spot.available) {
        el.innerHTML = `
          <div class="relative cursor-pointer opacity-50">
            <div class="bg-muted text-muted-foreground px-2 py-1 rounded-lg text-sm font-bold shadow-lg">
              Full
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-muted"></div>
          </div>
        `;
      }

      el.addEventListener('click', () => {
        if (spot.available) {
          onSpotSelect(spot);
        }
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([spot.lng, spot.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [spots, onSpotSelect]);

  const handleSearch = () => {
    // In a real app, this would geocode the search query
    console.log('Searching for:', searchQuery);
  };

  if (!mapboxToken) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-xl border border-border">
        <div className="text-center p-8">
          <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Map requires Mapbox token</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Search overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/95 backdrop-blur-sm shadow-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} size="icon" className="shadow-lg">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={mapContainer} className="absolute inset-0 rounded-xl overflow-hidden" />
    </div>
  );
};

export default ParkingMap;
