'use client';

import { useMemo, useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import dynamic from 'next/dynamic';

// Dynamically import the fallback map to avoid SSR issues
const FallbackMap = dynamic(() => import('./fallback-map'), { 
  ssr: false,
  loading: () => (
    <div className="bg-[#F5F5F5] dark:bg-[#2A2A2A] rounded-lg flex items-center justify-center min-h-[300px]">
      <div className="text-center text-[#666] dark:text-[#B0B0B0] font-poppins">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#CCF83B] mb-3"></div>
        <p>Loading map...</p>
      </div>
    </div>
  )
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

interface TripMapProps {
  city: string;
  days: TripDay[];
  className?: string;
}

// Define city coordinates for common cities
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

function TripMapContent({ city, days, className }: TripMapProps) {
  const [selectedStop, setSelectedStop] = useState<{ stop: Stop; day: TripDay } | null>(null);
  const [hasError, setHasError] = useState(false);

  const mapCenter = useMemo(() => {
    const normalizedCity = city.toLowerCase();
    return cityCoordinates[normalizedCity] || { lat: 0, lng: 0 };
  }, [city]);

  // Listen for Google Maps errors
  useEffect(() => {
    const handleError = (error: any) => {
      if (error.message?.includes('BillingNotEnabledMapError') || 
          error.includes?.('BillingNotEnabledMapError')) {
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('BillingNotEnabledMapError')) {
        setHasError(true);
      }
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  // If there's a billing error, use fallback map
  if (hasError) {
    return <FallbackMap city={city} days={days} className={className} />;
  }

  const markers = useMemo(() => {
    return days.flatMap((day, dayIndex) => 
      day.stops.map((stop, stopIndex) => {
        // Create marker positions near city center with some randomization
        const offset = 0.01; // roughly 1km
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
  }, [days, mapCenter]);

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <div className="w-full h-full min-h-[300px]">
        <Map
          defaultZoom={13}
          defaultCenter={mapCenter}
          mapId="trip-map"
          style={{ width: '100%', height: '100%' }}
          options={{
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'simplified' }]
              }
            ]
          }}
        >
          {/* City center marker */}
          <Marker
            position={mapCenter}
            title={`${city} City Center`}
          />

          {/* Stop markers */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.stop.title}
              onClick={() => setSelectedStop({ stop: marker.stop, day: marker.day })}
            />
          ))}

          {/* Info window */}
          {selectedStop && (
            <InfoWindow
              position={markers.find(m => m.id === selectedStop.stop.id)?.position}
              onCloseClick={() => setSelectedStop(null)}
            >
              <div className="p-2 max-w-[250px]">
                <h4 className="font-semibold mb-2 text-gray-900">{selectedStop.stop.title}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  Day {selectedStop.day.day_index}: {selectedStop.day.theme}
                </p>
                {selectedStop.stop.address && (
                  <p className="text-sm text-gray-600 mb-1">📍 {selectedStop.stop.address}</p>
                )}
                <div className="flex gap-3 text-xs text-gray-600 mt-2">
                  {selectedStop.stop.start_time && (
                    <span>🕐 {selectedStop.stop.start_time}</span>
                  )}
                  {selectedStop.stop.duration_mins && (
                    <span>⏰ {selectedStop.stop.duration_mins}min</span>
                  )}
                  <span className="font-semibold text-gray-800">
                    💵 {selectedStop.stop.est_cost > 0 ? `$${selectedStop.stop.est_cost}` : 'Free'}
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </div>
  );
}

export default function TripMap({ city, days, className }: TripMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [useFallback, setUseFallback] = useState(false);

  // If no API key or user chooses fallback, use OpenStreetMap
  if (!apiKey || useFallback) {
    return <FallbackMap city={city} days={days} className={className} />;
  }

  return (
    <APIProvider 
      apiKey={apiKey} 
      libraries={['places']}
      onLoad={() => {
        // Check for billing errors after load
        const checkBilling = () => {
          if ((window as any).google?.maps?.BillingNotEnabledMapError) {
            setUseFallback(true);
          }
        };
        setTimeout(checkBilling, 1000);
      }}
    >
      <TripMapContent city={city} days={days} className={className} />
    </APIProvider>
  );
}