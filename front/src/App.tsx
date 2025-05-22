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
import FollowDemo from "./components/user_dashboard/own_profile/following_&_followers/owners/mock_data/FollowDemo";

//HIGHEST BID
import BidWinnerPage from "./components/user_dashboard/Bidding/highest_bid/pages/BidWinnerPage";
import PaymentPage from "@/components/user_dashboard/Bidding/highest_bid/pages/PaymentPage";

//EXHIBITS
import AddExhibit from "./components/user_dashboard/Exhibit/add_exhibit/AddExhibit";
import ExhibitViewing from "./components/user_dashboard/Exhibit/exhibit_viewing/ViewExhibit";
import CollaboratorView from "./components/user_dashboard/Exhibit/add_exhibit/components/CollaboratorViews";
import ExhibitReview from "./components/user_dashboard/Exhibit/exhibit_review/ExhibitReview";

import ProtectedRoute from "./auth/ProtectedRoute";

const DonationWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isPopupOpen, closePopup, currentArtwork } = useDonation();

  return (
    <>
      {children}
      <TipJarPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        artworkTitle={currentArtwork?.title}
        artworkImage={currentArtwork?.artworkImage}
        artistId={currentArtwork?.artistId}
        artistName={currentArtwork?.artistName}
        artId={currentArtwork?.id}
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
                        {/* Public & User Dashboard Routes (NO SidebarProvider) */}
                        <Route path="/" element={<Index />} />
                        <Route path="/bid/:id" element={<BidDetails />} />
                        <Route path="/fingerprint-auth" element={<FingerprintAuth />} />
                        <Route path="/fingerprint-register" element={<FingerprintRegister />} />
                        <Route path="/hero" element={<Hero />} />

                        {/* Bid */}
                        <Route path="/bid-winner/:id" element={<BidWinnerPage />} />
                        <Route path="/payment" element={<PaymentPage />} />

                        {/* Exhibit */}
                        <Route path="/add-exhibit" element={<AddExhibit />} />
                        <Route path="/view-exhibit/:id" element={<ExhibitViewing />} />
                        <Route path="/collaborator/exhibit/:exhibitId" element={<CollaboratorView />} />
                        <Route path="/exhibitreview" element={<ExhibitReview />} />

                        <Route path="/follow-demo" element={<FollowDemo />} />

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
                          <Route
                            path="notifications"
                            element={<ProtectedRoute children={<NotificationsSettings />} />}
                          />
                          <Route path="billing" element={<ProtectedRoute children={<BillingSettings />} />} />
                          <Route path="help-center" element={<ProtectedRoute children={<HelpCenter />} />} />
                        </Route>

                        
                        {/* Not Found */}
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
