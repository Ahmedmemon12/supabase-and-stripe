import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Globe, Map, Navigation } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { TravelPreferences } from "../types/travel";
import ProgressBar from "../components/ProgressBar";

const TravelQuestionnaire = () => {
  const [customDestination, setCustomDestination] = useState("");
  const [customDestinations, setCustomDestinations] = useState<string[]>([]);
  const [customDays, setCustomDays] = useState<number | "">("");
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TravelPreferences>({
    trip_purpose: "",
    activities: [],
    travel_dates: { is_flexible: true },
    trip_length: "",
    preferred_regions: [],
    environment_preference: "",
    total_budget: 0,
    accommodation_type: "",
    accommodation_budget: 0,
    cuisine_preferences: [],
    dining_budget: "",
    travel_companions: "",
    special_considerations: "",
    adventure_level: "",
    bucket_list_items: [],
    travel_pace: "",
    transportation_preference: "",
    travel_experience_level: "",
    comfort_level: "",
    health_safety_concerns: "",
    previous_experiences: "",
  });

  const totalSteps = 10;
  const stepLabels = [
    "Goals",
    "Timing",
    "Location",
    "Budget",
    "Dining",
    "Group",
    "Adventure",
    "Style",
    "Safety",
    "Notes",
  ];

  const validateStep = () => {
    switch (step) {
      case 1:
        return data.trip_purpose.trim() !== "" && data.activities.length > 0;
      case 2:
        return (
          data.trip_length !== "" ||
          (typeof customDays === "number" && customDays > 0)
        );
      case 3:
        return (
          (data.preferred_regions.length > 0 ||
            customDestinations.length > 0) &&
          data.environment_preference !== ""
        );
      case 4:
        return (
          data.total_budget > 0 &&
          data.accommodation_type !== "" &&
          data.accommodation_budget > 0
        );
      case 5:
        return data.cuisine_preferences.length > 0 && data.dining_budget !== "";
      case 6:
        return data.travel_companions !== "";
      case 7:
        return data.adventure_level !== "" && data.bucket_list_items.length > 0;
      case 8:
        return (
          data.travel_pace !== "" &&
          data.transportation_preference !== "" &&
          data.travel_experience_level !== ""
        );
      case 9:
        return data.comfort_level !== "";
      case 10:
        return true; // Optional field
      default:
        return false;
    }
  };

  const addCustomDestination = () => {
    if (customDestination.trim()) {
      setCustomDestinations((prev) => [...prev, customDestination.trim()]);
      setData((prev) => ({
        ...prev,
        preferred_regions: [
          ...prev.preferred_regions,
          customDestination.trim(),
        ],
      }));
      setCustomDestination("");
    }
  };

  const removeCustomDestination = (destination: string) => {
    setCustomDestinations((prev) => prev.filter((d) => d !== destination));
    setData((prev) => ({
      ...prev,
      preferred_regions: prev.preferred_regions.filter(
        (r) => r !== destination
      ),
    }));
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value);

    if (value === "") {
      setCustomDays("");
      setData((prev) => ({ ...prev, trip_length: "" }));
    } else if (!isNaN(numValue) && numValue > 0) {
      setCustomDays(numValue);
      setData((prev) => ({ ...prev, trip_length: `${numValue} days` }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please sign in to save your preferences.");
        navigate("/login");
        return;
      }

      // Ensure all required fields are present and properly formatted
      const preferenceData = {
        user_id: user.id,
        trip_purpose: data.trip_purpose.trim(),
        activities: data.activities,
        travel_dates: data.travel_dates || { is_flexible: true },
        trip_length: customDays ? `${customDays} days` : data.trip_length,
        preferred_regions: data.preferred_regions,
        environment_preference: data.environment_preference,
        total_budget: Number(data.total_budget),
        accommodation_type: data.accommodation_type,
        accommodation_budget: Number(data.accommodation_budget),
        cuisine_preferences: data.cuisine_preferences,
        dining_budget: data.dining_budget,
        travel_companions: data.travel_companions,
        special_considerations: data.special_considerations || null,
        adventure_level: data.adventure_level,
        bucket_list_items: data.bucket_list_items,
        travel_pace: data.travel_pace,
        transportation_preference: data.transportation_preference,
        travel_experience_level: data.travel_experience_level,
        comfort_level: data.comfort_level,
        health_safety_concerns: data.health_safety_concerns || null,
        previous_experiences: data.previous_experiences || null,
      };

      const { error: insertError } = await supabase
        .from("new_travel_preferences")
        .insert([preferenceData]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      navigate("/recommendations", {
        state: {
          preferences: {
            ...preferenceData,
            total_budget: Number(preferenceData.total_budget),
            accommodation_budget: Number(preferenceData.accommodation_budget),
          },
        },
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      setError("Please complete all required fields before continuing");
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
      setError("");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Travel Goals & Interests
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Trip
                </label>
                <input
                  type="text"
                  value={data.trip_purpose}
                  onChange={(e) =>
                    setData({ ...data, trip_purpose: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., relaxation, adventure, cultural immersion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activities You Enjoy
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Outdoor Adventures",
                    "Cultural Experiences",
                    "Food & Dining",
                    "Shopping",
                    "Museums & Art",
                    "Nightlife",
                    "Relaxation",
                    "Sports",
                    "Photography",
                    "Local Markets",
                    "Historical Sites",
                    "Beach Activities",
                  ].map((activity) => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => {
                        const activities = data.activities.includes(activity)
                          ? data.activities.filter((a) => a !== activity)
                          : [...data.activities, activity];
                        setData({ ...data, activities });
                      }}
                      className={`p-2 border rounded-md ${
                        data.activities.includes(activity)
                          ? "bg-blue-50 border-blue-500"
                          : "hover:border-blue-500"
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Timing & Duration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Dates
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={data.travel_dates.start || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        travel_dates: {
                          ...data.travel_dates,
                          start: e.target.value,
                        },
                      })
                    }
                    className="p-2 border rounded-md"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={data.travel_dates.end || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        travel_dates: {
                          ...data.travel_dates,
                          end: e.target.value,
                        },
                      })
                    }
                    className="p-2 border rounded-md"
                  />
                </div>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={data.travel_dates.is_flexible}
                      onChange={(e) =>
                        setData({
                          ...data,
                          travel_dates: {
                            ...data.travel_dates,
                            is_flexible: e.target.checked,
                          },
                        })
                      }
                      className="form-checkbox"
                    />
                    <span className="ml-2">Dates are flexible</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Length
                </label>
                <div className="space-y-4">
                  <select
                    value={data.trip_length}
                    onChange={(e) => {
                      setData({ ...data, trip_length: e.target.value });
                      setCustomDays("");
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select duration</option>
                    <option value="weekend">Weekend (1-3 days)</option>
                    <option value="short">Short Trip (4-7 days)</option>
                    <option value="medium">Extended Stay (1-2 weeks)</option>
                    <option value="long">Long Journey (2+ weeks)</option>
                  </select>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or specify exact number of days
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customDays}
                      onChange={handleCustomDaysChange}
                      placeholder="Enter number of days"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Destinations & Geography
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Regions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Europe",
                    "Asia",
                    "North America",
                    "South America",
                    "Africa",
                    "Oceania",
                    "Caribbean",
                    "Middle East",
                    "Mediterranean",
                    "Scandinavia",
                    "Central America",
                    "Pacific Islands",
                  ].map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => {
                        const regions = data.preferred_regions.includes(region)
                          ? data.preferred_regions.filter((r) => r !== region)
                          : [...data.preferred_regions, region];
                        setData({ ...prev, preferred_regions: regions });
                      }}
                      className={`p-2 border rounded-md ${
                        data.preferred_regions.includes(region)
                          ? "bg-blue-50 border-blue-500"
                          : "hover:border-blue-500"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Specific Destinations
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customDestination}
                    onChange={(e) => setCustomDestination(e.target.value)}
                    placeholder="Enter city or country"
                    className="flex-1 p-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={addCustomDestination}
                    disabled={!customDestination.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {customDestinations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {customDestinations.map((destination) => (
                      <span
                        key={destination}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {destination}
                        <button
                          type="button"
                          onClick={() => removeCustomDestination(destination)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment Preference
                </label>
                <select
                  value={data.environment_preference}
                  onChange={(e) =>
                    setData({ ...data, environment_preference: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select preference</option>
                  <option value="urban">Urban (Cities)</option>
                  <option value="nature">Nature (Countryside)</option>
                  <option value="coastal">Coastal (Beaches)</option>
                  <option value="mountains">Mountains</option>
                  <option value="mixed">Mixed Environments</option>
                  <option value="islands">Island Settings</option>
                  <option value="desert">Desert Landscapes</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Budget & Accommodation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget (USD)
                </label>
                <input
                  type="number"
                  value={data.total_budget || ""}
                  onChange={(e) =>
                    setData({ ...data, total_budget: Number(e.target.value) })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your total budget"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accommodation Type
                </label>
                <select
                  value={data.accommodation_type}
                  onChange={(e) =>
                    setData({ ...data, accommodation_type: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select accommodation type</option>
                  <option value="luxury">Luxury Hotels</option>
                  <option value="boutique">Boutique Hotels</option>
                  <option value="mid-range">Mid-range Hotels</option>
                  <option value="airbnb">Vacation Rentals/Airbnb</option>
                  <option value="hostel">Hostels</option>
                  <option value="camping">Camping/Glamping</option>
                  <option value="mixed">Mix of Different Types</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accommodation Budget per Night (USD)
                </label>
                <input
                  type="number"
                  value={data.accommodation_budget || ""}
                  onChange={(e) =>
                    setData({
                      ...data,
                      accommodation_budget: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your nightly budget"
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Food & Dining
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Preferences
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Local Cuisine",
                    "Fine Dining",
                    "Street Food",
                    "Vegetarian",
                    "Vegan",
                    "Seafood",
                    "International",
                    "Food Markets",
                    "Wine Tasting",
                    "Food Tours",
                    "Cooking Classes",
                    "Cafes",
                  ].map((cuisine) => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => {
                        const preferences = data.cuisine_preferences.includes(
                          cuisine
                        )
                          ? data.cuisine_preferences.filter(
                              (c) => c !== cuisine
                            )
                          : [...data.cuisine_preferences, cuisine];
                        setData({ ...data, cuisine_preferences: preferences });
                      }}
                      className={`p-2 border rounded-md ${
                        data.cuisine_preferences.includes(cuisine)
                          ? "bg-blue-50 border-blue-500"
                          : "hover:border-blue-500"
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dining Budget
                </label>
                <select
                  value={data.dining_budget}
                  onChange={(e) =>
                    setData({ ...data, dining_budget: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select dining budget</option>
                  <option value="budget">
                    Budget (Street food & Local spots)
                  </option>
                  <option value="moderate">
                    Moderate (Mix of local & mid-range)
                  </option>
                  <option value="high">
                    High-end (Fine dining & Experiences)
                  </option>
                  <option value="mixed">Mixed (Variety of options)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Travel Companions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who Are You Traveling With?
                </label>
                <select
                  value={data.travel_companions}
                  onChange={(e) =>
                    setData({ ...data, travel_companions: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select travel companion(s)</option>
                  <option value="solo">Solo Travel</option>
                  <option value="partner">With Partner</option>
                  <option value="family">Family with Children</option>
                  <option value="friends">Friends Group</option>
                  <option value="couple">Couple</option>
                  <option value="multi-generation">
                    Multi-generational Family
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Considerations
                </label>
                <textarea
                  value={data.special_considerations || ""}
                  onChange={(e) =>
                    setData({ ...data, special_considerations: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="Any special needs, accessibility requirements, or specific preferences?"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Adventure & Special Interests
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adventure Level
                </label>
                <select
                  value={data.adventure_level}
                  onChange={(e) =>
                    setData({ ...data, adventure_level: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select adventure level</option>
                  <option value="relaxed">
                    Relaxed (Minimal physical activity)
                  </option>
                  <option value="moderate">
                    Moderate (Some physical activities)
                  </option>
                  <option value="active">
                    Active (Regular physical activities)
                  </option>
                  <option value="challenging">
                    Challenging (Intense activities)
                  </option>
                  <option value="extreme">
                    Extreme (Adrenaline-pumping activities)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bucket List Items
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Historical Sites",
                    "Natural Wonders",
                    "Adventure Sports",
                    "Cultural Festivals",
                    "Wildlife Encounters",
                    "Local Experiences",
                    "Iconic Landmarks",
                    "Hidden Gems",
                    "Scenic Routes",
                    "Unique Accommodations",
                    "Local Workshops",
                    "Special Events",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        const items = data.bucket_list_items.includes(item)
                          ? data.bucket_list_items.filter((i) => i !== item)
                          : [...data.bucket_list_items, item];
                        setData({ ...data, bucket_list_items: items });
                      }}
                      className={`p-2 border rounded-md ${
                        data.bucket_list_items.includes(item)
                          ? "bg-blue-50 border-blue-500"
                          : "hover:border-blue-500"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Travel Style & Logistics
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Pace
                </label>
                <select
                  value={data.travel_pace}
                  onChange={(e) =>
                    setData({ ...data, travel_pace: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select travel pace</option>
                  <option value="relaxed">Relaxed (Plenty of free time)</option>
                  <option value="balanced">
                    Balanced (Mix of activities and rest)
                  </option>
                  <option value="busy">Busy (Full schedule)</option>
                  <option value="intensive">
                    Intensive (Maximum activities)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transportation Preference
                </label>
                <select
                  value={data.transportation_preference}
                  onChange={(e) =>
                    setData({
                      ...data,
                      transportation_preference: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select transportation preference</option>
                  <option value="public">Public Transportation</option>
                  <option value="rental">Rental Car</option>
                  <option value="private">Private Transfers</option>
                  <option value="walking">Walking/Cycling</option>
                  <option value="mixed">Mix of Options</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Experience Level
                </label>
                <select
                  value={data.travel_experience_level}
                  onChange={(e) =>
                    setData({
                      ...data,
                      travel_experience_level: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">
                    First-time International Traveler
                  </option>
                  <option value="intermediate">
                    Some International Experience
                  </option>
                  <option value="experienced">Experienced Traveler</option>
                  <option value="expert">Expert/Frequent Traveler</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Safety & Comfort
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comfort Level with Different Environments
                </label>
                <select
                  value={data.comfort_level}
                  onChange={(e) =>
                    setData({ ...data, comfort_level: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select comfort level</option>
                  <option value="familiar">
                    Prefer Familiar/Tourist-friendly Areas
                  </option>
                  <option value="moderate">
                    Comfortable with Some Adventure
                  </option>
                  <option value="adventurous">
                    Very Comfortable with New Experiences
                  </option>
                  <option value="any">Comfortable in Any Setting</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health & Safety Concerns
                </label>
                <textarea
                  value={data.health_safety_concerns || ""}
                  onChange={(e) =>
                    setData({ ...data, health_safety_concerns: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="Any specific health conditions, dietary restrictions, or safety concerns?"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Personal Touches
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Travel Experiences & Special Interests
                </label>
                <textarea
                  value={data.previous_experiences || ""}
                  onChange={(e) =>
                    setData({ ...data, previous_experiences: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="Tell us about your favorite past trips, special interests (art, wine, architecture, etc.), or any other details that would help us personalize your trip."
                  rows={5}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Plane className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Let's Plan Your Perfect Trip
          </h2>
        </div>

        <div className="mb-8">
          <ProgressBar
            currentStep={step}
            totalSteps={totalSteps}
            labels={stepLabels}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8">
          {renderStepContent()}

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                step === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Back
            </button>
            <button
              onClick={step === totalSteps ? handleSubmit : handleNext}
              disabled={!validateStep() || loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                !validateStep() || loading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading
                ? "Saving..."
                : step === totalSteps
                ? "Get Recommendations"
                : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelQuestionnaire;
