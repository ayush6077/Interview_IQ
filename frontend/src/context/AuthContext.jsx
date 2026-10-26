import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const saveAuth = useCallback((newToken, userData) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData || {}));
      setToken(newToken);
      setUser(userData);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const { token: newToken, user: userData } = res.data.data;
      saveAuth(newToken, userData);
      toast.success(`Welcome back, ${userData?.name || "there"}!`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", { name, email, password });
      const { token: newToken, user: userData } = res.data.data;
      saveAuth(newToken, userData);
      toast.success("Account created successfully!");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const logout = useCallback(() => {
    saveAuth(null, null);
    toast.success("Logged out successfully");
    window.location.href = "/login";
  }, [saveAuth]);

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await axios.put("/api/auth/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data.data?.user || res.data.data || res.data;
      setUser((prev) => ({ ...prev, ...updated }));
      localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
      toast.success("Profile updated!");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Update failed.";
      toast.error(message);
      return { success: false, message };
    }
  }, [token, user]);

  // Auto-logout if token is expired
  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        logout();
      }
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
