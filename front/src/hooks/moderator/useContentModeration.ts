import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export type ModerationAction = "approve" | "remove" | "warn" | "escalate";

export type ContentModerationRequest = {
  action: ModerationAction;
  content_id: string;
  content_type: string;
  report_id: string;
};

export type ContentModerationResponse = {
  message: string;
  action: ModerationAction;
  content_id: string;
};

const performModerationAction = async (data: ContentModerationRequest): Promise<ContentModerationResponse> => {
  const res = await apiClient.post("/moderator/content-moderation/", data);
  return res.data;
};

export function useContentModeration() {
  const queryClient = useQueryClient();
  
  return useMutation<ContentModerationResponse, Error, ContentModerationRequest>({
    mutationFn: performModerationAction,
    onSuccess: (data) => {
      // Invalidate and refetch flagged content
      queryClient.invalidateQueries({ queryKey: ["flaggedContent"] });
      queryClient.invalidateQueries({ queryKey: ["moderatorOverview"] });
      queryClient.invalidateQueries({ queryKey: ["recentlyResolved"] });
    },
  });
}
