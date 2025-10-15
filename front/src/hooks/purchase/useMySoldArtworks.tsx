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
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep data fresh for 10 minutes
    gcTime: 10 * 60 * 1000,
  });
};
