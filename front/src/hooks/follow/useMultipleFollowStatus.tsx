import { useQueries } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchFollowStatus = async (profileUserId: string) => {
  const response = await apiClient.get(`check-follow-status?following=${profileUserId}`);
  return response.data.is_following;
};

const useMultipleFollowStatus = (profileUserIds: string[]) => {
  return useQueries({
    queries: profileUserIds.map((id) => ({
      queryKey: ["followStatus", id],
      queryFn: () => fetchFollowStatus(id),
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 3000,
      refetchIntervalInBackground: false,
      retry: 1,
    })),
  });
};

export default useMultipleFollowStatus;
