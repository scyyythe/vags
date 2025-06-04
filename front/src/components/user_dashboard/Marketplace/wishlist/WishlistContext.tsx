import React, { createContext, useContext, useState, ReactNode } from "react";

interface WishlistContextType {
  likedItems: Set<string>;
  toggleWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const toggleWishlist = (id: string) => {
    setLikedItems(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const removeFromWishlist = (id: string) => {
    setLikedItems(prev => {
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });
  };

  return (
    <WishlistContext.Provider value={{ likedItems, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
