import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Phone, MapPin, Award, Loader, Check, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface RewardProgram {
  name: string;
  number: string;
}

interface ProfileData {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  avatar_url: string;
  reward_programs: RewardProgram[];
}

const REWARD_PROGRAMS = [
  "Marriott Bonvoy",
  "Hilton Honors",
  "IHG One Rewards",
  "World of Hyatt",
  "United MileagePlus",
  "Delta SkyMiles",
  "American Airlines AAdvantage",
  "Southwest Rapid Rewards",
  "Air France-KLM Flying Blue",
  "British Airways Executive Club",
];

const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    avatar_url: "",
    reward_programs: [],
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setProfileData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone_number: profile.phone_number || "",
          address: {
            street: profile.street_address || "",
            city: profile.city || "",
            state: profile.state || "",
            zip: profile.zip_code || "",
            country: profile.country || "",
          },
          avatar_url: profile.avatar_url,
          reward_programs: profile.reward_programs || [],
        });

        // Load avatar
        const { data: photos } = await supabase
          .from("profile_photos")
          .select("url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (photos) {
          setAvatarUrl(photos.url);
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const handlePhoneVerification = async () => {
    if (!profileData.phone_number) {
      setError("Please enter a phone number");
      return;
    }

    try {
      setLoading(true);
      // In a real implementation, this would send a verification code via SMS
      // For this demo, we'll simulate it
      setShowVerificationInput(true);
      setSuccess("Verification code sent to your phone");
    } catch (err) {
      setError("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would verify the code with a service
      // For this demo, we'll accept any 6-digit code
      if (verificationCode.length === 6) {
        await supabase
          .from("profiles")
          .update({ phone_verified: true })
          .eq("id", user?.id);
        setSuccess("Phone number verified successfully");
        setShowVerificationInput(false);
      } else {
        setError("Invalid verification code");
      }
    } catch (err) {
      setError("Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploadingAvatar(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Save to profile_photos
      const { error: dbError } = await supabase.from("profile_photos").insert([
        {
          user_id: user?.id,
          url: publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      setAvatarUrl(publicUrl);
      setSuccess("Profile photo updated successfully");
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError("Failed to upload profile photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const addRewardProgram = () => {
    setProfileData((prev) => ({
      ...prev,
      reward_programs: [...prev.reward_programs, { name: "", number: "" }],
    }));
  };

  const removeRewardProgram = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      reward_programs: prev.reward_programs.filter((_, i) => i !== index),
    }));
  };

  const updateRewardProgram = (
    index: number,
    field: "name" | "number",
    value: string
  ) => {
    setProfileData((prev) => ({
      ...prev,
      reward_programs: prev.reward_programs.map((program, i) =>
        i === index ? { ...program, [field]: value } : program
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone_number: profileData.phone_number,
          street_address: profileData.address.street,
          city: profileData.address.city,
          state: profileData.address.state,
          zip_code: profileData.address.zip,
          country: profileData.address.country,
          // reward_programs: profileData.reward_programs,
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess("Profile updated successfully");
      navigate("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Complete Your Profile
            </h2>
            <p className="mt-2 text-gray-600">
              Help us personalize your travel experience
            </p>
          </div>

          {(error || success) && (
            <div
              className={`mb-4 p-4 rounded-md ${
                error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              }`}
            >
              {error || success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {profileData.avatar_url ? (
                    <img
                      src={profileData.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer"
                >
                  <Camera className="h-5 w-5 text-gray-600" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              {uploadingAvatar && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Uploading...
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={profileData.first_name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={profileData.last_name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Phone Verification */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="tel"
                  id="phone"
                  required
                  className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={profileData.phone_number}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={handlePhoneVerification}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader className="animate-spin h-4 w-4" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  <span className="ml-2">Verify</span>
                </button>
              </div>

              {showVerificationInput && (
                <div className="mt-2">
                  <label
                    htmlFor="verification-code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Verification Code
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      id="verification-code"
                      className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={verifyCode}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      <Check className="h-4 w-4" />
                      <span className="ml-2">Submit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address
              </h3>

              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={profileData.address.street}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={profileData.address.city}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                      }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={profileData.address.state}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="zip"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={profileData.address.zip}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, zip: e.target.value },
                      }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={profileData.address.country}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Reward Programs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Reward Programs
                </h3>
                <button
                  type="button"
                  onClick={addRewardProgram}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Program
                </button>
              </div>

              {profileData.reward_programs.map((program, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <select
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={program.name}
                    onChange={(e) =>
                      updateRewardProgram(index, "name", e.target.value)
                    }
                  >
                    <option value="">Select Program</option>
                    {REWARD_PROGRAMS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Membership Number"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={program.number}
                    onChange={(e) =>
                      updateRewardProgram(index, "number", e.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() => removeRewardProgram(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
