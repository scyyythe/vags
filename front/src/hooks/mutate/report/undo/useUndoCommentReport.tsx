import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { AxiosError } from "axios";

type UndoCommentReportInput = {
  id: string; // comment id
};

const undoCommentReport = async ({ id }: UndoCommentReportInput): Promise<any> => {
  if (!id) throw new Error("Comment ID is required.");

  const response = await apiClient.delete("/reports/undo/", {
    data: {
      id,
      type: "comment",
    },
  });

  return response.data;
};

const useUndoCommentReport = () => {
  const queryClient = useQueryClient();

  const { mutate: undoReport } = useMutation({
    mutationFn: undoCommentReport,

    onSuccess: (_, { id }) => {
      toast.success("Comment report has been undone.");

      // Invalidate all report and comment queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("commentReportStatus") ||
              queryKey.includes("comments") ||
              queryKey.includes("artwork") ||
              queryKey.includes("auction") ||
              queryKey.includes("exhibit") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("my-sell-art-cards") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("my-sold-artworks") ||
              queryKey.includes("user-sell-art-cards") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("followedArtworks") ||
              queryKey.includes("followed-artworks") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("exhibitCards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("user-exhibits") ||
              queryKey.includes("followers") ||
              queryKey.includes("following") ||
              queryKey.includes("follow-status") ||
              queryKey.includes("followStatus") ||
              queryKey.includes("followCounts") ||
              queryKey.includes("dashboard") ||
              queryKey.includes("marketplace") ||
              queryKey.includes("top-artworks") ||
              queryKey.includes("top-sellers") ||
              queryKey.includes("notifications") ||
              queryKey.includes("my-purchases") ||
              queryKey.includes("buyer-activity") ||
              queryKey.includes("purchase-orders") ||
              queryKey.includes("purchase-order") ||
              queryKey.includes("reviews") ||
              queryKey.includes("artwork-reviews") ||
              queryKey.includes("all-reviews-by-purchase") ||
              queryKey.includes("blocked-users"))
          );
        },
      });
    },

    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.detail || error.response?.data?.error || "";
        toast.error(serverMessage || "Failed to undo report.");
      } else {
        toast.error("Failed to undo report.");
      }
    },
  });

  const handleUndoReport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!id) {
      toast.error("Invalid comment ID.");
      return;
    }
    undoReport({ id });
  };

  return { handleUndoReport };
};

export default useUndoCommentReport;
