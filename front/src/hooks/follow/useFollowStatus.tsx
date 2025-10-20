import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

interface UseFollowStatusProps {
  profileUserId: string;
}

const useFollowStatus = ({ profileUserId }: UseFollowStatusProps) => {
  const queryFn = async () => {
    try {
      const response = await apiClient.get(`check-follow-status?following=${profileUserId}`);
      return response.data.is_following;
    } catch (error) {
      console.error("Error fetching follow status:", error);
      return false;
    }
  };

  return useQuery({
    queryKey: ["followStatus", profileUserId],
    queryFn,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
};

export default useFollowStatus;
