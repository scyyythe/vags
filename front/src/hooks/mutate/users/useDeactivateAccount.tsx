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
