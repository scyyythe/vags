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
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    })),
  });
};

export default useMultipleFollowStatus;
