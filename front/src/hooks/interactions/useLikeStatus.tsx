import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type LikeStatusResponse = {
  liked: boolean;
};

const fetchLikeStatus = async (id: string): Promise<LikeStatusResponse> => {
  const response = await apiClient.get(`/likes/${id}/status/`);
  return response.data;
};

const toggleLikeStatus = async (id: string): Promise<LikeStatusResponse> => {
  const response = await apiClient.post(`/likes/${id}/toggle/`);
  return response.data;
};

const useLikeStatus = (id: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<LikeStatusResponse>({
    queryKey: ["likeStatus", id],
    queryFn: () => fetchLikeStatus(id),
    staleTime: 1000 * 1,
  });

  const mutation = useMutation<LikeStatusResponse, Error, void, { previousData?: LikeStatusResponse }>({
    mutationFn: () => toggleLikeStatus(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["likeStatus", id] });

      const previousData = queryClient.getQueryData<LikeStatusResponse>(["likeStatus", id]);

      if (previousData) {
        queryClient.setQueryData<LikeStatusResponse>(["likeStatus", id], {
          liked: !previousData.liked,
        });
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["likeStatus", id], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["likeStatus", id] });
    },
  });

  return {
    data,
    isLoading,
    isError,
    toggleLike: mutation.mutate,
    isToggling: mutation.isPending,
  };
};

export default useLikeStatus;
