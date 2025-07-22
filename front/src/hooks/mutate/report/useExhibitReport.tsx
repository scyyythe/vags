import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

type ExhibitReportInput = {
  exhibit_id: string;
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

const submitExhibitReport = async ({
  exhibit_id,
  category,
  option,
  description,
  additionalInfo,
}: ExhibitReportInput): Promise<ReportResponse> => {
  const response = await apiClient.post("/reports/create/", {
    exhibit_id,
    category,
    option,
    description,
    additionalInfo,
  });
  return response.data;
};

const useExhibitReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exhibit_id, category, option, description, additionalInfo }: ExhibitReportInput) =>
      submitExhibitReport({
        exhibit_id,
        category,
        option,
        description,
        additionalInfo,
      }),

    onSuccess: (_, { exhibit_id }) => {
      queryClient.invalidateQueries({ queryKey: ["exhibitReportStatus", exhibit_id] });
      queryClient.invalidateQueries({ queryKey: ["exhibits"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitReportStatusBulk"] });
    },

    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        console.error("Full error response:", error.response);
        const serverMessage = error.response?.data?.detail || error.response?.data?.error || "";

        if (
          serverMessage.toLowerCase().includes("already reported") ||
          serverMessage.toLowerCase().includes("still under review")
        ) {
          toast.error("You already reported this exhibit and it's under review.");
        } else {
          toast.error(serverMessage || "Failed to submit exhibit report.");
        }
      } else {
        toast.error("Failed to submit exhibit report.");
      }
    },
  });
};

export default useExhibitReport;
