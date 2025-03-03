import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const subscriptions = [
  {
    id: "basic",
    name: "Basic Plan",
    plan: "basic",
    price: 4.99,
    priceId: "price_1QxFh4GRFbYN6GoTTyOpQLs7",
    features: ["AI Travel Plans", "Limited Recommendations"],
  },
  {
    id: "premium",
    name: "Premium Plan",
    plan: "premium",
    price: 9.99,
    priceId: "price_1Qxc4pGRFbYN6GoTR94Gk0wa",
    features: [
      "Unlimited AI Travel Plans",
      "Personalized Recommendations",
      "Budget Optimization",
    ],
  },
  {
    id: "pro",
    name: "Pro Plan",
    plan: "pro",
    price: 19.99,
    priceId: "price_1Qxc6MGRFbYN6GoTcGrVeUtz",
    features: [
      "All Premium Features",
      "Priority Support",
      "Exclusive AI Insights",
    ],
  },
];

const CheckoutButton = ({ plan, price }) => {
  console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const { user } = useAuth();
  const stripe = useStripe();
  // const pathName = window.location.host
  const pathName = "http://localhost:5173";
  const elements = useElements();

  const handleCheckout = async () => {
    if (!stripe || !user) return;
    // const domain = "http://localhost:3000"; // Backend API URL
    const domain = "https://stripe-integration-ten.vercel.app"; // Backend API URL

    try {
      // const { data, error } = await supabase
      //   .from("payments")
      //   .insert([
      //     { user_id: user.id, plan: plan, amount: price, status: "pending" },
      //   ]);

      // if (error) throw error;

      // Send plan ID (e.g., "basic") instead of priceId
      const response = await fetch(`${domain}/api/create_checkout`, {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan,
          userId: user.email,
          app_url: pathName,
        }), // Use email
      });

      const session = await response.json();
      await stripe.redirectToCheckout({ sessionId: session.sessionId });
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="block w-full bg-black text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
    >
      Subscribe
    </button>
  );
};

const PaymentPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("");
  useEffect(() => {
    async function checkPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const profileData = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id);
      console.log(profileData);
      setSelectedPlan(profileData?.data[0]?.plan);
    }

    checkPlan();
  }, []);
  return (
    <Elements stripe={stripePromise}>
      <Navbar />
      {selectedPlan ? (
        <div className="flex min-h-[60vh] items-center flex-col justify-center">
          <span>
            Your current Selected Plan is:{" "}
            <span className="font-bold uppercase ml-1">{selectedPlan}</span>
          </span>
          <button className="bg-black text-white px-4 py-2 rounded-lg" onClick={()=>setSelectedPlan()}>Change Plan</button>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptions.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden p-6"
              >
                <h3 className="text-center font-semibold text-2xl text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-4 text-center">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600 ml-1">month</span>
                </div>
                <div className="mt-6">
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 text-gray-700"
                    >
                      <span className="h-5 w-5 text-green-500">✔</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <CheckoutButton plan={plan.plan} price={plan.price} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Elements>
  );
};

export default PaymentPage;
