import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft, Loader, Copy, Check, Globe, Clock, Wallet, MapPin } from 'lucide-react';
import openai from '../lib/openai';
import type { TravelPreferences } from '../types/travel';

interface TripSummary {
  totalBudget: string;
  duration: string;
  destinations: string[];
  travelStyle: string;
}

const TravelRecommendations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState('');
  const [tripSummary, setTripSummary] = useState<TripSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const preferences = location.state?.preferences as TravelPreferences;

  const extractTripSummary = (content: string) => {
    const summary: TripSummary = {
      totalBudget: '$' + preferences.total_budget.toLocaleString(),
      duration: preferences.trip_length,
      destinations: preferences.preferred_regions,
      travelStyle: preferences.travel_pace
    };
    setTripSummary(summary);
  };

  useEffect(() => {
    if (!preferences) {
      navigate('/questionnaire');
      return;
    }

    generateRecommendation();
  }, [preferences, navigate]);

  const generateRecommendation = async () => {
    try {
      const prompt = `You are a world traveler and an expert planner who knows every city and continent on earth very well. Based on the following travel preferences, please curate TWO different detailed travel plans that match the requirements perfectly. Format your response with clear sections and bold headers.

Travel Profile:
- Purpose: ${preferences.trip_purpose}
- Trip Length: ${preferences.trip_length}
- Preferred Regions: ${preferences.preferred_regions.join(', ')}
- Environment: ${preferences.environment_preference}
- Total Budget: $${preferences.total_budget}
- Accommodation: ${preferences.accommodation_type} ($${preferences.accommodation_budget}/night)
- Activities: ${preferences.activities.join(', ')}
- Cuisine Preferences: ${preferences.cuisine_preferences.join(', ')}
- Dining Budget: ${preferences.dining_budget}
- Travel Companions: ${preferences.travel_companions}
- Adventure Level: ${preferences.adventure_level}
- Travel Pace: ${preferences.travel_pace}
- Transportation: ${preferences.transportation_preference}
- Experience Level: ${preferences.travel_experience_level}
- Comfort Level: ${preferences.comfort_level}
${preferences.special_considerations ? '- Special Considerations: ' + preferences.special_considerations : ''}
${preferences.health_safety_concerns ? '- Health & Safety Concerns: ' + preferences.health_safety_concerns : ''}

For each travel plan, please structure the response as follows:

**Overview**
- Total Budget Breakdown
- Travel Timeframe
- Travel Style
- Destinations
- Key Interests

**Option 1: [Destination Name]**
**Why This Destination?**
[Explanation of why this matches preferences]

**Day-by-Day Itinerary**
For each day:
**Day X: [Title]**
**Morning:**
- Activities
- Recommendations
**Afternoon:**
- Activities
- Options
**Evening:**
- Dining
- Entertainment

**Accommodations**
- Recommended hotels/resorts
- Price ranges
- Location benefits

**Dining Experiences**
- Must-try dishes
- Restaurant recommendations
- Local food experiences

**Transportation**
- Getting around
- Cost estimates
- Time-saving tips

**Cultural & Practical Tips**
- Local customs
- Language basics
- Safety tips
- Packing essentials

**Unique Experiences**
- Hidden gems
- Special activities
- Photo opportunities

**Budget Breakdown**
- Detailed costs for all categories

[Repeat structure for Option 2]

Please ensure all recommendations are specific, practical, and align with the stated preferences and constraints.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a world-class travel expert with extensive knowledge of destinations worldwide. Your recommendations are always personalized, practical, and inspiring, focusing on creating unforgettable travel experiences that perfectly match the traveler's preferences and requirements. Format your responses with clear sections and bold headers for better readability."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      const formattedResponse = response.choices[0].message.content?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '';
      setRecommendation(formattedResponse);
      extractTripSummary(formattedResponse);
    } catch (error: any) {
      console.error('Error generating recommendation:', error);
      setRecommendation(`Error: ${error.message || 'Failed to generate recommendations. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const plainText = recommendation.replace(/<\/?[^>]+(>|$)/g, '');
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (!preferences) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/questionnaire')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Questionnaire
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Plane className="h-6 w-6 text-blue-600" />
                  <h2 className="ml-2 text-xl font-semibold text-gray-900">
                    Your Personalized Travel Plans
                  </h2>
                </div>
                {!loading && (
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Itinerary
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {!loading && tripSummary && (
              <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Wallet className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Total Budget</h3>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{tripSummary.totalBudget}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Duration</h3>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{tripSummary.duration}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Destinations</h3>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      {tripSummary.destinations.length} {tripSummary.destinations.length === 1 ? 'Region' : 'Regions'}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Travel Style</h3>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{tripSummary.travelStyle}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                  <p className="mt-4 text-gray-600">
                    Creating your personalized travel plans...
                  </p>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div 
                    className="whitespace-pre-line markdown"
                    dangerouslySetInnerHTML={{ __html: recommendation }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TravelRecommendations;