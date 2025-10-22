import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type ReportStatusResponse = {
  reported: boolean;
  status: "Pending" | "In Progress" | "Resolved" | null;
};

const fetchReportStatus = async (id: string): Promise<ReportStatusResponse> => {
  const response = await apiClient.get(`auction/${id}/report-status/`);
  return response.data;
};

const useBidReportStatus = (id: string) => {
  return useQuery({
    queryKey: ["auctionReportStatus", id],
    queryFn: () => fetchReportStatus(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce calls
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 2 * 60 * 1000, // Poll every 2 minutes for report status updates (lower priority)
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};

export default useBidReportStatus;
