// src/context/PurchaseContext.tsx
import React, { createContext, useContext, useState } from "react";

export interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  [key: string]: any;
}

export interface PaymentMethod {
  type: string;
  details: string;
}

export interface Artwork {
  artworkImage: string;
  title: string;
  artist: string;
  size: string;
  style: string;
  medium: string;
  edition: string;
  yearCreated: number;
  price: number;
}

interface PurchaseContextType {
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (payment: PaymentMethod | null) => void;
  selectedArtwork: Artwork | null;
  setSelectedArtwork: (artwork: Artwork | null) => void;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  return (
    <PurchaseContext.Provider
      value={{
        selectedAddress,
        setSelectedAddress,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        selectedArtwork,
        setSelectedArtwork,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = (): PurchaseContextType => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error("usePurchase must be used within a PurchaseProvider");
  }
  return context;
};
