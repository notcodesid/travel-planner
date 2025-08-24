"use client";
import { useState, useEffect } from "react";
import { MapPin, Calendar, Clock, DollarSign, ArrowLeft } from "lucide-react";

export default function PlanPage() {
  const [tripData, setTripData] = useState(null);
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get form data from localStorage
    const formData = localStorage.getItem("tripFormData");
    if (formData) {
      const data = JSON.parse(formData);
      setTripData(data);
      generateItinerary(data);
    } else {
      // Redirect back to home if no data
      window.location.href = "/";
    }
  }, []);

  const generateItinerary = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: data.city,
          startDate: data.startDate,
          endDate: data.endDate,
          budgetBand: data.budget,
          pace: data.pace,
          foodPrefs: data.foodPrefs,
          ownerId: null, // For now, no user authentication
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate itinerary: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setGeneratedTrip(result.trip);
        // Redirect to trip detail page after a short delay to show success
        setTimeout(() => {
          window.location.href = `/trip/${result.trip.id}`;
        }, 1500);
      } else {
        throw new Error(result.error || "Failed to generate itinerary");
      }
    } catch (err) {
      console.error("Error generating itinerary:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!generatedTrip) return;

    // For now, just show a message since we don't have auth yet
    alert("Trip saved! (Authentication needed for full functionality)");
  };

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    alert("PDF export coming soon!");
  };

  const handleRegenerateDay = async (dayIndex) => {
    alert(`Regenerate Day ${dayIndex} coming soon!`);
  };

  if (!tripData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-[#121212]">
        {/* Header */}
        <nav className="bg-[#F7F7F0] dark:bg-[#1E1E1E] h-[60px] sticky top-0 z-50">
          <div className="max-w-full px-4 md:px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-4 pl-2 md:pl-6">
              <button
                onClick={() => (window.location.href = "/")}
                className="font-poppins font-medium text-sm text-black dark:text-white hover:opacity-70 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <div className="font-montserrat font-semibold text-black dark:text-white text-lg tracking-[-0.2px] relative">
                TrailMix
                <span className="absolute -top-1 -right-2 text-xs font-semibold text-[#CCF83B]">
                  ✈
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 pr-2 md:pr-6">
              <button
                onClick={() => (window.location.href = "/my-trips")}
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
          <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 md:p-8 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="font-montserrat font-medium text-[28px] md:text-[36px] text-black dark:text-white mb-2">
                  Your {tripData.city} Adventure
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-[#666] dark:text-[#B0B0B0] font-poppins">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {tripData.startDate} - {tripData.endDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} />
                    {tripData.budget} budget
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {tripData.pace} pace
                  </span>
                </div>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <button className="px-4 py-2 bg-[#F5F5F5] dark:bg-[#2A2A2A] text-black dark:text-white rounded-lg font-poppins font-medium text-sm hover:bg-[#E0E0E0] dark:hover:bg-[#3A3A3A]">
                  Save Trip
                </button>
                <button className="px-4 py-2 bg-[#CCF83B] hover:bg-[#B8E635] text-black rounded-lg font-poppins font-medium text-sm">
                  Export PDF
                </button>
              </div>
            </div>

            {tripData.foodPrefs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="font-poppins font-medium text-sm text-black dark:text-white">
                  Food preferences:
                </span>
                {tripData.foodPrefs.map((pref, index) => (
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

          {/* Loading State */}
          {loading ? (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#CCF83B] mb-4"></div>
                <h2 className="font-montserrat font-medium text-[24px] text-black dark:text-white mb-2">
                  Generating Your Itinerary
                </h2>
                <p className="font-poppins text-[#666] dark:text-[#B0B0B0]">
                  AI is finding the best POIs and creating your perfect
                  schedule...
                </p>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-8 shadow-lg">
              <div className="text-center">
                <h2 className="font-montserrat font-medium text-[24px] text-red-600 mb-2">
                  Oops! Something went wrong
                </h2>
                <p className="font-poppins text-[#666] dark:text-[#B0B0B0] mb-4">
                  {error}
                </p>
                <button
                  onClick={() => generateItinerary(tripData)}
                  className="px-6 py-3 bg-[#CCF83B] hover:bg-[#B8E635] text-black rounded-lg font-poppins font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : generatedTrip ? (
            /* Itinerary Content */
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Itinerary */}
              <div className="lg:col-span-2 space-y-6">
                {generatedTrip.days.map((day, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-montserrat font-medium text-[20px] text-black dark:text-white">
                        Day {day.day_index || day.dayIndex}: {day.theme}
                      </h3>
                      <button
                        onClick={() =>
                          handleRegenerateDay(day.day_index || day.dayIndex)
                        }
                        className="px-3 py-1 bg-[#F5F5F5] dark:bg-[#2A2A2A] text-black dark:text-white rounded-lg font-poppins text-xs hover:bg-[#E0E0E0] dark:hover:bg-[#3A3A3A]"
                      >
                        Regenerate Day
                      </button>
                    </div>

                    <div className="space-y-4">
                      {day.stops.map((stop, stopIndex) => (
                        <div
                          key={stopIndex}
                          className="flex items-center gap-4 p-4 bg-[#F8F9FA] dark:bg-[#2A2A2A] rounded-lg"
                        >
                          <div className="w-2 h-2 bg-[#CCF83B] rounded-full flex-shrink-0"></div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-poppins font-medium text-black dark:text-white">
                                {stop.title}
                              </h4>
                              <span className="text-[#666] dark:text-[#B0B0B0] text-sm font-poppins">
                                {stop.est_cost
                                  ? `$${stop.est_cost}`
                                  : stop.estCost || "Free"}
                              </span>
                            </div>
                            <div className="flex gap-4 text-sm text-[#666] dark:text-[#B0B0B0] font-poppins">
                              <span>{stop.start_time || stop.startTime}</span>
                              <span>•</span>
                              <span>
                                {stop.duration_mins
                                  ? `${stop.duration_mins}min`
                                  : stop.duration || "1h"}
                              </span>
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
                            .reduce((total, stop) => {
                              const cost =
                                stop.est_cost ||
                                parseFloat(
                                  String(stop.estCost || "0")
                                    .replace("$", "")
                                    .replace("Free", "0"),
                                );
                              return total + (parseFloat(cost) || 0);
                            }, 0)
                            .toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column - Map & Weather */}
              <div className="space-y-6">
                {/* Map Placeholder */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 shadow-lg">
                  <h3 className="font-montserrat font-medium text-[18px] text-black dark:text-white mb-4">
                    Map View
                  </h3>
                  <div className="bg-[#F5F5F5] dark:bg-[#2A2A2A] rounded-lg h-[300px] flex items-center justify-center">
                    <div className="text-center text-[#666] dark:text-[#B0B0B0] font-poppins">
                      <MapPin size={24} className="mx-auto mb-2" />
                      <p>Interactive map with route</p>
                      <p className="text-sm">Coming soon with Google Maps</p>
                    </div>
                  </div>
                </div>

                {/* Weather Widget */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 shadow-lg">
                  <h3 className="font-montserrat font-medium text-[18px] text-black dark:text-white mb-4">
                    Weather Forecast
                  </h3>
                  <div className="space-y-3">
                    {generatedTrip.days.slice(0, 3).map((day) => (
                      <div
                        key={day.id}
                        className="flex items-center justify-between p-3 bg-[#F8F9FA] dark:bg-[#2A2A2A] rounded-lg"
                      >
                        <span className="font-poppins text-sm text-black dark:text-white">
                          Day {day.day_index || day.dayIndex}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">☀️</span>
                          <span className="font-poppins text-sm text-[#666] dark:text-[#B0B0B0]">
                            22°C
                          </span>
                        </div>
                      </div>
                    ))}
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
                        {generatedTrip.days.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666] dark:text-[#B0B0B0]">
                        Total Stops:
                      </span>
                      <span className="text-black dark:text-white">
                        {generatedTrip.days.reduce(
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
                        {generatedTrip.days
                          .reduce((total, day) => {
                            return (
                              total +
                              day.stops.reduce((dayTotal, stop) => {
                                const cost =
                                  stop.est_cost ||
                                  parseFloat(
                                    String(stop.estCost || "0")
                                      .replace("$", "")
                                      .replace("Free", "0"),
                                  );
                                return dayTotal + (parseFloat(cost) || 0);
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
          ) : null}
        </div>
      </div>

      {/* Add fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        
        .font-montserrat {
          font-family: 'Montserrat', sans-serif;
        }
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
    </>
  );
}
