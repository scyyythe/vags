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
      queryClient.invalidateQueries({ queryKey: ["reportStatus", art_id] });
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
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
