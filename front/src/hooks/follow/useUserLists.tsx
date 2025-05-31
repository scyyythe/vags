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
  });

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollow = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      await followMutation.mutateAsync({ following: targetUserId });

      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
      queryClient.invalidateQueries({ queryKey: ["followCounts", targetUserId] });

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

      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
      queryClient.invalidateQueries({ queryKey: ["followCounts", targetUserId] });

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

      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
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
