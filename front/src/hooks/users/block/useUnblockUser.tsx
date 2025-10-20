import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

interface UnblockUserResponse {
  detail: string;
}

const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<UnblockUserResponse, Error, string>({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post(`/user/${userId}/unblock/`);
      return response.data;
    },
    onSuccess: (data, userId) => {
      // Invalidate and refetch blocked users list
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["followCounts", userId] });

      // Invalidate artwork-related queries
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["popular-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["artworks-for-sale"] });

      // Invalidate auction-related queries
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["lightweight-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["followed-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["user-auctions"] });

      // Invalidate follow-related queries
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["follow-status"] });

      // Invalidate exhibit-related queries
      queryClient.invalidateQueries({ queryKey: ["exhibits"] });
      queryClient.invalidateQueries({ queryKey: ["user-exhibits"] });

      // Invalidate any queries that might contain the unblocked user's content
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["explore"] });

      // Force refetch of all queries to immediately update the UI
      queryClient.refetchQueries();
    },
    onError: (error: any) => {
      console.error("Error unblocking user:", error);
    },
  });
};

export default useUnblockUser;