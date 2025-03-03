import React, { useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';

interface SubscriptionManagerProps {
  email: string;
  onSuccess?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ email, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in to continue');
      }

      // Create payment intent
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            amount: 999 // $9.99
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      const { clientSecret } = await response.json();

      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/profile`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              email: email
            }
          }
        },
      });

      if (paymentError) {
        throw paymentError;
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Manage Subscription</h3>
        <p className="mt-2 text-gray-600">
          $9.99/month - Cancel anytime
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Update Payment Method
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Your payment information is securely processed by Stripe.</p>
      </div>
    </div>
  );
};

export default SubscriptionManager;