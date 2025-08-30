"use client";
import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  Share,
  FileDown,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TripMap from "@/components/trip-map";
import ShareModal from "@/components/share-modal";
import { generateTripPDF } from "@/lib/pdf-export";
import { useAuth } from "@/components/auth-provider";

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

interface Trip {
  id: string;
  city: string;
  start_date: string;
  end_date: string;
  budget_band: string;
  pace: string;
  food_prefs?: string[];
  days: TripDay[];
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [regeneratingDay, setRegeneratingDay] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async (city: string, startDate: string, endDate: string) => {
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}&startDate=${startDate}&endDate=${endDate}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setWeatherData(result.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
    }
  }, []);

  const fetchTrip = useCallback(async (tripId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/trips/${tripId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch trip: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setTrip(result.trip);
        // Fetch weather data
        fetchWeatherData(result.trip.city, result.trip.start_date, result.trip.end_date);
      } else {
        throw new Error(result.error || "Failed to fetch trip");
      }
    } catch (err) {
      console.error("Error fetching trip:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [fetchWeatherData]);

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setId(resolvedParams.id);
      fetchTrip(resolvedParams.id);
    }
    getParams();
  }, [params, fetchTrip]);

  const handleExportPDF = async () => {
    if (!trip) return;
    
    try {
      await generateTripPDF(trip);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShareTrip = () => {
    setShareModalOpen(true);
  };

  const handleRegenerateDay = async (dayId: string, dayIndex: number) => {
    if (!trip) return;
    
    setRegeneratingDay(dayId);
    
    try {
      const response = await fetch('/api/regenerate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          dayId,
          dayIndex,
          city: trip.city,
          budget: trip.budget_band,
          pace: trip.pace
        })
      });

      const result = await response.json();
      if (result.success) {
        // Update the trip with the new day data
        setTrip(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            days: prev.days.map(day => 
              day.id === dayId ? result.day : day
            )
          };
        });
      } else {
        throw new Error(result.error || 'Failed to regenerate day');
      }
    } catch (err) {
      console.error('Error regenerating day:', err);
      alert('Failed to regenerate day. Please try again.');
    } finally {
      setRegeneratingDay(null);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="font-poppins text-[#666] dark:text-[#B0B0B0]">
            Loading trip...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-montserrat font-medium text-[24px] text-red-600 mb-2">
            Error Loading Trip
          </h2>
          <p className="font-poppins text-[#666] dark:text-[#B0B0B0] mb-4">
            {error}
          </p>
          <button
            onClick={() => id && fetchTrip(id)}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-montserrat font-medium text-[24px] text-black dark:text-white mb-2">
            Trip Not Found
          </h2>
          <p className="font-poppins text-[#666] dark:text-[#B0B0B0] mb-4">
            The trip you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <nav className="nav-bg h-[60px] sticky top-0 z-50">
        <div className="max-w-full px-4 md:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4 pl-2 md:pl-6">
            <button
              onClick={() => router.push("/")}
              className="font-poppins font-medium text-sm text-black dark:text-white hover:opacity-70 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="font-montserrat font-semibold text-black dark:text-white text-lg tracking-[-0.2px] relative">
              TrailMix
              <span className="absolute -top-1 -right-2 text-xs font-semibold text-primary">
                ✈
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 pr-2 md:pr-6">
            <button
              onClick={() => router.push("/my-trips")}
              className="font-poppins font-medium text-sm text-black dark:text-white hover:opacity-70"
            >
              My Trips
            </button>
            <button className="font-poppins font-medium text-sm text-black dark:text-white hover:opacity-70">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="font-montserrat font-medium text-[28px] md:text-[36px] text-black dark:text-white mb-2">
                {trip.city} Adventure
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-[#666] dark:text-[#B0B0B0] font-poppins">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(trip.start_date).toLocaleDateString()} -{" "}
                  {new Date(trip.end_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign size={14} />
                  {trip.budget_band} budget
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {trip.pace} pace
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={handleShareTrip}
                className="btn-secondary flex items-center gap-2"
              >
                <Share size={16} />
                Share
              </button>
              <button
                onClick={handleExportPDF}
                className="btn-primary flex items-center gap-2"
              >
                <FileDown size={16} />
                Export PDF
              </button>
            </div>
          </div>

          {trip.food_prefs && trip.food_prefs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="font-poppins font-medium text-sm text-black dark:text-white">
                Food preferences:
              </span>
              {trip.food_prefs.map((pref, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#F0F8FF] dark:bg-[#2A3A4A] text-[#0066CC] dark:text-[#66B3FF] rounded-full text-xs font-poppins"
                >
                  {pref}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            {trip.days.map((day, index) => (
              <div
                key={day.id}
                className="card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-montserrat font-medium text-[20px] text-black dark:text-white">
                    Day {day.day_index}: {day.theme}
                  </h3>
                  <button
                    onClick={() => handleRegenerateDay(day.id, day.day_index)}
                    disabled={regeneratingDay === day.id}
                    className="btn-secondary flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw size={12} className={regeneratingDay === day.id ? 'animate-spin' : ''} />
                    {regeneratingDay === day.id ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>

                <div className="space-y-4">
                  {day.stops.map((stop, stopIndex) => (
                    <div
                      key={stop.id}
                      className="flex items-start gap-4 p-4 bg-[#F8F9FA] dark:bg-[#2A2A2A] rounded-lg"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-poppins font-medium text-black dark:text-white">
                            {stop.title}
                          </h4>
                          <span className="text-[#666] dark:text-[#B0B0B0] text-sm font-poppins">
                            {stop.est_cost > 0 ? `$${stop.est_cost}` : "Free"}
                          </span>
                        </div>
                        {stop.address && (
                          <p className="text-sm text-[#666] dark:text-[#B0B0B0] font-poppins mb-2">
                            {stop.address}
                          </p>
                        )}
                        <div className="flex gap-4 text-sm text-[#666] dark:text-[#B0B0B0] font-poppins">
                          {stop.start_time && (
                            <>
                              <span>{formatTime(stop.start_time)}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{formatDuration(stop.duration_mins)}</span>
                          {stop.url && (
                            <>
                              <span>•</span>
                              <a
                                href={stop.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0066CC] hover:underline"
                              >
                                Learn more
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-[#E5E5E5] dark:border-[#404040]">
                  <div className="flex justify-between items-center text-sm font-poppins">
                    <span className="text-[#666] dark:text-[#B0B0B0]">
                      Day Total:
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      $
                      {day.stops
                        .reduce(
                          (total, stop) =>
                            total + (parseFloat(String(stop.est_cost)) || 0),
                          0,
                        )
                        .toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Map & Weather */}
          <div className="space-y-6">
            {/* Interactive Map */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 shadow-lg">
              <h3 className="font-montserrat font-medium text-[18px] text-black dark:text-white mb-4">
                Map View
              </h3>
              <TripMap 
                city={trip.city} 
                days={trip.days}
                className="h-[300px] rounded-lg"
              />
            </div>

            {/* Weather Widget */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 shadow-lg">
              <h3 className="font-montserrat font-medium text-[18px] text-black dark:text-white mb-4">
                Weather Forecast
              </h3>
              <div className="space-y-3">
                {weatherData.length > 0 ? (
                  weatherData.slice(0, Math.min(3, trip.days.length)).map((weather, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#F8F9FA] dark:bg-[#2A2A2A] rounded-lg"
                    >
                      <span className="font-poppins text-sm text-black dark:text-white">
                        Day {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{weather.icon}</span>
                        <span className="font-poppins text-sm text-[#666] dark:text-[#B0B0B0]">
                          {weather.temperature}°C
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  trip.days.slice(0, 3).map((day) => (
                    <div
                      key={day.id}
                      className="flex items-center justify-between p-3 bg-[#F8F9FA] dark:bg-[#2A2A2A] rounded-lg"
                    >
                      <span className="font-poppins text-sm text-black dark:text-white">
                        Day {day.day_index}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">☀️</span>
                        <span className="font-poppins text-sm text-[#666] dark:text-[#B0B0B0]">
                          22°C
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Trip Summary */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 shadow-lg">
              <h3 className="font-montserrat font-medium text-[18px] text-black dark:text-white mb-4">
                Trip Summary
              </h3>
              <div className="space-y-3 font-poppins text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666] dark:text-[#B0B0B0]">
                    Total Days:
                  </span>
                  <span className="text-black dark:text-white">
                    {trip.days.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666] dark:text-[#B0B0B0]">
                    Total Stops:
                  </span>
                  <span className="text-black dark:text-white">
                    {trip.days.reduce(
                      (total, day) => total + day.stops.length,
                      0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E5E5E5] dark:border-[#404040] font-medium">
                  <span className="text-black dark:text-white">
                    Estimated Total:
                  </span>
                  <span className="text-black dark:text-white">
                    $
                    {trip.days
                      .reduce((total, day) => {
                        return (
                          total +
                          day.stops.reduce((dayTotal, stop) => {
                            return (
                              dayTotal + (parseFloat(String(stop.est_cost)) || 0)
                            );
                          }, 0)
                        );
                      }, 0)
                      .toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {trip && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          tripId={trip.id}
          tripTitle={trip.city}
        />
      )}
    </div>
  );
}