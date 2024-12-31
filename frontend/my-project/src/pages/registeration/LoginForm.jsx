import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./../../../src/style/LoginForm.module.css";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import dotenv from "dotenv";
dotenv.config();

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/home"); // Redirect to /home if user exists
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await response.json();
      if (data.user) {
        showToast({
          title: "Login Successfully",
          description: "Welcome back!",
          duration: 4000,
        });
        login(data.user); // Update user state in AuthContext
        navigate("/home"); // Redirect to home page
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (error) {
      setError("Something went wrong during login.");
    }
  };

  return (
    <div
      className={`${styles.container} flex items-center justify-center h-screen bg-gray-50`}
    >
      <div className="bg-white p-8 shadow-md rounded-lg w-96">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Instagram
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className={`${styles.inputField} w-full mb-4 px-4 py-2 border rounded-lg`}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className={`${styles.inputField} w-full mb-6 px-4 py-2 border rounded-lg`}
            required
          />
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}
          <button
            type="submit"
            className={`${styles.loginButton} w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg`}
          >
            Log In
          </button>
        </form>
        <div className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 font-bold">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
