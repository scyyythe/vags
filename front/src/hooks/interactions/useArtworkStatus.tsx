import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchBulkStatus = async (artworkIds: string[]) => {
  const params = new URLSearchParams();
  params.append("artwork_ids", artworkIds.join(","));

  const response = await apiClient.get(`/artworks/statuses/?${params.toString()}`);
  return response.data;
};

const useBulkArtworkStatus = (artworkIds: string[]) => {
  return useQuery({
    queryKey: ["bulkArtworkStatus", artworkIds],
    queryFn: () => fetchBulkStatus(artworkIds),
    enabled: artworkIds.length > 0,
    staleTime: 1000 * 5,
  });
};

export default useBulkArtworkStatus;
