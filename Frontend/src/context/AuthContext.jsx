import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  signup as signupAPI,
  login as loginAPI,
  logout as logoutAPI,
  refreshAccessToken,
  isAuthenticated,
  getUserFromToken,
  getCurrentUser,
  tokenManager,
} from "../services/auth";

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  // Initialize auth state from token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isAuthenticated()) {
          setIsAuth(true);
          // Try to fetch current user info from API
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // Fallback to token payload
            const tokenUser = getUserFromToken();
            setUser(tokenUser);
          }
          } else if(tokenManager.getRefreshToken()){
              await refreshToken();   // call refresh
              setIsAuth(true);
              const userData = await getCurrentUser();
              setUser(userData || getUserFromToken());
        } else {
          setIsAuth(false);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setIsAuth(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Signup function
  const signup = useCallback(async (username, email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      return await signupAPI(username, email, password);
    } catch (err) {
      const errorMsg = err.message || "Signup failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await loginAPI(email, password);

      // Update auth state
      setIsAuth(true);
      const tokenUser = getUserFromToken();
      setUser(tokenUser);

      return response;
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      setError(errorMsg);
      setIsAuth(false);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await logoutAPI();

      // Clear auth state
      setIsAuth(false);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear state even if logout API fails
      setIsAuth(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const response = await refreshAccessToken();
      const tokenUser = getUserFromToken();
      setUser(tokenUser);
      setIsAuth(true);
      return response;
    } catch (err) {
      console.error("Token refresh error:", err);
      setIsAuth(false);
      setUser(null);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update user
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Check if user has valid token
  const hasValidToken = useCallback(() => {
    return isAuthenticated();
  }, []);

  // Get access token
  const getAccessToken = useCallback(() => {
    return tokenManager.getAccessToken();
  }, []);


  // Check if user is admin by decoding role from token
  const isAdmin = useCallback(() => {
    const role = tokenManager.getRoleFromToken();
    if (!role) return false;
    // If role is an array or space/comma-separated string, handle accordingly
    if (Array.isArray(role)) return role.includes("admin");
    if (typeof role === "string") {
      return role === "admin" || role.split(/[ ,]+/).includes("admin");
    }
    return false;
  }, []);

  // Context value
  const value = {
    user,
    isAuth,
    isLoading,
    error,
    // expose helper
    isAdmin,
    signup,
    login,
    logout,
    refreshToken,
    clearError,
    updateUser,
    hasValidToken,
    getAccessToken,
    tokenManager,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthContext;
