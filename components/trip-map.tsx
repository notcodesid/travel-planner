'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

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

export default function TripMap({ city, days, className }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          setError('Google Maps API key not configured');
          return;
        }

        // Check if Google Maps is already loaded
        if (window.google?.maps) {
          initializeMap();
          return;
        }

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        script.onerror = () => setError('Failed to load Google Maps');
        
        document.head.appendChild(script);
      } catch (err) {
        setError('Failed to initialize map');
        console.error('Google Maps loading error:', err);
      }
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      try {
        const mapOptions: google.maps.MapOptions = {
          zoom: 13,
          center: { lat: 0, lng: 0 }, // Will be updated after geocoding
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }]
            }
          ]
        };

        const googleMap = new google.maps.Map(mapRef.current, mapOptions);
        setMap(googleMap);
        setIsLoaded(true);

        // Geocode the city and add markers
        geocodeCityAndAddMarkers(googleMap);
      } catch (err) {
        setError('Failed to create map');
        console.error('Map initialization error:', err);
      }
    };

    const geocodeCityAndAddMarkers = (googleMap: google.maps.Map) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: city }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const cityLocation = results[0].geometry.location;
          googleMap.setCenter(cityLocation);
          
          // Add city center marker
          new google.maps.Marker({
            position: cityLocation,
            map: googleMap,
            title: `${city} City Center`,
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#CCF83B" stroke="#000" stroke-width="2"/>
                  <text x="16" y="20" text-anchor="middle" font-size="16" fill="#000">📍</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
            }
          });

          // Add markers for stops
          addStopMarkers(googleMap, cityLocation);
        } else {
          setError('City not found on map');
        }
      });
    };

    const addStopMarkers = (googleMap: google.maps.Map, cityCenter: google.maps.LatLng) => {
      const infoWindow = new google.maps.InfoWindow();
      
      days.forEach((day, dayIndex) => {
        day.stops.forEach((stop, stopIndex) => {
          // Create marker position near city center with some randomization for demo
          const offset = 0.01; // roughly 1km
          const lat = cityCenter.lat() + (Math.random() - 0.5) * offset;
          const lng = cityCenter.lng() + (Math.random() - 0.5) * offset;
          
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: googleMap,
            title: stop.title,
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="10" fill="#4285f4" stroke="#fff" stroke-width="2"/>
                  <text x="14" y="18" text-anchor="middle" font-size="12" fill="white" font-weight="bold">${dayIndex + 1}</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(28, 28),
            }
          });

          marker.addListener('click', () => {
            infoWindow.setContent(`
              <div style="padding: 8px; max-width: 250px;">
                <h4 style="margin: 0 0 8px 0; font-weight: 600;">${stop.title}</h4>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">Day ${day.day_index}: ${day.theme}</p>
                ${stop.address ? `<p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">📍 ${stop.address}</p>` : ''}
                <div style="display: flex; gap: 12px; font-size: 13px; color: #666; margin-top: 8px;">
                  ${stop.start_time ? `<span>🕐 ${stop.start_time}</span>` : ''}
                  ${stop.duration_mins ? `<span>⏰ ${stop.duration_mins}min</span>` : ''}
                  <span style="font-weight: 600; color: #333;">💵 ${stop.est_cost > 0 ? `$${stop.est_cost}` : 'Free'}</span>
                </div>
              </div>
            `);
            infoWindow.open(googleMap, marker);
          });
        });
      });
    };

    loadGoogleMaps();
  }, [city, days]);

  if (error) {
    return (
      <div className={`bg-[#F5F5F5] dark:bg-[#2A2A2A] rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-[#666] dark:text-[#B0B0B0] font-poppins p-6">
          <MapPin size={32} className="mx-auto mb-3 opacity-50" />
          <p className="mb-2">Map unavailable</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-[#F5F5F5] dark:bg-[#2A2A2A] rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-[#666] dark:text-[#B0B0B0] font-poppins">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#CCF83B] mb-3"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[300px]" />
    </div>
  );
}

// Extend the Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}