import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { AxiosError } from "axios";

type UndoArtworkReportInput = {
  id: string; // artwork id
};

const undoArtworkReport = async ({ id }: UndoArtworkReportInput): Promise<any> => {
  if (!id) throw new Error("Artwork ID is required.");

  const response = await apiClient.delete("/reports/undo/", {
    data: {
      id,
      type: "artwork",
    },
  });

  return response.data;
};

const useUndoArtworkReport = () => {
  const queryClient = useQueryClient();

  const { mutate: undoReport } = useMutation({
    mutationFn: undoArtworkReport,

    onSuccess: (_, { id }) => {
      toast.success("Artwork report has been undone.");

      // Invalidate all report and artwork queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("reportStatus") ||
              queryKey.includes("artworkReportStatus") ||
              queryKey.includes("artworks") ||
              queryKey.includes("artwork") ||
              queryKey.includes("artwork-cards") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("my-sell-art-cards") ||
              queryKey.includes("user-sell-art-cards") ||
              queryKey.includes("trending-artworks") ||
              queryKey.includes("trendingArtworks") ||
              queryKey.includes("popular-artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("popular-artworks-light") ||
              queryKey.includes("followedArtworks") ||
              queryKey.includes("followed-artworks") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("hotBids") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("followedBiddings") ||
              queryKey.includes("my-auctions") ||
              queryKey.includes("myParticipatedAuctions") ||
              queryKey.includes("auctions") ||
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
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("dashboard") ||
              queryKey.includes("marketplace") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("top-artworks") ||
              queryKey.includes("top-sellers") ||
              queryKey.includes("notifications") ||
              queryKey.includes("my-purchases") ||
              queryKey.includes("buyer-activity") ||
              queryKey.includes("my-sold-artworks") ||
              queryKey.includes("user-sold-artworks") ||
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

  const handleUndoReport = (
    e: React.MouseEvent,
    id: string,
    onLocalUpdate?: () => void,
    onLocalRevert?: () => void
  ) => {
    e.stopPropagation();
    if (!id) {
      toast.error("Invalid artwork ID.");
      return;
    }

    // Call local update immediately for instant UI feedback
    if (onLocalUpdate) {
      onLocalUpdate();
    }

    undoReport(
      { id },
      {
        onError: () => {
          // Revert local state if undo fails
          if (onLocalRevert) {
            onLocalRevert();
          }
        },
      }
    );
  };

  return { handleUndoReport };
};

export default useUndoArtworkReport;
