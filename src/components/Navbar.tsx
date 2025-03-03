import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { ChevronDown, ChevronUp } from "lucide-react";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  console.log(user);

  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  const LOGO_URL =
    "https://i.im.ge/2025/02/10/H5CVHp.Ultimaite-transparent-backround-500-x-140.png";
  return (
    <nav className="container mx-auto px-6 py-2">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src={LOGO_URL}
            alt="TravelAI Logo"
            className="h-20 w-auto object-contain"
          />
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-black hover:text-gray-800 transition-colors"
          >
            Home
          </Link>
          <button
            onClick={scrollToFeatures}
            className="text-black hover:text-gray-800 transition-colors"
          >
            Features
          </button>
          <div className="relative group">
            {/* <button
              className="text-black hover:text-gray-800 transition-colors flex items-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              Pricing
            </button> */}
            <Link
              to="/payments"
              className="text-black hover:text-gray-800 transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
        {user ? (
          <div className="relative">
            <button
              className="text-black hover:text-gray-800 transition-colors flex"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {user.email}
              {isMenuOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            <div
              className={`absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 ${
                isMenuOpen ? "block" : "hidden"
              } group-hover:block`}
            >
              <Link
                to="/profile"
                className="block px-4 py-2 w-full text-black hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/payments"
                className="block px-4 py-2 w-full text-black hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Manage Subcription
              </Link>
              <button
                className="block px-4 py-2 w-full text-start text-black hover:bg-blue-50"
                onClick={signOut}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-black hover:text-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
