import { apiRequest } from "./auth";

const FAVORITES_ENDPOINT = "/users/favorites";

// Fetch user's favorite product IDs
export const fetchFavorites = async () => {

  try {
    const response = await apiRequest(FAVORITES_ENDPOINT, {
      method: "GET",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch favorites");
    }

    return response.json();
  } catch (error) {
    console.error("Fetch favorites error:", error);
    throw error;
  }
};

// Toggle favorite status (add/remove)
export const toggleFavorite = async (productId) => {
    
  try {
    const response = await apiRequest(`${FAVORITES_ENDPOINT}/toggle`, {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to toggle favorite");
    }

    return response.json();
  } catch (error) {
    console.error("Toggle favorite error:", error);
    throw error;
  }
};

export default {
  fetchFavorites,
  toggleFavorite,
};
