"use client";
import { useState } from "react";
import { Calendar, MapPin, DollarSign, Clock, Utensils } from "lucide-react";

export default function HomePage() {
  const [formData, setFormData] = useState({
    city: "",
    startDate: "",
    endDate: "",
    budget: "",
    pace: "",
    foodPrefs: [],
  });

  const handleFoodPrefChange = (pref) => {
    setFormData((prev) => ({
      ...prev,
      foodPrefs: prev.foodPrefs.includes(pref)
        ? prev.foodPrefs.filter((p) => p !== pref)
        : [...prev.foodPrefs, pref],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.city ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.budget ||
      !formData.pace
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Store form data for the plan page
    if (typeof window !== "undefined") {
      localStorage.setItem("tripFormData", JSON.stringify(formData));
      window.location.href = "/plan";
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-[#121212]">
        {/* Header */}
        <nav className="bg-[#F7F7F0] dark:bg-[#1E1E1E] h-[60px] sticky top-0 z-50">
          <div className="max-w-full px-4 md:px-6 h-full flex items-center justify-between">
            <div className="flex items-center pl-2 md:pl-6">
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

        {/* Hero Section */}
        <section className="bg-white dark:bg-[#121212] pt-14 sm:pt-20 lg:pt-[120px] pb-16">
          <div className="max-w-[1200px] mx-auto px-4 text-center">
            <h1 className="font-montserrat font-medium text-black dark:text-white tracking-[-0.5px] text-[42px] leading-[1.15] sm:text-[56px] sm:leading-[1.1] lg:text-[72px] lg:leading-[1.05] mb-6">
              Your AI Travel Copilot
            </h1>
            <p className="font-poppins text-[18px] text-[#666] dark:text-[#B0B0B0] leading-[1.6] max-w-2xl mx-auto mb-12">
              Enter your destination, dates, and preferences. Get a personalized
              day-by-day itinerary with POIs, maps, and weather insights.
            </p>
          </div>
        </section>

        {/* Trip Planning Form */}
        <section className="bg-[#F7F7F0] dark:bg-[#1E1E1E] py-16">
          <div className="max-w-[800px] mx-auto px-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-[#121212] rounded-[24px] p-8 md:p-12 shadow-lg"
            >
              <h2 className="font-montserrat font-medium text-[28px] text-black dark:text-white mb-8 text-center">
                Plan Your Perfect Trip
              </h2>

              {/* City Input */}
              <div className="mb-6">
                <label className="flex items-center gap-2 font-poppins font-medium text-sm text-black dark:text-white mb-3">
                  <MapPin size={16} />
                  Where are you going?
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Enter city name..."
                  className="w-full h-12 px-4 border border-[#E5E5E5] dark:border-[#404040] rounded-lg font-poppins text-black dark:text-white bg-white dark:bg-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#CCF83B] focus:border-transparent"
                  required
                />
              </div>

              {/* Date Range */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="flex items-center gap-2 font-poppins font-medium text-sm text-black dark:text-white mb-3">
                    <Calendar size={16} />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full h-12 px-4 border border-[#E5E5E5] dark:border-[#404040] rounded-lg font-poppins text-black dark:text-white bg-white dark:bg-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#CCF83B] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 font-poppins font-medium text-sm text-black dark:text-white mb-3">
                    <Calendar size={16} />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full h-12 px-4 border border-[#E5E5E5] dark:border-[#404040] rounded-lg font-poppins text-black dark:text-white bg-white dark:bg-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#CCF83B] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Budget Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 font-poppins font-medium text-sm text-black dark:text-white mb-3">
                  <DollarSign size={16} />
                  Budget
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["tight", "medium", "comfortable"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, budget: option })
                      }
                      className={`h-12 rounded-lg font-poppins font-medium text-sm transition-all ${
                        formData.budget === option
                          ? "bg-[#CCF83B] text-black"
                          : "bg-[#F5F5F5] dark:bg-[#2A2A2A] text-black dark:text-white hover:bg-[#E0E0E0] dark:hover:bg-[#3A3A3A]"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 font-poppins font-medium text-sm text-black dark:text-white mb-3">
                  <Clock size={16} />
                  Travel Pace
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["relaxed", "packed"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, pace: option })}
                      className={`h-12 rounded-lg font-poppins font-medium text-sm transition-all ${
                        formData.pace === option
                          ? "bg-[#CCF83B] text-black"
                          : "bg-[#F5F5F5] dark:bg-[#2A2A2A] text-black dark:text-white hover:bg-[#E0E0E0] dark:hover:bg-[#3A3A3A]"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Preferences */}
              <div className="mb-8">
                <label className="flex items-center gap-2 font-poppins font-medium text-sm text-black dark:text-white mb-3">
                  <Utensils size={16} />
                  Food Preferences (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {["vegetarian", "vegan", "halal", "local", "anything"].map(
                    (pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => handleFoodPrefChange(pref)}
                        className={`px-4 py-2 rounded-full font-poppins font-medium text-sm transition-all ${
                          formData.foodPrefs.includes(pref)
                            ? "bg-[#CCF83B] text-black"
                            : "bg-[#F5F5F5] dark:bg-[#2A2A2A] text-black dark:text-white hover:bg-[#E0E0E0] dark:hover:bg-[#3A3A3A]"
                        }`}
                      >
                        {pref.charAt(0).toUpperCase() + pref.slice(1)}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-14 bg-[#CCF83B] hover:bg-[#B8E635] text-black font-poppins font-semibold text-lg rounded-lg transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Generate My Itinerary
              </button>
            </form>
          </div>
        </section>
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
