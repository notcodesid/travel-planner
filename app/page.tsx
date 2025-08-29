"use client";
import { useState } from "react";
import { Calendar, MapPin, DollarSign, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "@/lib/auth-client";
import AuthModal from "@/components/auth-modal";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    city: "",
    startDate: "",
    endDate: "",
    budget: "",
    pace: "",
    foodPrefs: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
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
      router.push("/plan");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white">
            TrailMix
            <span className="ml-1 text-yellow-400">⭐</span>
          </h1>
        </div>
        <nav className="flex items-center gap-4">
          <button
            onClick={() => router.push("/my-trips")}
            className="text-white hover:text-gray-300 transition-colors"
          >
            My Trips
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white">
                <User size={16} />
                <span className="text-sm">{user.name || user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-white hover:text-gray-300 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
            Your AI Travel Copilot
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Enter your destination, dates, and preferences. Get a personalized
            day-by-day itinerary with POIs, maps, and weather insights.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="bg-[#1A1A1A] rounded-2xl p-8 shadow-xl"
          >
            <h3 className="text-2xl font-semibold text-white text-center mb-8">
              Plan Your Perfect Trip
            </h3>

            {/* Destination Input */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                <MapPin size={16} className="text-gray-400" />
                Where are you going?
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Enter city name..."
                className="w-full h-12 px-4 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                  <Calendar size={16} className="text-gray-400" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full h-12 px-4 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                  <Calendar size={16} className="text-gray-400" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full h-12 px-4 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Budget Selection */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                <DollarSign size={16} className="text-gray-400" />
                $ Budget
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Tight", "Medium", "Comfortable"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, budget: option.toLowerCase() })
                    }
                    className={`h-12 rounded-lg font-medium text-sm transition-all ${
                      formData.budget === option.toLowerCase()
                        ? "bg-blue-600 text-white"
                        : "bg-[#2A2A2A] text-white border border-gray-600 hover:bg-[#3A3A3A]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Pace Selection */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                <Clock size={16} className="text-gray-400" />
                Travel Pace
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Relaxed", "Packed"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({ ...formData, pace: option.toLowerCase() })}
                    className={`h-12 rounded-lg font-medium text-sm transition-all ${
                      formData.pace === option.toLowerCase()
                        ? "bg-blue-600 text-white"
                        : "bg-[#2A2A2A] text-white border border-gray-600 hover:bg-[#3A3A3A]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Preferences */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                🍽️ Food Preferences (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free", "Local Cuisine"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      const newFoodPrefs = formData.foodPrefs.includes(option)
                        ? formData.foodPrefs.filter(pref => pref !== option)
                        : [...formData.foodPrefs, option];
                      setFormData({ ...formData, foodPrefs: newFoodPrefs });
                    }}
                    className={`h-12 rounded-lg font-medium text-sm transition-all ${
                      formData.foodPrefs.includes(option)
                        ? "bg-blue-600 text-white"
                        : "bg-[#2A2A2A] text-white border border-gray-600 hover:bg-[#3A3A3A]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-all duration-200"
            >
              Generate My Itinerary
            </button>
          </form>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}