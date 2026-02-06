import { apiRequest } from "./auth";

const CART_ENDPOINT = "/users/cart";

// Fetch current user's cart
export const fetchCart = async () => {
  try {
    const response = await apiRequest(CART_ENDPOINT, {
      method: "GET",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch cart");
    }

    return response.json();
  } catch (error) {
    console.error("Fetch cart error:", error);
    throw error;
  }
};

// Add an item to cart (or increase quantity if already exists)
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await apiRequest(CART_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to add item to cart");
    }

    return response.json();
  } catch (error) {
    console.error("Add to cart error:", error);
    throw error;
  }
};

// Remove a specific item from cart
export const removeFromCart = async (productId) => {
  try {
    const response = await apiRequest(`${CART_ENDPOINT}/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to remove item from cart");
    }

    return response.json();
  } catch (error) {
    console.error("Remove from cart error:", error);
    throw error;
  }
};

// Clear the entire cart
export const clearCart = async () => {
  try {
    const response = await apiRequest(CART_ENDPOINT, {
      method: "DELETE",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to clear cart");
    }

    return response.json();
  } catch (error) {
    console.error("Clear cart error:", error);
    throw error;
  }
};

export default {
  fetchCart,
  addToCart,
  removeFromCart,
  clearCart,
};

