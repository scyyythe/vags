import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export type ModeratorReport = {
  id: string;
  reportType: "offensive" | "fraud" | "spam" | "plagiarism" | "other";
  reportedId: string;
  reportedType: "artwork" | "user" | "comment" | "bid";
  reportedBy: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  dateReported: string;
  description: string;
  additional_info?: string;
  issue_details?: string;
};

export type ModeratorReportsResponse = {
  reports: ModeratorReport[];
  total: number;
};

const fetchModeratorReports = async (status?: string): Promise<ModeratorReportsResponse> => {
  const params = status && status !== 'all' ? `?status=${status}` : '';
  const res = await apiClient.get(`/moderator/reports/${params}`);
  return res.data;
};

export default function useModeratorReports(status?: string) {
  return useQuery<ModeratorReportsResponse, Error>({
    queryKey: ["moderatorReports", status],
    queryFn: () => fetchModeratorReports(status),
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const res = await apiClient.patch(`/moderator/reports/${reportId}/update/`, {
        status: status
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: ["moderatorReports"] });
    },
  });
}
