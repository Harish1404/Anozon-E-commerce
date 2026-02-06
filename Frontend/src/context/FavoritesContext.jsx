import { createContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchFavorites, toggleFavorite } from "../services/favorites";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {

  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState(null);
  const { isAuth } = useAuth();

  // Load favorites from backend when user authenticates
  useEffect(() => {
    if (isAuth) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuth]);

  // Load favorites from backend
  const loadFavorites = useCallback(async () => {

    try {
      setFavoritesLoading(true);
      setFavoritesError(null);
      const favData = await fetchFavorites();
      setFavorites(favData || []);

    } catch (error) {
      console.error("Failed to load favorites:", error);
      setFavoritesError(error.message);

    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  // Toggle favorite status for a product
  const toggleFav = useCallback(

    async (productId) => {
        
      if (!isAuth) {
        setFavoritesError("Please login to add favorites");
        return;
      }

      try {
        setFavoritesError(null);
        const result = await toggleFavorite(productId);
        // Reload favorites after toggle
        await loadFavorites();
        return result;

      } catch (error) {
        console.error("Failed to toggle favorite:", error);
        setFavoritesError(error.message);
      }

    },
    [isAuth, loadFavorites]
  );

  // Check if product is favorited
  const isFavorited = useCallback(
    (productId) => {
      return favorites.includes(productId);
    },
    [favorites]
  );

  // Get count of favorites
  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  const value = {
    favorites,
    favoritesLoading,
    favoritesError,
    toggleFav,
    isFavorited,
    loadFavorites,
    getFavoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
