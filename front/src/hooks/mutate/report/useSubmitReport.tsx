import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";
type ReportInput = {
  issue_details: string;
};

type ReportResponse = {
  id: string;
  issue_details: string;
  status: "Pending" | "In Progress" | "Resolved";
  created_at: string;
};

const submitReport = async ({ id, issue_details }: { id: string; issue_details: string }): Promise<ReportResponse> => {
  const response = await apiClient.post("/reports/create/", {
    issue_details,
    art_id: id,
  });
  return response.data;
};
const useSubmitReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, issue_details }: { id: string; issue_details: string }) => submitReport({ id, issue_details }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["reportStatus", id] });
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || "Failed to submit report.");
      } else {
        toast.error("Failed to submit report.");
      }
    },
  });
};
export default useSubmitReport;
