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
// import MyAuctionsPage from "./pages/MyAuctionsPage";

//EXHIBITS
import AddExhibit from "./components/user_dashboard/Exhibit/add_exhibit/AddExhibit";
import ExhibitViewing from "./components/user_dashboard/Exhibit/exhibit_viewing/ViewExhibit";
import CollaboratorView from "./components/user_dashboard/Exhibit/add_exhibit/components/CollaboratorViews";
import ExhibitReview from "./components/user_dashboard/Exhibit/exhibit_review/ExhibitReview"; 

// ADMIN & MODERATOR
import { AuthProvider } from "./components/admin_&_moderator/context/AuthContext";
import { DashboardLayout } from "./components/admin_&_moderator/dashboard/DashboardLayout";
import { SidebarProvider } from "@/components/ui/sidebar";

// Admin Pages
import AdminDashboard from "./admin_&_moderator/admin/AdminDashboard";
import UserManagement from "./admin_&_moderator/admin/UserManagement";
import ArtworkManagement from "./admin_&_moderator/admin/ArtworkManagement";
import ExhibitionManagement from "./admin_&_moderator/admin/ExhibitionManagement";
import ExhibitionThemes from "./admin_&_moderator/admin/ExhibitionThemes";
import ExhibitionRooms from "./admin_&_moderator/admin/ExhibitionRooms";
import ExhibitionAnalytics from "./admin_&_moderator/admin/ExhibitionAnalytics";
import BidsTransactions from "./admin_&_moderator/admin/BidsTransaction";
import ModeratorOversight from "./admin_&_moderator/admin/ModeratorOversight";
import ReportsIssues from "./admin_&_moderator/admin/ReportsIssues";
import ContentModeration from "./admin_&_moderator/admin/ContentModeration";
import SystemSettings from "./admin_&_moderator/admin/SystemSettings";
import AnalyticsDashboard from "./admin_&_moderator/admin/AnalyticsDashboard";

// Moderator Pages
import ModeratorDashboard from "./admin_&_moderator/moderator/ModeratorDashboard";
import ArtworkReview from "./admin_&_moderator/moderator/ArtworkReview";
import BidReview from "./admin_&_moderator/moderator/BidReview";
import UserActivity from "./admin_&_moderator/moderator/UserActivity";
import ModeratorReportsIssues from "./admin_&_moderator/moderator/ReportsIssues";
import ModeratorContentModeration from "./admin_&_moderator/moderator/ContentModeration";
import ExhibitionSupport from "./admin_&_moderator/moderator/ExhibitionSupport";
import ActivityLogs from "./admin_&_moderator/moderator/ActivityLogs";

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
      <AuthProvider>
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
                        <Route path="/bid-winner" element={<BidWinnerPage />} />
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

                        {/* ADMIN Routes (WITH SidebarProvider) */}
                        <Route
                          path="/admin"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <AdminDashboard />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <UserManagement />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/artworks"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <ArtworkManagement />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/exhibitions"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <ExhibitionManagement />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/exhibitions/themes"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <ExhibitionThemes />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/exhibitions/rooms"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <ExhibitionRooms />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/exhibitions/analytics"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <ExhibitionAnalytics />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/bids"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <BidsTransactions />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/moderators"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <ModeratorOversight />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/reports"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <ReportsIssues />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/content"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <ContentModeration />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/settings"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <SystemSettings />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/admin/analytics"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="admin">
                                <AnalyticsDashboard />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />

                        {/* MODERATOR Routes (WITH SidebarProvider) */}
                        <Route
                          path="/moderator"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="moderator">
                                <ModeratorDashboard />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/moderator/artworks"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="moderator">
                                <ArtworkReview />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/moderator/bids"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="moderator">
                                <BidReview />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/moderator/users"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="moderator">
                                <UserActivity />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/moderator/reports"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="moderator">
                                <ModeratorReportsIssues />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/moderator/content"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="moderator">
                                <ModeratorContentModeration />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/moderator/exhibitions"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="moderator">
                                <ExhibitionSupport />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />
                        <Route
                          path="/moderator/logs"
                          element={
                            <SidebarProvider>
                              <DashboardLayout requiredRole="moderator">
                                <ActivityLogs />
                              </DashboardLayout>
                            </SidebarProvider>
                          }
                        />

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
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
