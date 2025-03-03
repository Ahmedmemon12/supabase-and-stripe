import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Map, CreditCard, Pencil } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';
import SubscriptionManager from '../components/SubscriptionManager';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Profile {
  id: string;
  email: string;
  name: string;
}

interface TravelPreference {
  id: string;
  destination: string;
  created_at: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<TravelPreference[]>([]);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(data);
  };

  const loadPreferences = async () => {
    const { data } = await supabase
      .from('travel_preferences')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setPreferences(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    // Optionally refresh profile data
    loadProfile();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                {profile?.name || 'My Profile'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/profile-setup")}
                className="inline-flex items-center px-4 py-2 border border-transparent duration-100 text-sm font-medium rounded-md text-white bg-black hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
              <button
                onClick={() => setShowPayment(!showPayment)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {showPayment && profile && (
            <div className="mb-8">
              <Elements
                stripe={stripePromise}
                options={{
                  mode: 'payment',
                  amount: 999,
                  currency: 'usd',
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#2563eb',
                    },
                  },
                }}
              >
                <SubscriptionManager
                  email={profile.email}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}

          <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-lg font-medium text-gray-900">Travel History</h3>
            </div>
            <div className="px-6 py-5">
              {preferences.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {preferences.map((pref) => (
                    <li key={pref.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Map className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {pref.destination}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(pref.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No travel plans yet. Start by creating one!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;