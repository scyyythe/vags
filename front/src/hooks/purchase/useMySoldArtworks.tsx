import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export const useMySoldArtworks = (status?: string) => {
  return useQuery({
    queryKey: ["my-sold-artworks", status],
    queryFn: async () => {
      const { data } = await apiClient.get("/my-sold-artworks/", {
        params: status ? { status } : {},
      });

      // Debug: Log the raw API response to see if buyer_id is present
      console.log("🔍 Raw API response from /my-sold-artworks/:", data);
      if (data && data.length > 0) {
        console.log("🔍 First item structure:", data[0]);
        console.log("🔍 Available fields in first item:", Object.keys(data[0]));
      }

      return data;
    },
  });
};
