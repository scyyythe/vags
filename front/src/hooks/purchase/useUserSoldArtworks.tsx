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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
