import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface UseMySoldArtworksOptions {
  status?: string;
  enabled?: boolean;
}

export const useMySoldArtworks = (options: UseMySoldArtworksOptions = {}) => {
  const { status, enabled = true } = options;

  return useQuery<any[]>({
    queryKey: ["my-sold-artworks", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const { data } = await apiClient.get(`/my-sold-artworks/?${params.toString()}`);
      return data;
    },
    enabled,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for sold artworks updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
