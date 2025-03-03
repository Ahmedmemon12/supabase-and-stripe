import { useNavigate } from "react-router-dom";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100 text-center">
      <h1 className="text-3xl font-bold text-red-700">Payment Canceled ❌</h1>
      <p className="text-lg text-gray-700 mt-2">
        Your payment was not completed. You can try again or return to the homepage.
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

export default CancelPage;
