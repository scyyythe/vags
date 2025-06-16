import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchArtworkById = async (id: string) => {
  const response = await apiClient.get(
    `art/${id}/?fields=title,image,artist,likes_count,created_at,category,description,medium,size,status,price,visibility`
  );
  if (response.status !== 200) throw new Error("Failed to fetch artwork");
  return response.data;
};

const useArtworkQuery = (id: string) => {
  return useQuery({
    queryKey: ["artworks", id],
    queryFn: () => fetchArtworkById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5
  });
};

export default useArtworkQuery;
