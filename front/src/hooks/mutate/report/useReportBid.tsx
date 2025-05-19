import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

type AuctionReportInput = {
  issue_details: string;
};

type AuctionReportResponse = {
  id: string;
  issue_details: string;
  status: "Pending" | "In Progress" | "Resolved";
  created_at: string;
};

const submitAuctionReport = async ({
  id,
  issue_details,
}: {
  id: string;
  issue_details: string;
}): Promise<AuctionReportResponse> => {
  console.log("Submitting auction report:", {
    auction_id: id,
    issue_details,
  });

  const response = await apiClient.post("auction-reports/create/", {
    auction_id: id,
    issue_details,
  });

  return response.data;
};

const useAuctionSubmitReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, issue_details }: { id: string; issue_details: string }) =>
      submitAuctionReport({ id, issue_details }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["auctionReportStatus", id] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || "Failed to submit auction report.");
      } else {
        toast.error("Failed to submit auction report.");
      }
    },
  });
};

export default useAuctionSubmitReport;
