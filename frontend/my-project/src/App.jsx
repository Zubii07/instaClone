import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./pages/registeration/LoginForm";
import SignupForm from "./pages/registeration/SignupForm";
import HomePage from "./pages/home/homePage";
import Profile from "./pages/profile/Profile";
import { AuthProvider } from "./hooks/useAuth"; // Corrected import path
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./hooks/useToast";
import Notifications from "./pages/notification/notifications.jsx";

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
