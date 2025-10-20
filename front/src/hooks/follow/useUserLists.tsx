import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { useFollowUser } from "@/hooks/follow/useFollowUser";
import { useUnfollowUser } from "@/hooks/follow/useUnfollowUser";
import { User } from "../users/useUserQuery";
export function useUserLists(userId: string) {
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  const {
    data: followers = [],
    isLoading: loadingFollowers,
    error: errorFollowers,
  } = useQuery<User[]>({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const res = await apiClient.get(`followers/?user_id=${userId}`);
      return res.data;
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  const {
    data: following = [],
    isLoading: loadingFollowing,
    error: errorFollowing,
  } = useQuery<User[]>({
    queryKey: ["following", userId],
    queryFn: async () => {
      const res = await apiClient.get(`following/?user_id=${userId}`);
      return res.data;
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollow = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      await followMutation.mutateAsync({ following: targetUserId });

      // Invalidate all follow-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("followStatus") ||
              queryKey.includes("followCounts") ||
              queryKey.includes("followers") ||
              queryKey.includes("following") ||
              queryKey.includes("notifications") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks"))
          );
        },
      });

      toast.success("You are now following this user");
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      await unfollowMutation.mutateAsync({ following: targetUserId });

      // Invalidate all follow-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("followStatus") ||
              queryKey.includes("followCounts") ||
              queryKey.includes("followers") ||
              queryKey.includes("following") ||
              queryKey.includes("notifications") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks"))
          );
        },
      });

      toast.success("You have unfollowed this user");
    } catch (error) {
      toast.error("Failed to unfollow user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFollower = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      await apiClient.delete(`followers/remove/`, {
        data: { follower_id: targetUserId },
      });

      // Invalidate all follow-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("followStatus") ||
              queryKey.includes("followCounts") ||
              queryKey.includes("followers") ||
              queryKey.includes("following") ||
              queryKey.includes("notifications") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks"))
          );
        },
      });

      toast.success("Removed follower successfully");
    } catch (error) {
      toast.error("Failed to remove follower");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    followers,
    following,
    isLoading: isLoading || loadingFollowers || loadingFollowing,
    error: errorFollowers || errorFollowing,
    handleFollow,
    handleUnfollow,
    handleRemoveFollower,
  };
}
