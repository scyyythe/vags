import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

type ReportInput = {
  art_id: string;
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

const submitReport = async ({
  art_id,
  category,
  option,
  description,
  additionalInfo,
}: ReportInput): Promise<ReportResponse> => {
  const response = await apiClient.post("/reports/create/", {
    art_id,
    category,
    option,
    description,
    additionalInfo,
  });
  return response.data;
};

const useSubmitReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ art_id, category, option, description, additionalInfo }: ReportInput) =>
      submitReport({
        art_id,
        category,
        option,
        description,
        additionalInfo,
      }),

    onSuccess: (_, { art_id }) => {
      toast.success("You this reported successfully!");
      // Invalidate all artwork and report-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("reportStatus") ||
              queryKey.includes("artworkReportStatus") ||
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
              queryKey.includes("myAuctionArtworks"))
          );
        },
      });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.detail || error.response?.data?.error || "";

        if (
          serverMessage.toLowerCase().includes("already reported") ||
          serverMessage.toLowerCase().includes("still under review")
        ) {
          toast.error("You already reported this");
        } else {
          toast.error(serverMessage || "Failed to submit report.");
        }
      } else {
        toast.error("Failed to submit report.");
      }
    },
  });
};

export default useSubmitReport;
