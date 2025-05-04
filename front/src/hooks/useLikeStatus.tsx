import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchLikeStatus = async (id: string) => {
  const response = await apiClient.get(`/likes/${id}/status/`);
  return response.data;
};

const useLikeStatus = (id: string) => {
  // Updated to use valid configuration options
  return useQuery({
    queryKey: ["likeStatus", id], // Query key
    queryFn: () => fetchLikeStatus(id), // Query function
    staleTime: 1000 * 60 * 5, // Use staleTime if needed for data freshness (5 minutes)
  });
};

export default useLikeStatus;
