import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import PaymentFormWrapper from "../components/PaymentForm";

import { redirect } from "react-router-dom";

const AuthPage = () => {
  const [step, setStep] = useState<"auth" | "payment">("auth");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(
    null
  );
  const navigate = useNavigate();
  const { user, session } = useAuth();

  useEffect(() => {
    if (session && !isSignUp) {
      navigate("/questionnaire", { replace: true });
    }
  }, [session, isSignUp, navigate]);

  useEffect(() => {
    let timer: number;
    if (rateLimitCountdown && rateLimitCountdown > 0) {
      timer = window.setInterval(() => {
        setRateLimitCountdown((prev) => (prev ? prev - 1 : null));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [rateLimitCountdown]);

  const validateForm = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleRateLimitError = () => {
    setRateLimitCountdown(60);
    setError("Too many attempts. Please wait 60 seconds before trying again.");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || rateLimitCountdown) return;

    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              email_confirm: true,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes("rate limit")) {
            handleRateLimitError();
            return;
          }
          throw signUpError;
        }

        if (!data.user) throw new Error("No user data returned");

        // Move to payment step after successful signup
        setStep("payment");
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          if (signInError.message.includes("rate limit")) {
            handleRateLimitError();
            return;
          }
          throw signInError;
        }

        if (!data.user) throw new Error("No user data returned");
        if (!data.session) throw new Error("No session created");

        navigate("/", { replace: true });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate("/questionnaire", { replace: true });
  };

  const renderAuthForm = () => (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
          {rateLimitCountdown && rateLimitCountdown > 0 && (
            <div className="mt-2 text-sm">
              Please wait {rateLimitCountdown} seconds before trying again.
            </div>
          )}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleAuth}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mocha focus:border-mocha"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={loading || (rateLimitCountdown && rateLimitCountdown > 0)}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mocha focus:border-mocha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            disabled={loading || (rateLimitCountdown && rateLimitCountdown > 0)}
          />
          <p className="mt-1 text-sm text-gray-500">
            {isSignUp && "Password must be at least 6 characters long"}
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || (rateLimitCountdown && rateLimitCountdown > 0)}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mocha hover:bg-mocha-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mocha disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : isSignUp ? "Sign up" : "Sign in"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setRateLimitCountdown(null);
          }}
          className="w-full text-center text-sm text-mocha hover:text-mocha-dark"
          disabled={loading}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-mocha-light to-mocha flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Plane className="h-12 w-12 text-white" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {step === "auth"
            ? isSignUp
              ? "Create your account"
              : "Sign in to your account"
            : "Complete your subscription"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {step === "auth" ? (
          renderAuthForm()
        ) : (
          <PaymentFormWrapper email={email} onSuccess={handlePaymentSuccess} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;

// export default function AuthPage() {
//   return redirect("/login");
// }
