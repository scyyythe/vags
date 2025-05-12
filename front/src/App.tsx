import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./pages/Index";
import FingerprintAuth from "./pages/FingerprintAuth";
import FingerprintRegister from "./pages/FingerprintRegister";
import NotFound from "./components/NotFound";
import Create from "./components/user_dashboard/Explore/create_post/CreatePost";
import UpdatePost from "./components/user_dashboard/own_profile/UpdatePost";
import Hero from "./pages/Hero";
import Explore from "./user_dashboard/Explore";
import Bidding from "./user_dashboard/Bidding";
import Marketplace from "./user_dashboard/Marketplace";
import Exhibits from "./user_dashboard/Exhibits";
import { ModalProvider } from "./context/ModalContext";
import { DonationProvider } from "./context/DonationContext";
import TipJarPopup from "./components/user_dashboard/Explore/tip_jar/TipJarPopup";
import { useDonation } from "./context/DonationContext";
import { ArtworkProvider } from "./context/ArtworkContext";
import ArtworkDetails from "./components/user_dashboard/Explore/art_viewing/ArtworkDetails";
import BidDetails from "./components/user_dashboard/Bidding/bid_viewing/BidDetails";
import UserProfile from "./components/user_dashboard/user_profile/UserProfile";
import { LikedArtworksProvider } from "@/context/LikedArtworksProvider";

import Settings from "./components/user_dashboard/Settings/pages/Settings";
import EditProfile from "./components/user_dashboard/Settings/pages/EditProfile";
import AccountDetails from "./components/user_dashboard/Settings/pages/AccountDetails";
import SecuritySettings from "./components/user_dashboard/Settings/pages/Security";
import NotificationsSettings from "./components/user_dashboard/Settings/pages/Notifications";
import BillingSettings from "./components/user_dashboard/Settings/pages/BillingSettings";
import HelpCenter from "./components/user_dashboard/Settings/pages/HelpCenter";

import AllNotifications from "./components/user_dashboard/notification/AllNotifications";

import ProtectedRoute from "./auth/ProtectedRoute";
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
  return (
    <QueryClientProvider client={queryClient}>
      <LikedArtworksProvider>
        <TooltipProvider>
          <DonationProvider>
            <DonationWrapper>
              <Toaster position="bottom-right" richColors />
              <ModalProvider>
                <ArtworkProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/bid/:id" element={<BidDetails />} />
                      <Route path="/fingerprint-auth" element={<FingerprintAuth />} />
                      <Route path="/fingerprint-register" element={<FingerprintRegister />} />
                      <Route path="/hero" element={<Hero />} />

                      <Route path="/explore" element={<ProtectedRoute children={<Explore />} />} />
                      <Route path="/create" element={<ProtectedRoute children={<Create />} />} />
                      <Route path="/update/:id" element={<ProtectedRoute children={<UpdatePost />} />} />
                      <Route path="/userprofile/:id" element={<ProtectedRoute children={<UserProfile />} />} />
                      <Route path="/artwork/:id" element={<ProtectedRoute children={<ArtworkDetails />} />} />
                      <Route path="/bidding" element={<ProtectedRoute children={<Bidding />} />} />
                      <Route path="/marketplace" element={<ProtectedRoute children={<Marketplace />} />} />
                      <Route path="/exhibits" element={<ProtectedRoute children={<Exhibits />} />} />

                      <Route path="/all-notifications" element={<AllNotifications />} />

                      <Route path="/settings" element={<ProtectedRoute children={<Settings />} />}>
                        <Route path="edit-profile" element={<ProtectedRoute children={<EditProfile />} />} />
                        <Route path="account-details" element={<ProtectedRoute children={<AccountDetails />} />} />
                        <Route path="security" element={<ProtectedRoute children={<SecuritySettings />} />} />
                        <Route path="notifications" element={<ProtectedRoute children={<NotificationsSettings />} />} />
                        <Route path="billing" element={<ProtectedRoute children={<BillingSettings />} />} />
                        <Route path="help-center" element={<ProtectedRoute children={<HelpCenter />} />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </ArtworkProvider>
              </ModalProvider>
            </DonationWrapper>
          </DonationProvider>
        </TooltipProvider>
      </LikedArtworksProvider>
    </QueryClientProvider>
  );
};

export default App;
