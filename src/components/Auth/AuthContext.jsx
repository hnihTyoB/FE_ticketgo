import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "@/utils/axiosInterceptor";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          if (response.data.token) {
            setToken(response.data.token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
          }
        }
      } catch (error) {
        console.log("No active session or session expired");
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const refreshPendingOrdersCount = async () => {
    if (!user) {
      setPendingOrdersCount(0);
      return;
    }
    try {
      const response = await axios.get("/api/orders/pending-tickets-count");
      setPendingOrdersCount(response.data.totalTickets || 0);
    } catch (error) {
      console.error("Failed to fetch pending orders count:", error);
      setPendingOrdersCount(0);
    }
  };

  useEffect(() => {
    refreshPendingOrdersCount();
  }, [user, token]);

  const login = (userOrToken, optionalToken) => {
    if (typeof userOrToken === "string") {
      // Hỗ trợ cách gọi cũ: login(token)
      try {
        const decodedUser = jwtDecode(userOrToken);
        setUser(decodedUser);
        setToken(userOrToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${userOrToken}`;
      } catch (error) {
        console.error("Failed to decode token in login:", error);
      }
    } else {
      // Hỗ trợ cách gọi mới: login(user, token)
      setUser(userOrToken);
      if (optionalToken) {
        setToken(optionalToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${optionalToken}`;
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common["Authorization"];
      setPendingOrdersCount(0);

      window.location.href = "/";
    }
  };

  const updateUser = (userOrToken, optionalToken) => {
    if (typeof userOrToken === "string") {
      // Hỗ trợ cách gọi cũ: updateUser(token)
      try {
        const decodedUser = jwtDecode(userOrToken);
        setUser(decodedUser);
        setToken(userOrToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${userOrToken}`;
      } catch (error) {
        console.error("Invalid token in updateUser:", error);
      }
    } else {
      // Hỗ trợ cách gọi mới: updateUser(user, token)
      setUser(userOrToken);
      if (optionalToken) {
        setToken(optionalToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${optionalToken}`;
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    isLoggedIn: !!user,
    login,
    logout,
    updateUser,
    pendingOrdersCount,
    refreshPendingOrdersCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
