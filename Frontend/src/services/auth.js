const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ACCESS_TOKEN_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || "access_token";
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_STORAGE_KEY || "refresh_token";

// Token management utilities
const tokenManager = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};

// Signup
export const signup = async (username, email, password) => {
  try {
    const signupUrl = import.meta.env.VITE_AUTH_SIGNUP || "/auth/signup";
    const response = await fetch(`${API_BASE_URL}${signupUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Signup failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

// Login
export const login = async (email, password) => {
  try {
    const loginUrl = import.meta.env.VITE_AUTH_LOGIN || "/auth/login";
    const formData = new FormData();
    formData.append("username", email); // Backend expects 'username' field for email
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}${loginUrl}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    tokenManager.setTokens(data.access_token, data.refresh_token);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Refresh access token
export const refreshAccessToken = async () => {
  try {
    const refreshUrl = import.meta.env.VITE_AUTH_REFRESH || "/auth/refresh";
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await fetch(`${API_BASE_URL}${refreshUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      tokenManager.clearTokens();
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    tokenManager.setTokens(data.access_token, data.refresh_token);
    return data;
  } catch (error) {
    console.error("Token refresh error:", error);
    tokenManager.clearTokens();
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    const logoutUrl = import.meta.env.VITE_AUTH_LOGOUT || "/auth/logout";
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) {
      tokenManager.clearTokens();
      return;
    }

    await fetch(`${API_BASE_URL}${logoutUrl}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    tokenManager.clearTokens();
  }
};

// Get authenticated headers
export const getAuthHeaders = () => {
  const accessToken = tokenManager.getAccessToken();
  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };
};

// API request with automatic token refresh
export const apiRequest = async (url, options = {}) => {
  let accessToken = tokenManager.getAccessToken();

  // Check if token is expired and refresh if needed
  if (accessToken && tokenManager.isTokenExpired(accessToken)) {
    try {
      await refreshAccessToken();
      accessToken = tokenManager.getAccessToken();
    } catch {
      tokenManager.clearTokens();
      window.location.href = "/login"; // Redirect to login
      throw new Error("Session expired. Please login again.");
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    tokenManager.clearTokens();
    window.location.href = "/login";
    throw new Error("Unauthorized. Please login again.");
  }

  return response;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const accessToken = tokenManager.getAccessToken();
  return accessToken && !tokenManager.isTokenExpired(accessToken);
};

// Get user info from token (JWT payload)
export const getUserFromToken = () => {
  const accessToken = tokenManager.getAccessToken();
  if (!accessToken) return null;

  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    return {
      email: payload.sub,
      exp: new Date(payload.exp * 1000),
    };
  } catch {
    return null;
  }
};

// Get current authenticated user from API
export const getCurrentUser = async () => {
  try {
    const meUrl = import.meta.env.VITE_AUTH_ME || "/secure/me";
    const response = await apiRequest(meUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }

    return await response.json();
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

// Export token manager for direct access if needed
export { tokenManager };
