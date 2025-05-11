import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const fetchArtworkStatus = async (id: string) => {
  const response = await apiClient.get(`/artworks/${id}/status/`);
  return response.data;
};

const useArtworkStatus = (id: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["artworkStatus", id],

    queryFn: () => fetchArtworkStatus(id),
    enabled: !!id,
    staleTime: 1000 * 1,
  });

  const isLiked = data?.isLiked || false;
  const isSaved = data?.isSaved || false;

  return {
    isLiked,
    isSaved,
    isLoading,
    isError,
    refetch,
    data,
  };
};

export default useArtworkStatus;
