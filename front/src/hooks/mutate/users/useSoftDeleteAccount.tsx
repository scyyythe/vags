import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

interface SoftDeleteAccountData {
  action: "schedule_deletion" | "cancel_deletion";
}

const softDeleteAccount = async (userId: string, data: SoftDeleteAccountData) => {
  const response = await apiClient.patch(`/users/${userId}/soft-delete/`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

const useSoftDeleteAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: SoftDeleteAccountData }) => softDeleteAccount(userId, data),
    onSuccess: (data, variables) => {
      if (variables.data.action === "schedule_deletion") {
        toast.success("Account scheduled for deletion in 60 days.", { closeButton: true });

        // Clear all tokens and user data from localStorage
        localStorage.clear();

        // Navigate to home page
        navigate("/");

        // Show login modal
        setShowLoginModal(true);
      } else {
        toast.success("Account deletion cancelled. Account is now active!", { closeButton: true });

        // Invalidate ALL queries to refresh content visibility
        queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
        queryClient.invalidateQueries({ queryKey: ["userDetails", variables.userId] });

        // Invalidate artwork-related queries
        queryClient.invalidateQueries({ queryKey: ["artworks"] });
        queryClient.invalidateQueries({ queryKey: ["popularArtworks"] });
        queryClient.invalidateQueries({ queryKey: ["artCards"] });
        queryClient.invalidateQueries({ queryKey: ["trendingArtworks"] });
        queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });

        // Invalidate auction-related queries
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
        queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });
        queryClient.invalidateQueries({ queryKey: ["followedAuctions"] });
        queryClient.invalidateQueries({ queryKey: ["popular-auctions"] });

        // Invalidate exhibit-related queries
        queryClient.invalidateQueries({ queryKey: ["exhibits"] });
        queryClient.invalidateQueries({ queryKey: ["exhibitCards"] });

        // Invalidate marketplace queries
        queryClient.invalidateQueries({ queryKey: ["marketplace"] });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        queryClient.invalidateQueries({ queryKey: ["followedArtworksOnSale"] });

        // Invalidate search and filter queries
        queryClient.invalidateQueries({ queryKey: ["search"] });
        queryClient.invalidateQueries({ queryKey: ["filter"] });

        // Invalidate all queries to be safe
        queryClient.invalidateQueries();
      }

      // Clear user session data only for scheduling deletion
      if (variables.data.action === "schedule_deletion") {
        queryClient.removeQueries({ queryKey: ["user"] });
      }
    },
    onError: (error: any) => {
      console.error("❌ Soft delete error:", error.response?.data || error.message);

      if (error.response?.data?.error) {
        toast.error("Failed to update account status: " + error.response.data.error, { closeButton: true });
      } else {
        toast.error("Failed to update account status. Please try again.", { closeButton: true });
      }
    },
  });
};

export default useSoftDeleteAccount;
