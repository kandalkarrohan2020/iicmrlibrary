// src/components/ErrorPage.jsx
import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaLongArrowAltLeft } from "react-icons/fa";

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-gray-800">
      <div className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 mb-6">
        404
      </div>
      <h1 className="text-3xl font-semibold mb-2">Page Not Found</h1>
      <p className="mb-6 text-center">
        Sorry, we couldn’t find <code>{location.pathname}</code>
      </p>

      <div className="flex space-x-6">
        <button
        onClick={handleGoBack}
        className="flex items-center justify-center gap-2 font-medium px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        <FaLongArrowAltLeft className="w-5 h-5"/> Go Back
      </button>
      <Link
        to="/dashboard"
        className="flex items-center justify-center font-medium gap-2 space-x-4 px-6 py-2 bg-[#0BB501] text-white rounded hover:bg-[#38c116] transition"
      >
       Dashboard
      </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
