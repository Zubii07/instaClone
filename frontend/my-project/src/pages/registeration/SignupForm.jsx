import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../src/style/SignupForm.module.css";
import { useToast } from "../../hooks/useToast";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.user) {
        showToast({
          title: "Signup Successfully",
          description: "Welcome to Instagram!",
          duration: 4000,
        });
        navigate("/");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
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
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className={`${styles.inputField} w-full mb-4 px-4 py-2 border rounded-lg`}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className={`${styles.inputField} w-full mb-4 px-4 py-2 border rounded-lg`}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className={`${styles.inputField} w-full mb-6 px-4 py-2 border rounded-lg`}
          />
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}
          <button
            type="submit"
            className={`${styles.signupButton} w-full py-2 text-white font-bold rounded-lg`}
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <a href="/" className="text-blue-500 font-bold">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
