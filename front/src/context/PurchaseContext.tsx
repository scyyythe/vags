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
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [artwork, setArtwork] = useState<Artwork | null>(null);

  return <PurchaseContext.Provider value={{ artwork, setArtwork }}>{children}</PurchaseContext.Provider>;
};

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context) throw new Error("usePurchase must be used within PurchaseProvider");
  return context;
};
