import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role: string;
  user_status: string;
  gender: string;
  date_of_birth: string;
  profile_picture: File;
  cover_photo: File;
  bio: string;
  contact_number: string;
  address: string;
}

const updateUserDetails = async ([userId, data]: [string, FormData]): Promise<User> => {
  const response = await apiClient.patch(`/users/${userId}/update/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const useUpdateUserDetails = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, [string, FormData]>({
    mutationFn: updateUserDetails,
    onSuccess: (data) => {
      toast.success("User details updated successfully!");

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
    },
    onError: (error: any) => {
      if (error.response?.data) {
        console.error("❌ API error:", error.response.data);
        toast.error("Update failed: " + JSON.stringify(error.response.data));
      } else {
        toast.error("Update failed");
      }
    },
  });
};

export default useUpdateUserDetails;
