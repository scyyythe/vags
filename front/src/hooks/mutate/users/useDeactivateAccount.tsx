import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

interface DeactivateAccountData {
  user_status: string;
  deactivated_at?: string;
}

const deactivateAccount = async (userId: string, data: DeactivateAccountData) => {
  const response = await apiClient.patch(`/users/${userId}/deactivate/`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

const useDeactivateAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: DeactivateAccountData }) => deactivateAccount(userId, data),
    onSuccess: (data, variables) => {
      if (variables.data.user_status === "deactivated") {
        toast.success("Your account has been deactivated successfully.", { closeButton: true });

        // Clear all tokens and user data from localStorage
        localStorage.clear();

        // Navigate to home page
        navigate("/");

        // Show login modal
        setShowLoginModal(true);
      } else {
        // Invalidate all user and related queries for real-time updates
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) &&
              (queryKey.includes("user") ||
                queryKey.includes("userDetails") ||
                queryKey.includes("users") ||
                queryKey.includes("artworks") ||
                queryKey.includes("artwork") ||
                queryKey.includes("artwork-cards") ||
                queryKey.includes("marketplace-art-cards") ||
                queryKey.includes("my-sell-art-cards") ||
                queryKey.includes("user-sell-art-cards") ||
                queryKey.includes("trending-artworks") ||
                queryKey.includes("trendingArtworks") ||
                queryKey.includes("popular-artworks") ||
                queryKey.includes("popularArtworks") ||
                queryKey.includes("popular-artworks-light") ||
                queryKey.includes("followedArtworks") ||
                queryKey.includes("followed-artworks") ||
                queryKey.includes("biddingArtworks") ||
                queryKey.includes("myAuctionArtworks") ||
                queryKey.includes("hotBids") ||
                queryKey.includes("followedAuctions") ||
                queryKey.includes("followedBiddings") ||
                queryKey.includes("my-auctions") ||
                queryKey.includes("myParticipatedAuctions") ||
                queryKey.includes("auctions") ||
                queryKey.includes("exhibits") ||
                queryKey.includes("exhibit-cards") ||
                queryKey.includes("exhibitCards") ||
                queryKey.includes("my-exhibit-cards") ||
                queryKey.includes("user-exhibits") ||
                queryKey.includes("followers") ||
                queryKey.includes("following") ||
                queryKey.includes("follow-status") ||
                queryKey.includes("followStatus") ||
                queryKey.includes("followCounts") ||
                queryKey.includes("explore") ||
                queryKey.includes("feed") ||
                queryKey.includes("dashboard") ||
                queryKey.includes("marketplace") ||
                queryKey.includes("wishlist") ||
                queryKey.includes("followedArtworksOnSale") ||
                queryKey.includes("search") ||
                queryKey.includes("filter") ||
                queryKey.includes("profile") ||
                queryKey.includes("user-artworks") ||
                queryKey.includes("top-artworks") ||
                queryKey.includes("top-sellers") ||
                queryKey.includes("notifications") ||
                queryKey.includes("my-purchases") ||
                queryKey.includes("buyer-activity") ||
                queryKey.includes("my-sold-artworks") ||
                queryKey.includes("user-sold-artworks") ||
                queryKey.includes("purchase-orders") ||
                queryKey.includes("purchase-order") ||
                queryKey.includes("reviews") ||
                queryKey.includes("artwork-reviews") ||
                queryKey.includes("all-reviews-by-purchase") ||
                queryKey.includes("blocked-users"))
            );
          },
        });
      }

      // Clear user session data only for deactivation
      if (variables.data.user_status === "deactivated") {
        queryClient.removeQueries({ queryKey: ["user"] });
      }
    },
    onError: (error: any) => {
      console.error("❌ Deactivation error:", error.response?.data || error.message);

      if (error.response?.data?.error) {
        toast.error("Failed to update account status: " + error.response.data.error, { closeButton: true });
      } else {
        toast.error("Failed to update account status. Please try again.", { closeButton: true });
      }
    },
  });
};

export default useDeactivateAccount;
