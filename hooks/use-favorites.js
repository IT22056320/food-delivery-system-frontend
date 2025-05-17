"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

// Create a context for favorites
const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
        setFavorites([]);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Check if an item is in favorites
  const isFavorite = useCallback(
    (itemType, itemId) => {
      return favorites.some(
        (fav) => fav.itemType === itemType && fav.itemId === itemId
      );
    },
    [favorites]
  );

  // Add an item to favorites
  const addToFavorites = useCallback((favoriteItem) => {
    setFavorites((prevFavorites) => {
      // Check if already exists
      if (
        prevFavorites.some(
          (fav) =>
            fav.itemType === favoriteItem.itemType &&
            fav.itemId === favoriteItem.itemId
        )
      ) {
        return prevFavorites;
      }

      // Add timestamp for sorting
      const itemWithTimestamp = {
        ...favoriteItem,
        addedAt: new Date().toISOString(),
      };

      return [...prevFavorites, itemWithTimestamp];
    });
  }, []);

  // Remove an item from favorites
  const removeFromFavorites = useCallback((itemType, itemId) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter(
        (fav) => !(fav.itemType === itemType && fav.itemId === itemId)
      )
    );
  }, []);

  // Get all favorites
  const getAllFavorites = useCallback(() => {
    return favorites;
  }, [favorites]);

  // Get favorites by type
  const getFavoritesByType = useCallback(
    (itemType) => {
      return favorites.filter((fav) => fav.itemType === itemType);
    },
    [favorites]
  );

  // Get count of favorites
  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  const value = {
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    getAllFavorites,
    getFavoritesByType,
    getFavoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
