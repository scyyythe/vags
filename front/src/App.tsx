import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext } from "react";

import Index from "./pages/Index";
import FingerprintAuth from "./pages/FingerprintAuth";
import NotFound from "./components/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hero from "./pages/Hero";
import Explore from "./user_dashboard/Explore";
import Bidding from "./user_dashboard/Bidding";
import Marketplace from "./user_dashboard/Marketplace";
import Exhibits from "./user_dashboard/Exhibits";
import { ModalProvider } from './pages/ModalContext';

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
          <Toaster />
          <Sonner />
          <ModalProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/fingerprint-auth" element={<FingerprintAuth />} />
                <Route path="/hero" element={<Hero />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/bidding" element={<Bidding />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/exhibits" element={<Exhibits />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ModalProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </LikedArtworksContext.Provider>
  );
};

export default App;
