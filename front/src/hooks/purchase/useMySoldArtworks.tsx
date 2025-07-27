import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export const useMySoldArtworks = (status?: string) => {
  return useQuery({
    queryKey: ["my-sold-artworks", status],
    queryFn: async () => {
      const { data } = await apiClient.get("/my-sold-artworks/", {
        params: status ? { status } : {},
      });
      return data;
    },
  });
};
