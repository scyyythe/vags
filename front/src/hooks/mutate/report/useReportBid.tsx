import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

type AuctionReportInput = {
  auction_id: string;
  category: string;
  option?: string;
  description?: string;
  additionalInfo?: string;
};

type ReportResponse = {
  id: string;
  description?: string;
  additionalInfo?: string;
  status: "Pending" | "In Progress" | "Resolved";
  created_at: string;
};

const submitAuctionReport = async ({
  auction_id,
  category,
  option,
  description,
  additionalInfo,
}: AuctionReportInput): Promise<ReportResponse> => {
  const response = await apiClient.post("/reports/create/", {
    auction_id,
    category,
    option,
    description,
    additionalInfo,
  });
  return response.data;
};

const useAuctionReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auction_id, category, option, description, additionalInfo }: AuctionReportInput) =>
      submitAuctionReport({
        auction_id,
        category,
        option,
        description,
        additionalInfo,
      }),

    onSuccess: (_, { auction_id }) => {
      toast.success("You successfully reported this auction.");
      // Invalidate all auction and report-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("auctionReportStatus") ||
              queryKey.includes("auctionReportStatusBulk") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("myAuctions") ||
              queryKey.includes("light-auctions") ||
              queryKey.includes("popular-auctions") ||
              queryKey.includes("hotBids") ||
              queryKey.includes("myParticipatedAuctions") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("exhibits"))
          );
        },
      });
    },

    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        console.error("Full error response:", error.response);
        const serverMessage = error.response?.data?.detail || error.response?.data?.error || "";

        if (
          serverMessage.toLowerCase().includes("already reported") ||
          serverMessage.toLowerCase().includes("still under review")
        ) {
          toast.error("You already reported this auction and it's under review.");
        } else {
          toast.error(serverMessage || "Failed to submit auction report.");
        }
      } else {
        toast.error("Failed to submit auction report.");
      }
    },
  });
};

export default useAuctionReport;
