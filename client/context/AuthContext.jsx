import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Set axios Authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check-auth");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setToken(null);
        setAuthUser(null);
      }
      console.error("Auth check failed:", error.message);
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        setToken(data.token);
        setAuthUser(data.userData);
        connectSocket(data.userData);
        toast.success(data.message);
        // No need to manually set axios header or localStorage here; handled by useEffect
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("Email already registered. Please login instead.");
      } else {
        toast.error(error.response?.data?.message || "Signup failed");
      }
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    toast.success("Logged out successfully");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const connectSocket = (userData) => {
    if (!userData || socket) return; // prevent multiple connections

    const newSocket = io(backendUrl, {
      // use backendUrl instead of hardcoded localhost
      path: "/socket.io",
      transports: ["websocket"],
      auth: {
        token: token,
      },
      query: {
        userId: userData._id,
      },
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection failed:", err.message);
    });

    setSocket(newSocket);
  };

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token]);

  useEffect(() => {
    if (authUser && !socket) {
      connectSocket(authUser);
    }
  }, [authUser]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    token,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
