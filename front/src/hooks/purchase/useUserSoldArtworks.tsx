import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface UseUserSoldArtworksOptions {
  status?: string;
  enabled?: boolean;
}

export const useUserSoldArtworks = (userId: string | undefined, options: UseUserSoldArtworksOptions = {}) => {
  const { status, enabled = true } = options;

  return useQuery<any[]>({
    queryKey: ["user-sold-artworks", userId, status],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const { data } = await apiClient.get(`/user-sold-artworks/${userId}/?${params.toString()}`);
      console.log("Raw sold artworks data:", data);
      return data;
    },
    enabled: !!userId && enabled,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for sold artworks updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
