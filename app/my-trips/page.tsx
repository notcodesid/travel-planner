'use client';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, DollarSign, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Trip {
  id: string;
  city: string;
  start_date: string;
  end_date: string;
  budget_band: string;
  pace: string;
  food_prefs?: string[];
  created_at: string;
}

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, fetch all trips since we don't have user auth
      const response = await fetch('/api/trips');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trips: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setTrips(result.trips);
      } else {
        throw new Error(result.error || 'Failed to fetch trips');
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleTripClick = (tripId: string) => {
    router.push(`/trip/${tripId}`);
  };

  const handleCreateTrip = () => {
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <nav className="nav-bg h-[60px] sticky top-0 z-50">
        <div className="max-w-full px-4 md:px-6 h-full flex items-center justify-between">
          <div className="flex items-center pl-2 md:pl-6">
            <div className="font-montserrat font-semibold text-black dark:text-white text-lg tracking-[-0.2px] relative">
              TrailMix
              <span className="absolute -top-1 -right-2 text-xs font-semibold text-primary">
                ✈
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 pr-2 md:pr-6">
            <button 
              onClick={() => router.push('/')}
              className="font-poppins font-medium text-sm text-black dark:text-white hover:opacity-70"
            >
              Home
            </button>
            <button className="font-poppins font-medium text-sm text-primary font-semibold">
              My Trips
            </button>
            <button className="font-poppins font-medium text-sm text-black dark:text-white hover:opacity-70">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="font-montserrat font-medium text-[36px] md:text-[48px] text-black dark:text-white mb-2">
                My Trips
              </h1>
              <p className="font-poppins text-[16px] text-[#666] dark:text-[#B0B0B0]">
                All your travel adventures in one place
              </p>
            </div>
            <button 
              onClick={handleCreateTrip}
              className="btn-primary flex items-center gap-2 hover:transform hover:-translate-y-0.5 hover:shadow-lg mt-4 md:mt-0"
            >
              <Plus size={20} />
              Plan New Trip
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="font-poppins text-[#666] dark:text-[#B0B0B0]">Loading your trips...</p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="card">
            <div className="text-center">
              <h2 className="font-montserrat font-medium text-[24px] text-red-600 mb-2">
                Error Loading Trips
              </h2>
              <p className="font-poppins text-[#666] dark:text-[#B0B0B0] mb-4">
                {error}
              </p>
              <button 
                onClick={fetchTrips}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="card max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#F0F8FF] dark:bg-[#2A3A4A] rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} className="text-[#0066CC] dark:text-[#66B3FF]" />
              </div>
              <h2 className="font-montserrat font-medium text-[24px] text-black dark:text-white mb-3">
                No trips yet
              </h2>
              <p className="font-poppins text-[#666] dark:text-[#B0B0B0] mb-6">
                Start planning your first adventure with our AI travel copilot
              </p>
              <button 
                onClick={handleCreateTrip}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Plan Your First Trip
              </button>
            </div>
          </div>
        ) : (
          /* Trips Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div 
                key={trip.id}
                onClick={() => handleTripClick(trip.id)}
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-1"
              >
                {/* Trip Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-montserrat font-medium text-[20px] text-black dark:text-white">
                      {trip.city}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-poppins font-medium ${
                      trip.budget_band === 'tight' ? 'bg-[#FFF0E6] text-[#CC6600]' :
                      trip.budget_band === 'medium' ? 'bg-[#E6F7FF] text-[#0066CC]' :
                      'bg-[#F0F8E6] text-[#4D8000]'
                    }`}>
                      {trip.budget_band}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[#666] dark:text-[#B0B0B0] font-poppins text-sm mb-3">
                    <Calendar size={14} />
                    <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between font-poppins text-sm">
                    <span className="text-[#666] dark:text-[#B0B0B0] flex items-center gap-1">
                      <Clock size={14} />
                      Travel Pace:
                    </span>
                    <span className="text-black dark:text-white capitalize">{trip.pace}</span>
                  </div>
                  
                  <div className="flex items-center justify-between font-poppins text-sm">
                    <span className="text-[#666] dark:text-[#B0B0B0]">Created:</span>
                    <span className="text-black dark:text-white">
                      {formatDate(trip.created_at)}
                    </span>
                  </div>
                </div>

                {/* Food Preferences */}
                {trip.food_prefs && trip.food_prefs.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {trip.food_prefs.slice(0, 3).map((pref, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-[#F0F8FF] dark:bg-[#2A3A4A] text-[#0066CC] dark:text-[#66B3FF] rounded-full text-xs font-poppins"
                        >
                          {pref}
                        </span>
                      ))}
                      {trip.food_prefs.length > 3 && (
                        <span className="px-2 py-1 bg-[#F5F5F5] dark:bg-[#2A2A2A] text-[#666] dark:text-[#B0B0B0] rounded-full text-xs font-poppins">
                          +{trip.food_prefs.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#404040]">
                  <button className="w-full py-2 text-center font-poppins font-medium text-[#0066CC] dark:text-[#66B3FF] hover:text-[#004499] dark:hover:text-[#4499DD] transition-colors">
                    View Itinerary →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}