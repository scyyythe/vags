import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export const useComments = (contentType: string, objectId: string) => {
  return useQuery({
    queryKey: ["comments", contentType, objectId],
    queryFn: async () => {
      const res = await apiClient.get(`/${contentType}/${objectId}/comments/`);
      return res.data;
    },
    enabled: !!contentType && !!objectId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: false, // Disable automatic polling
    refetchIntervalInBackground: false,
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
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
      // Invalidate all comment and related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("comments") ||
              queryKey.includes("notifications") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks"))
          );
        },
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
      // Invalidate all comment and related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("comments") ||
              queryKey.includes("notifications") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks"))
          );
        },
      });
    },
    onError: (error: any) => {
      console.error("❌ Error adding reaction:", error?.response?.data || error.message);
    },
  });
};
