import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileSetup from "./pages/ProfileSetup";
import TravelQuestionnaire from "./pages/TravelQuestionnaire";
import TravelRecommendations from "./pages/TravelRecommendations";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentPage from "./pages/Payments";
import Signup from "./pages/SignUpPage.js";
import Login from "./pages/LoginPage.js";
import { supabase } from "./lib/supabase.js";

function App() {
  return (
    <div className="min-h-screen bg-mocha">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route
            path="/questionnaire"
            element={
              <ProtectedRoute>
                <TravelQuestionnaire />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <TravelRecommendations />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");

  useEffect(() => {
    const updatePlan = async () => {
      // Assuming user is authenticated and you have user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ plan }).eq("id", user.id);
      }
    };

    updatePlan();

    // Redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, plan]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100 text-center">
      <h1 className="text-3xl font-bold text-green-700">
        Payment Successful! 🎉
      </h1>
      <p className="text-lg text-gray-700 mt-2">
        Thank you for your purchase. You will be redirected shortly.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="mt-5 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100 text-center">
      <h1 className="text-3xl font-bold text-red-700">Payment Canceled ❌</h1>
      <p className="text-lg text-gray-700 mt-2">
        Your payment was not completed. You can try again or return to the
        homepage.
      </p>
      <div className="mt-5">
        <button
          onClick={() => navigate("/payments")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition mx-2"
        >
          Try Again
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition mx-2"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};
