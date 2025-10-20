import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface BlockUserResponse {
  detail: string;
}

const blockUser = async (userId: string): Promise<BlockUserResponse> => {
  const response = await apiClient.post(`/user/${userId}/block/`);
  return response.data;
};

const useBlockUser = (): UseMutationResult<BlockUserResponse, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation<BlockUserResponse, Error, string>({
    mutationFn: blockUser,
    onSuccess: (data, userId) => {
      toast.success(data.detail || "User blocked successfully!");

      // Invalidate all queries that might show the blocked user's content for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("blocked-users") ||
              queryKey.includes("users") ||
              queryKey.includes("user") ||
              queryKey.includes("followCounts") ||
              queryKey.includes("artworks") ||
              queryKey.includes("art-cards") ||
              queryKey.includes("my-sell-art-cards") ||
              queryKey.includes("user-sell-art-cards") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("popular-artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("popular-artworks-light") ||
              queryKey.includes("artworks-for-sale") ||
              queryKey.includes("trending-artworks") ||
              queryKey.includes("trendingArtworks") ||
              queryKey.includes("followedArtworks") ||
              queryKey.includes("followed-artworks") ||
              queryKey.includes("auctions") ||
              queryKey.includes("lightweight-auctions") ||
              queryKey.includes("followed-auctions") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("user-auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedBiddings") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("followers") ||
              queryKey.includes("following") ||
              queryKey.includes("follow-status") ||
              queryKey.includes("followStatus") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("exhibitCards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("user-exhibits") ||
              queryKey.includes("feed") ||
              queryKey.includes("dashboard") ||
              queryKey.includes("marketplace") ||
              queryKey.includes("explore") ||
              queryKey.includes("wishlist") ||
              queryKey.includes("wishlist-art-cards") ||
              queryKey.includes("artCards") ||
              queryKey.includes("userDetails") ||
              queryKey.includes("notifications") ||
              queryKey.includes("my-purchases") ||
              queryKey.includes("buyer-activity") ||
              queryKey.includes("my-sold-artworks") ||
              queryKey.includes("user-sold-artworks") ||
              queryKey.includes("purchase-orders") ||
              queryKey.includes("purchase-order") ||
              queryKey.includes("reviews") ||
              queryKey.includes("artwork-reviews") ||
              queryKey.includes("all-reviews-by-purchase"))
          );
        },
      });

      // Force immediate refetch of critical queries
      queryClient.refetchQueries({ queryKey: ["blocked-users"] });
      queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.refetchQueries({ queryKey: ["trending-artworks"] });
      queryClient.refetchQueries({ queryKey: ["followedArtworks"] });
      queryClient.refetchQueries({ queryKey: ["biddingArtworks"] });
      queryClient.refetchQueries({ queryKey: ["exhibit-cards"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to block user.");
      console.error(error);
    },
  });
};

export default useBlockUser;
