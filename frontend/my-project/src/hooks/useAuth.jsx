import { useContext, createContext, useState, useEffect } from "react";
import dotenv from "dotenv";
dotenv.config();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "GET",
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user); // Update the user state with the fetched data
      } else {
        setUser(null); // Clear user state if unauthorized
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user on app initialization
  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null); // Clear user state
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
