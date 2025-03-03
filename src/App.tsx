import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileSetup from "./pages/ProfileSetup";
import TravelQuestionnaire from "./pages/TravelQuestionnaire";
import TravelRecommendations from "./pages/TravelRecommendations";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentPage from "./pages/Payments";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage.jsx";
import Signup from "./pages/SignUpPage.js";
import Login from "./pages/LoginPage.js";

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
