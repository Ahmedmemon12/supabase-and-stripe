import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, Globe, Map, Play, Pause, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { TravelPreferences } from "../types/travel";

const LandingPage = () => {
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const preferences = location.state?.preferences as TravelPreferences;

  // useEffect(() => {
  //   signOut();
  // }, []);

  // useEffect(async () => {
  // const userData = supabase.auth.getUser();
  // console.log(userData);
  // }, []);

  // const signOut = async () => {
  //   await supabase.auth.signOut();
  //   navigate("/");
  // };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mocha-light to-mocha">
      <Navbar />

      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-black mb-6">
            Curate your Ultimate Travel Experience with AI
          </h1>
          <p className="text-xl text-black mb-8">
            Have you ever been stuck on where to go on vacation and more
            importantly what to do while there? Our AI Travel Expert will make a
            personalized recommendation for your next unimaginable trip based on
            your preferences as well as travel style and budget!
          </p>
          <Link
            to={
              user
                ? preferences
                  ? "/recommendations"
                  : "/questionnaire"
                : "/login"
            }
            className="bg-white text-black px-8 py-3 rounded-lg text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <Globe className="h-5 w-5" />
            <span>Start Planning Your Journey</span>
          </Link>
        </div>

        <div className="mt-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-black">
            See How It Works
          </h2>
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
            <video
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1800&auto=format&fit=crop"
              onClick={() => setIsPlaying(!isPlaying)}
              autoPlay={false}
              loop
              muted
              playsInline
            >
              <source src="https://example.com/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-opacity group"
            >
              {!isPlaying ? (
                <Play className="h-16 w-16 text-white opacity-90 group-hover:scale-110 transition-transform" />
              ) : (
                <Pause className="h-16 w-16 text-white opacity-90 group-hover:scale-110 transition-transform" />
              )}
            </button>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <div className="flex justify-between text-white max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center mb-2 mx-auto">
                    1
                  </div>
                  <p className="text-sm">Answer Questions</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center mb-2 mx-auto">
                    2
                  </div>
                  <p className="text-sm">Set Preferences</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center mb-2 mx-auto">
                    3
                  </div>
                  <p className="text-sm">Get Personalized Plan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold mb-4">
              Example Recommendation
            </h3>
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-xl font-medium text-black mb-4">
                  7-Day Cultural Experience in Kyoto, Japan
                </h4>
                <p className="text-gray-600 mb-4">
                  Perfect for: Culture enthusiasts, Photography lovers, Food
                  explorers
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-2">Highlights</h5>
                    <ul className="list-disc list-inside text-gray-600">
                      <li>Traditional tea ceremony at Ginkaku-ji</li>
                      <li>Guided tour of ancient temples</li>
                      <li>Cooking class with local chef</li>
                      <li>Bamboo forest exploration</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Includes</h5>
                    <ul className="list-disc list-inside text-gray-600">
                      <li>Luxury ryokan accommodation</li>
                      <li>Private cultural experiences</li>
                      <li>Local transportation pass</li>
                      <li>24/7 concierge service</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <Map className="h-12 w-12 text-black mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Smart Recommendations
            </h3>
            <p className="text-gray-600">
              Carefully crafted questions to personalize your trip based on your
              interests and preferences.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <Globe className="h-12 w-12 text-black mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Planning</h3>
            <p className="text-gray-600">
              Use our powerful AI to create the perfect tailored itinerary just
              for you
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <Compass className="h-12 w-12 text-black mb-4" />
            <h3 className="text-xl font-semibold mb-2">Seamless Experience</h3>
            <p className="text-gray-600">
              Everything you need to plan your trip in one place.
            </p>
          </div>
        </div>

        <div className="mt-24 mb-20">
          <h2 className="text-3xl font-bold text-center text-black mb-12">
            Simple, Transparent Pricing
          </h2>

          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8">
              <h3 className="text-center font-semibold text-2xl text-gray-900">
                Premium Plan
              </h3>
              <div className="mt-4 text-center">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-gray-600 ml-1">/month</span>
              </div>

              <div className="mt-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited AI-powered travel plans</span>
                </div>
                <div className="mt-4 flex items-center space-x-3 text-gray-700">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Personalized recommendations</span>
                </div>
                <div className="mt-4 flex items-center space-x-3 text-gray-700">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Detailed day-by-day itineraries</span>
                </div>
                <div className="mt-4 flex items-center space-x-3 text-gray-700">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Budget optimization</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/login"
                  className="block w-full bg-black text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Start 7-Day Free Trial
                </Link>
                <p className="text-sm text-gray-500 text-center mt-3">
                  *credit card required
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Cancel anytime. Free trial automatically converts to a paid
                subscription unless cancelled.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
