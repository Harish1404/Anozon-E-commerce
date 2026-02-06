import { createContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchCart, addToCart, removeFromCart } from "../services/cart";
import { enrichCartItems } from "../services/products";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const { isAuth } = useAuth();

  // Load cart from backend when user authenticates
  useEffect(() => {
    if (isAuth) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [isAuth]);

  // Load cart from backend and enrich with product details
  const loadCart = useCallback(async () => {

    try {
      setCartLoading(true);
      setCartError(null);
      const cartData = await fetchCart();
      // Enrich cart items with product details
      const enrichedCart = await enrichCartItems(cartData || []);
      setCart(enrichedCart);

    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartError(error.message);

    } finally {
      setCartLoading(false);
    }
  }, []);

  // Add product to cart
  const addCart = useCallback(
    async (product, quantity = 1) => {
      if (!isAuth) {
        setCartError("Please login to add items to cart");
        return;
      }

      try {
        setCartError(null);
        await addToCart(product._id || product.id, quantity);
        // Reload cart after adding
        await loadCart();
      } catch (error) {
        console.error("Failed to add to cart:", error);
        setCartError(error.message);
      }
    },
    [isAuth, loadCart]
  );

  // Remove product from cart
  const removeCart = useCallback(
    async (productId) => {
      if (!isAuth) {
        setCartError("Please login to remove items from cart");
        return;
      }

      try {
        setCartError(null);
        await removeFromCart(productId);
        // Reload cart after removing
        await loadCart();
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        setCartError(error.message);
      }
    },
    [isAuth, loadCart]
  );

  // Calculate cart total
  const calculateTotal = useCallback(() => {

    return cart.reduce((total, item) => {

      const itemPrice = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + itemPrice * quantity;
    }, 0);

  }, [cart]);

  // Get cart count
  const getCartCount = useCallback(() => {

    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
    
  }, [cart]);

  const value = {
    cart,
    cartLoading,
    cartError,
    addCart,
    removeCart,
    loadCart,
    calculateTotal,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};