import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchArtworkById = async (id: string) => {
  const response = await apiClient.get(`art/${id}/?fields=title,image,artist,likes_count`);

  if (response.status !== 200) {
    throw new Error("Failed to fetch artwork");
  }
  return response.data;
};

const useArtworkQuery = (id: string) => {
  return useQuery({
    queryKey: ["artwork", id],
    queryFn: () => fetchArtworkById(id),
    enabled: !!id,
  });
};

export default useArtworkQuery;
