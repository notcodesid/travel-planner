'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Stop {
  id: string;
  title: string;
  address?: string;
  start_time?: string;
  duration_mins?: number;
  est_cost: number;
  url?: string;
}

interface TripDay {
  id: string;
  day_index: number;
  theme: string;
  stops: Stop[];
}

interface FallbackMapProps {
  city: string;
  days: TripDay[];
  className?: string;
}

// City coordinates
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'paris': { lat: 48.8566, lng: 2.3522 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'barcelona': { lat: 41.3851, lng: 2.1734 },
  'rome': { lat: 41.9028, lng: 12.4964 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
};

export default function FallbackMap({ city, days, className }: FallbackMapProps) {
  const normalizedCity = city.toLowerCase();
  const mapCenter = cityCoordinates[normalizedCity] || { lat: 0, lng: 0 };

  // Generate marker positions
  const markers = days.flatMap((day, dayIndex) => 
    day.stops.map((stop, stopIndex) => {
      const offset = 0.01;
      const lat = mapCenter.lat + (Math.random() - 0.5) * offset;
      const lng = mapCenter.lng + (Math.random() - 0.5) * offset;
      
      return {
        id: stop.id,
        position: { lat, lng },
        stop,
        day,
        dayIndex: dayIndex + 1,
      };
    })
  );

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <div className="w-full h-full min-h-[300px]">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* City center marker */}
          <Marker position={[mapCenter.lat, mapCenter.lng]}>
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold text-gray-900">{city} City Center</h4>
              </div>
            </Popup>
          </Marker>

          {/* Stop markers */}
          {markers.map((marker) => (
            <Marker 
              key={marker.id} 
              position={[marker.position.lat, marker.position.lng]}
            >
              <Popup>
                <div className="p-2 max-w-[250px]">
                  <h4 className="font-semibold mb-2 text-gray-900">{marker.stop.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    Day {marker.day.day_index}: {marker.day.theme}
                  </p>
                  {marker.stop.address && (
                    <p className="text-sm text-gray-600 mb-1">📍 {marker.stop.address}</p>
                  )}
                  <div className="flex gap-3 text-xs text-gray-600 mt-2">
                    {marker.stop.start_time && (
                      <span>🕐 {marker.stop.start_time}</span>
                    )}
                    {marker.stop.duration_mins && (
                      <span>⏰ {marker.stop.duration_mins}min</span>
                    )}
                    <span className="font-semibold text-gray-800">
                      💵 {marker.stop.est_cost > 0 ? `$${marker.stop.est_cost}` : 'Free'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}