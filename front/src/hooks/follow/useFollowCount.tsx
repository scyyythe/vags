import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { AxiosError } from "axios";

interface FollowCounts {
  followers: number;
  following: number;
}

const useFollowCounts = (profileUserId: string) => {
  console.log("Fetching follow counts for user ID:", profileUserId);

  return useQuery<FollowCounts, AxiosError>({
    queryKey: ["followCounts", profileUserId],
    queryFn: async () => {
      if (!profileUserId) throw new Error("No user ID provided");

      try {
        const response = await apiClient.get(`follow-counts/${profileUserId}/`);
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error("API error:", error.response?.data || error.message);
        } else {
          console.error("Unknown error:", error);
        }
        throw error;
      }
    },
    enabled: !!profileUserId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export default useFollowCounts;
