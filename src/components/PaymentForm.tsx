import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  email: string;
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ email, onSuccess }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Please sign in to continue');
        }

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
          if (response.status === 530) {
            throw new Error('Payment service is temporarily unavailable. Please try again later.');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        if (!data.clientSecret) {
          throw new Error('No client secret received');
        }
        
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Error fetching client secret:', err);
        setError(err.message || 'Failed to initialize payment form');
      }
    };

    if (email) {
      fetchClientSecret();
    }
  }, [email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/profile-setup`,
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

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        {error ? (
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-600">Preparing payment form...</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Start Your Free Trial</h2>
          <p className="mt-2 text-gray-600">
            7 days free, then $9.99/month
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <PaymentElement />
          
          <button
            type="submit"
            disabled={!stripe || loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Start Free Trial'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Your card will not be charged during the trial period.</p>
          <p className="mt-1">Cancel anytime before the trial ends.</p>
        </div>
      </div>
    </div>
  );
};

interface PaymentFormWrapperProps extends PaymentFormProps {}

export const PaymentFormWrapper: React.FC<PaymentFormWrapperProps> = (props) => {
  const options = {
    mode: 'payment' as const,
    amount: 999,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentFormWrapper;