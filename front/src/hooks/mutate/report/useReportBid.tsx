// useSubmitBidReport.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const submitBidReport = async ({ bid_id, issue_details }: { bid_id: string; issue_details: string }) => {
  const response = await apiClient.post("bid-reports/create/", {
    issue_details,
    bid_id,
  });
  return response.data;
};

const useSubmitBidReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitBidReport,
    onSuccess: (_, { bid_id }) => {
      queryClient.invalidateQueries({ queryKey: ["bidReportStatus", bid_id] });
    },
    onError: () => {
      toast.error("Failed to submit bid report.");
    },
  });
};

export default useSubmitBidReport;
