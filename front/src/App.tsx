import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext } from "react";

import Index from "./pages/Index";
import FingerprintAuth from "./pages/FingerprintAuth";
import FingerprintRegister from "./pages/FingerprintRegister";
import NotFound from "./components/NotFound";
import Create from "./components/user_dashboard/CreatePost";
import Hero from "./pages/Hero";
import Explore from "./user_dashboard/Explore";
import Bidding from "./user_dashboard/Bidding";
import Marketplace from "./user_dashboard/Marketplace";
import Exhibits from "./user_dashboard/Exhibits";
import { ModalProvider } from './context/ModalContext';
import { DonationProvider } from "./context/DonationContext";
import TipJarPopup from "./components/user_dashboard/TipJarPopup";
import { useDonation } from "./context/DonationContext";
import { ArtworkProvider } from "./context/ArtworkContext";
import ArtworkDetails from "./components/user_dashboard/ArtworkDetails";

// Active heart state
export type LikedArtwork = {
  id: string;
  isLiked: boolean;
};

export const LikedArtworksContext = createContext<{
  likedArtworks: Record<string, boolean>;
  toggleLike: (id: string) => void;
}>({
  likedArtworks: {},
  toggleLike: () => {},
});

const DonationWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isPopupOpen, closePopup, currentArtwork } = useDonation();
  
  console.log("DonationWrapper - isPopupOpen:", isPopupOpen);
  console.log("DonationWrapper - currentArtwork:", currentArtwork);

return (
  <>
    {children}
    <TipJarPopup 
      isOpen={isPopupOpen} 
      onClose={closePopup} 
      artworkTitle={currentArtwork?.title}
      artworkImage={currentArtwork?.artworkImage}
      artistName={currentArtwork?.artistName}
    />
  </>
);
};

const queryClient = new QueryClient();

const App = () => {
  const [likedArtworks, setLikedArtworks] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLikedArtworks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <LikedArtworksContext.Provider value={{ likedArtworks, toggleLike }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DonationProvider>
            <DonationWrapper>
              <Toaster /> 
              <Sonner />
              <ModalProvider>
              <ArtworkProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/fingerprint-auth" element={<FingerprintAuth />} />
                    <Route path="/fingerprint-register" element={<FingerprintRegister />} />
                    <Route path="/hero" element={<Hero />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/artwork/:id" element={<ArtworkDetails />} />
                    <Route path="/bidding" element={<Bidding />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/exhibits" element={<Exhibits />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
                </ArtworkProvider>
              </ModalProvider>
            </DonationWrapper>
          </DonationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </LikedArtworksContext.Provider>
  );
};

export default App;
