import { createContext, useState, useContext, ReactNode } from "react";

interface DonationContextProps {
  isPopupOpen: boolean;
  openPopup: (artworkInfo: ArtworkInfo) => void;
  closePopup: () => void;
  currentArtwork: ArtworkInfo | null;
}

interface ArtworkInfo {
  id: string;
  title?: string;
  artistName: string;
  artworkImage: string;
}

const DonationContext = createContext<DonationContextProps>({
  isPopupOpen: false,
  openPopup: () => {},
  closePopup: () => {},
  currentArtwork: null,
});

export const useDonation = () => useContext(DonationContext);

interface DonationProviderProps {
  children: ReactNode;
}

export const DonationProvider = ({ children }: DonationProviderProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentArtwork, setCurrentArtwork] = useState<ArtworkInfo | null>(null);

  const openPopup = (artworkInfo: ArtworkInfo) => {
    console.log("Opening popup with artwork info:", artworkInfo);
    setCurrentArtwork(artworkInfo);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    console.log("Closing popup");
    setIsPopupOpen(false);
  };

  return (
    <DonationContext.Provider
      value={{
        isPopupOpen,
        openPopup,
        closePopup,
        currentArtwork,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};