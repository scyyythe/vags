import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export const useComments = (contentType: string, objectId: string) => {
  return useQuery({
    queryKey: ["comments", contentType, objectId],
    queryFn: async () => {
      const res = await apiClient.get(`/${contentType}/${objectId}/comments/`);
      return res.data;
    },
  });
};

export const useAddComment = (contentType: string, objectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { text: string; parentId?: string }) => {
      const res = await apiClient.post(`/${contentType}/${objectId}/comments/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", contentType, objectId],
      });
    },
    onError: (error: any) => {
      console.error("❌ Error posting comment:", error?.response?.data || error.message);
    },
  });
};

export const useAddReaction = (contentType: string, objectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, emoji }: { commentId: string; emoji: string }) => {
      const res = await apiClient.patch(`/comments/${commentId}/react/`, { emoji });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", contentType, objectId],
      });
    },
    onError: (error: any) => {
      console.error("❌ Error adding reaction:", error?.response?.data || error.message);
    },
  });
};
