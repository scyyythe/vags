import React, { createContext, useContext, useState } from "react";

interface Artwork {
  id: string;
  artworkImage: string;
  title: string;
  artist: string;
  artistId?: string;
  size: string;
  style: string;
  medium: string;
  edition: string;
  yearCreated: number;
  price: number;
  originalPrice?: number;
  default_paypal_email?: string;
  quantity?: number;
  availableQuantity?: number;
}

interface PurchaseContextType {
  artwork: Artwork | null;
  setArtwork: (artwork: Artwork) => void;
  clearArtwork: () => void;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [artwork, setArtwork] = useState<Artwork | null>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem("purchase_artwork");
    return saved ? JSON.parse(saved) : null;
  });

  const setArtworkWithPersistence = (newArtwork: Artwork) => {
    setArtwork(newArtwork);
    // Save to localStorage
    localStorage.setItem("purchase_artwork", JSON.stringify(newArtwork));
  };

  const clearArtwork = () => {
    setArtwork(null);
    localStorage.removeItem("purchase_artwork");
  };

  return (
    <PurchaseContext.Provider value={{ artwork, setArtwork: setArtworkWithPersistence, clearArtwork }}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context) throw new Error("usePurchase must be used within PurchaseProvider");
  return context;
};
