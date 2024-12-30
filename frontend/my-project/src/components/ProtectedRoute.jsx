import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LuLoader } from "react-icons/lu";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 animate-spin-slow">
          <LuLoader className="text-gray-50" size={24} />
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
