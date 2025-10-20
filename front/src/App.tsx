import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./pages/Index";
import { LanguageProvider } from "@/context/LanguageContext";
import FingerprintAuth from "./pages/FingerprintAuth";
import FingerprintRegister from "./pages/FingerprintRegister";
import NotFound from "./components/NotFound";
import ErrorPage from "./components/Unauthorized";
import Create from "./components/user_dashboard/Explore/create_post/CreatePost";
import SellArt from "./components/user_dashboard/Marketplace/sell/SellArtwork";
import UpdatePost from "./components/user_dashboard/own_profile/UpdatePost";
import Hero from "./pages/Hero";
import Explore from "./user_dashboard/Explore";
import Auctions from "./user_dashboard/Bidding";
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
import PrivacySettings from "./components/user_dashboard/Settings/pages/PrivacySettings";
import NotificationsSettings from "./components/user_dashboard/Settings/pages/Notifications";
import BillingSettings from "./components/user_dashboard/Settings/pages/BillingSettings";
import HelpCenter from "./components/user_dashboard/Settings/pages/HelpCenter";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import AllNotifications from "./components/user_dashboard/local_components/notification/AllNotifications";
import FollowDemo from "./components/user_dashboard/own_profile/following_&_followers/owners/mock_data/FollowDemo";

//HIGHEST BID
import BidWinnerPage from "./components/user_dashboard/Bidding/highest_bid/pages/BidWinnerPage";
import PaymentPage from "@/components/user_dashboard/Bidding/highest_bid/pages/PaymentPage";

//EXHIBITS
import AddExhibit from "./components/user_dashboard/Exhibit/add_exhibit/AddExhibit";
import ExhibitViewing from "./components/user_dashboard/Exhibit/exhibit_viewing/ViewExhibit";
import CollaboratorView from "./components/user_dashboard/Exhibit/collaborator_view/CollaboratorView";
import ExhibitReview from "./components/user_dashboard/Exhibit/exhibit_review/ExhibitReview";

//MARKETPLACE
import ViewProduct from "@/components/user_dashboard/Marketplace/view_product/ViewProduct";
import TopSellers from "@/components/user_dashboard/Marketplace/top_seller/TopSellers";
import PreviewPage from "@/components/user_dashboard/Marketplace/buying_process/pages/PreviewPage";
import ShippingPage from "@/components/user_dashboard/Marketplace/buying_process/pages/ShippingPage";
import AddAddressPage from "@/components/user_dashboard/Marketplace/buying_process/pages/AddAddressPage";
import { AddressProvider } from "@/components/user_dashboard/Marketplace/buying_process/shipping_address/AddressContext";
import PaymentMethodPage from "@/components/user_dashboard/Marketplace/buying_process/pages/PaymentMethodPage";
import ReviewPurchase from "@/components/user_dashboard/Marketplace/buying_process/review/ReviewPurchase";
import { PurchaseProvider } from "./context/PurchaseContext";
//ADMIN & MODERATOR
import { AdminLayout } from "@/components/admin_&_moderator/layout/AdminLayout";
import AdminTermsWrapper from "@/components/admin_&_moderator/AdminTermsWrapper";

// Admin routes
import AdminDashboard from "@/components/admin_&_moderator/pages/admin/AdminDashboard";
import AdminUsers from "@/components/admin_&_moderator/pages/admin/AdminUsers";
import AdminConfig from "@/components/admin_&_moderator/pages/admin/AdminConfig";
import AdminSecurity from "@/components/admin_&_moderator/pages/admin/AdminSecurity";
import AdminAnalytics from "@/components/admin_&_moderator/pages/admin/AdminAnalytics";

// Moderator routes
import ModeratorDashboard from "@/components/admin_&_moderator/pages/moderator/ModeratorDashboard";
import ModeratorReports from "@/components/admin_&_moderator/pages/moderator/ModeratorReports";
import ModeratorContent from "@/components/admin_&_moderator/pages/moderator/ModeratorContent";
import ModeratorUsers from "@/components/admin_&_moderator/pages/moderator/ModeratorUsers";
import ModeratorNotifications from "@/components/admin_&_moderator/pages/moderator/ModeratorNotifications";

// Wishlist Context
import { WishlistProvider } from "@/components/user_dashboard/Marketplace/wishlist/WishlistContext";

import ProtectedRoute from "./auth/ProtectedRoute";

//Exhibit
import Gallery3D from "./components/gallery/Gallery3D";
import ViewInsightsPage from "@/components/user_dashboard/Exhibit/insights/ViewInsights";
import EditExhibit from "./components/user_dashboard/Exhibit/add_exhibit/EditExhibit";

