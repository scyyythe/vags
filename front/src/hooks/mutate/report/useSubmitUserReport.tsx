import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

type UserReportInput = {
  reported_user_id: string;
  category: string;
  option?: string;
  description?: string;
  additionalInfo?: string;
};

type UserReportResponse = {
  id: string;
  description?: string;
  additionalInfo?: string;
  status: "Pending" | "In Progress" | "Resolved";
  created_at: string;
};

const submitUserReport = async ({
  reported_user_id,
  category,
  option,
  description,
  additionalInfo,
}: UserReportInput): Promise<UserReportResponse> => {
  const response = await apiClient.post("/reports/create/", {
    reported_user_id,
    category,
    option,
    description,
    additionalInfo,
  });
  return response.data;
};

const useSubmitUserReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reported_user_id, category, option, description, additionalInfo }: UserReportInput) =>
      submitUserReport({
        reported_user_id,
        category,
        option,
        description,
        additionalInfo,
      }),

    onSuccess: () => {
      toast.success("User reported successfully!");
      queryClient.invalidateQueries({ queryKey: ["reportStatus"] });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.detail || error.response?.data?.error || "";

        if (
          serverMessage.toLowerCase().includes("already reported") ||
          serverMessage.toLowerCase().includes("still under review")
        ) {
          toast.error("You already reported this user.");
        } else {
          toast.error(serverMessage || "Failed to submit report.");
        }
      } else {
        toast.error("Failed to submit report.");
      }
    },
  });
};

export default useSubmitUserReport;
