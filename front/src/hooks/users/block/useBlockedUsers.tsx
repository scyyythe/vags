import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

interface BlockedUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

const useBlockedUsers = () => {
  return useQuery<BlockedUser[]>({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/user/blocked/");
        return response.data || [];
      } catch (error) {
        console.error("Error fetching blocked users:", error);
        return [];
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
};

export default useBlockedUsers;