import { ChatProvider } from "./context/ChatContext";
import Header from "./components/user_dashboard/navbar/Header";
import { useState, useEffect } from "react";
import UpdateArtwork from "./components/user_dashboard/Marketplace/sell/UpdateArtwork";
import apiClient from "./utils/apiClient";
import { toast } from "sonner";
const DonationWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isPopupOpen, closePopup, currentArtwork } = useDonation();
  const [artistAccounts, setArtistAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (!currentArtwork?.artistId) return;

    const fetchAccounts = async () => {
      try {
        const response = await apiClient.get(`/payment/accounts/artist/${currentArtwork.artistId}/`);
        setArtistAccounts(response.data);
      } catch (error) {
        console.error("Error fetching artist accounts:", error);
        toast.error("Failed to load artist payment accounts");
      }
    };

    fetchAccounts();
  }, [currentArtwork?.artistId]);

  const paypalEmail = artistAccounts.find((acc) => acc.type === "paypal")?.account_info || "";

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
        default_paypal_email={paypalEmail}
      />
    </>
  );
};

const queryClient = new QueryClient();

const Gallery3DWrapper = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slotMapRaw = queryParams.get("slotMap");
  const artworksRaw = queryParams.get("artworks");

  const slotArtworkMap: Record<number, string> = slotMapRaw ? JSON.parse(decodeURIComponent(slotMapRaw)) : {};
  const artworks = artworksRaw ? JSON.parse(decodeURIComponent(artworksRaw)) : [];

  return <Gallery3D slotArtworkMap={slotArtworkMap} artworks={artworks} />;
};
const AppContent = () => {
  const location = useLocation();
  const hideHeader =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/moderator") ||
    location.pathname.startsWith("/");

  return <>{!hideHeader && <Header />}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <WishlistProvider>
          <LikedArtworksProvider>
            <TooltipProvider>
              <DonationProvider>
                <DonationWrapper>
                  <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                    toastOptions={{
                      classNames: {
                        closeButton: "left-[95%] top-3 text-gray-500 hover:text-gray-700",
                      },
                    }}
                  />
                  <ModalProvider>
                    <ArtworkProvider>
                      <AddressProvider>
                        <PurchaseProvider>
                          <ChatProvider>
                            <BrowserRouter>
                              <AppContent />
                              <Routes>
                                <Route path="/" element={<Index />} />
                                <Route path="/bid/:id" element={<BidDetails />} />
                                <Route path="/fingerprint-auth" element={<FingerprintAuth />} />
                                <Route path="/fingerprint-register" element={<FingerprintRegister />} />
                                <Route path="/hero" element={<Hero />} />
                                {/* Gallery */}
                                <Route path="/gallery3d-preview" element={<Gallery3DWrapper />} />
                                {/* Bid */}
                                <Route path="/bid-winner/:id" element={<BidWinnerPage />} />
                                <Route path="/payment" element={<PaymentPage />} />
                                {/* Marketplace */}
                                <Route path="/viewproduct/:id" element={<ViewProduct />} />
                                <Route path="/topsellers" element={<TopSellers />} />
                                <Route path="/" element={<PreviewPage />} />
                                <Route path="/shipping" element={<ShippingPage />} />
                                <Route path="/add-address" element={<AddAddressPage isEditing={false} />} />
                                <Route path="/edit-address/:id" element={<AddAddressPage isEditing={true} />} />
                                <Route path="/payment-method" element={<PaymentMethodPage />} />
                                <Route
                                  path="/reviewpurchase/:orderId"
                                  element={<ReviewPurchase onBack={() => {}} onSubmit={() => {}} />}
                                />
                                {/* Exhibit */}
                                <Route path="/add-exhibit" element={<AddExhibit />} />
                                <Route path="/edit-exhibit/:id" element={<EditExhibit />} />
                                <Route path="/view-exhibit/:id" element={<ExhibitViewing />} />
                                <Route path="/collaborator/exhibit/:exhibitId" element={<CollaboratorView />} />
                                <Route path="/exhibitreview" element={<ExhibitReview />} />
                                <Route path="/follow-demo" element={<FollowDemo />} />
                                <Route path="/explore" element={<ProtectedRoute children={<Explore />} />} />
                                <Route path="/create" element={<ProtectedRoute children={<Create />} />} />
                                <Route path="/sell" element={<ProtectedRoute children={<SellArt />} />} />
                                <Route
                                  path="/sell-update/:id"
                                  element={<ProtectedRoute children={<UpdateArtwork />} />}
                                />
                                <Route path="/update/:id" element={<ProtectedRoute children={<UpdatePost />} />} />
                                <Route
                                  path="/userprofile/:id"
                                  element={<ProtectedRoute children={<UserProfile />} />}
                                />
                                <Route path="/artwork/:id" element={<ProtectedRoute children={<ArtworkDetails />} />} />
                                <Route path="/auctions" element={<ProtectedRoute children={<Auctions />} />} />
                                <Route path="/marketplace" element={<ProtectedRoute children={<Marketplace />} />} />
                                <Route path="/exhibits" element={<ProtectedRoute children={<Exhibits />} />} />
                                <Route path="/all-notifications" element={<AllNotifications />} />
                                <Route path="/settings" element={<ProtectedRoute children={<Settings />} />}>
                                  <Route path="edit-profile" element={<ProtectedRoute children={<EditProfile />} />} />
                                  <Route
                                    path="account-details"
                                    element={<ProtectedRoute children={<AccountDetails />} />}
                                  />
                                  <Route path="security" element={<ProtectedRoute children={<SecuritySettings />} />} />
                                  <Route path="privacy" element={<ProtectedRoute children={<PrivacySettings />} />} />
                                  <Route
                                    path="notifications"
                                    element={<ProtectedRoute children={<NotificationsSettings />} />}
                                  />
                                  <Route path="billing" element={<ProtectedRoute children={<BillingSettings />} />} />
                                  <Route path="help-center" element={<ProtectedRoute children={<HelpCenter />} />} />
                                </Route>
                                <Route path="/view-insights/:id" element={<ViewInsightsPage />} />

                                {/* Admin Routes */}
                                <Route
                                  path="/admin"
                                  element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                      <AdminTermsWrapper role="admin">
                                        <AdminLayout role="admin">
                                          <AdminDashboard />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/admin/users"
                                  element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                      <AdminTermsWrapper role="admin">
                                        <AdminLayout role="admin">
                                          <AdminUsers />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/admin/config"
                                  element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                      <AdminTermsWrapper role="admin">
                                        <AdminLayout role="admin">
                                          <AdminConfig />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/admin/security"
                                  element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                      <AdminTermsWrapper role="admin">
                                        <AdminLayout role="admin">
                                          <AdminSecurity />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/admin/analytics"
                                  element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                      <AdminTermsWrapper role="admin">
                                        <AdminLayout role="admin">
                                          <AdminAnalytics />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />
                                {/* Moderator Routes */}
                                <Route
                                  path="/moderator"
                                  element={
                                    <ProtectedRoute allowedRoles={["moderator"]}>
                                      <AdminTermsWrapper role="moderator">
                                        <AdminLayout role="moderator">
                                          <ModeratorDashboard />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />

                                <Route
                                  path="/moderator/reports"
                                  element={
                                    <ProtectedRoute allowedRoles={["moderator"]}>
                                      <AdminTermsWrapper role="moderator">
                                        <AdminLayout role="moderator">
                                          <ModeratorReports />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />

                                <Route
                                  path="/moderator/content"
                                  element={
                                    <ProtectedRoute allowedRoles={["moderator"]}>
                                      <AdminTermsWrapper role="moderator">
                                        <AdminLayout role="moderator">
                                          <ModeratorContent />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />

                                <Route
                                  path="/moderator/users"
                                  element={
                                    <ProtectedRoute allowedRoles={["moderator"]}>
                                      <AdminTermsWrapper role="moderator">
                                        <AdminLayout role="moderator">
                                          <ModeratorUsers />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />

                                <Route
                                  path="/moderator/notifications"
                                  element={
                                    <ProtectedRoute allowedRoles={["moderator"]}>
                                      <AdminTermsWrapper role="moderator">
                                        <AdminLayout role="moderator">
                                          <ModeratorNotifications />
                                        </AdminLayout>
                                      </AdminTermsWrapper>
                                    </ProtectedRoute>
                                  }
                                />

                                {/* Not Found */}
                                <Route path="*" element={<NotFound />} />
                                {/* Unauthorized */}
                                <Route path="/unauthorized" element={<ErrorPage />} />
                              </Routes>
                            </BrowserRouter>
                          </ChatProvider>
                        </PurchaseProvider>
                      </AddressProvider>
                    </ArtworkProvider>
                  </ModalProvider>
                </DonationWrapper>
              </DonationProvider>
            </TooltipProvider>
          </LikedArtworksProvider>
        </WishlistProvider>
      </LanguageProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default App;
