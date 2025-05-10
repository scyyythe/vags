import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchLikeStatus = async (id: string) => {
  const response = await apiClient.get(`/artworks/${id}/status/`);
  return response.data;
};

const useLikeStatus = (id: string) => {
  return useQuery({
    queryKey: ["likeStatus", id],
    queryFn: () => fetchLikeStatus(id),
    staleTime: 1000 * 1,
  });
};

export default useLikeStatus;
