import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type CommentReportStatusResponse = {
  reported: boolean;
  status: string | null;
};

const fetchCommentReportStatus = async (commentId: string): Promise<CommentReportStatusResponse> => {
  if (!commentId) {
    throw new Error("Comment ID is required");
  }

  const response = await apiClient.get(`/comments/${commentId}/report-status/`);
  return response.data;
};

const useCommentReportStatus = (commentId: string | undefined) => {
  return useQuery({
    queryKey: ["commentReportStatus", commentId],
    queryFn: () => fetchCommentReportStatus(commentId!),
    enabled: !!commentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export default useCommentReportStatus;
