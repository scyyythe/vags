import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useFollowUser } from "@/hooks/follow/useFollowUser";
import { useUnfollowUser } from "@/hooks/follow/useUnfollowUser";
import type { UserData } from "@/components/user_dashboard/own_profile/following_&_followers/components/common/UserListModal";

// This is a mock implementation - in a real app, you'd fetch this data from your API
const mockFollowers: UserData[] = Array(10).fill(null).map((_, i) => ({
  id: `follower-${i}`,
  name: "Jai Anoba",
  profileImage: "https://i.pravatar.cc/150?img=" + (i + 10),
  isFollowing: i % 3 === 0 ? true : false, // Some users we follow back, some we don't
}));

const mockFollowing: UserData[] = Array(10).fill(null).map((_, i) => ({
  id: `following-${i}`,
  name: "Jai Anoba",
  profileImage: "https://i.pravatar.cc/150?img=" + (i + 20),
  items: 64
}));

export function useUserLists(userId: string) {
  const [followers, setFollowers] = useState<UserData[]>(mockFollowers);
  const [following, setFollowing] = useState<UserData[]>(mockFollowing);
  const [isLoading, setIsLoading] = useState(false);
  
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollow = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      await followMutation.mutateAsync({ following: targetUserId });
      
      setFollowers(prev => 
        prev.map(user => 
          user.id === targetUserId ? { ...user, isFollowing: true } : user
        )
      );
      
      toast({
        title: "Success",
        description: "You are now following this user",
      });
    } catch (error) {
      console.error("Failed to follow user:", error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      await unfollowMutation.mutateAsync({ following: targetUserId });
      
      // Remove from following list
      setFollowing(prev => prev.filter(user => user.id !== targetUserId));
      
      // Update followers if they exist there
      setFollowers(prev => 
        prev.map(user => 
          user.id === targetUserId ? { ...user, isFollowing: false } : user
        )
      );
      
      toast({
        title: "Success",
        description: "You have unfollowed this user",
      });
    } catch (error) {
      console.error("Failed to unfollow user:", error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFollower = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      
      setFollowers(prev => prev.filter(user => user.id !== targetUserId));
      
      toast({
        title: "Success",
        description: "Follower has been removed",
      });
    } catch (error) {
      console.error("Failed to remove follower:", error);
      toast({
        title: "Error",
        description: "Failed to remove follower",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    followers,
    following,
    isLoading,
    handleFollow,
    handleUnfollow,
    handleRemoveFollower,
  };
}
