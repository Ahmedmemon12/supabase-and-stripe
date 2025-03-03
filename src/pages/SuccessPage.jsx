import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");

  useEffect(() => {
    const updatePlan = async () => {
      // Assuming user is authenticated and you have user ID
      const { data: { user } } = await supabase.auth.getUser();
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

export default SuccessPage;
