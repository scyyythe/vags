import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type ReportStatus = {
  reported: boolean;
  status: "Pending" | "In Progress" | "Resolved" | null;
};

type ReportStatusMap = {
  [artworkId: string]: ReportStatus;
};

const fetchBulkReportStatuses = async (ids: string[]): Promise<ReportStatusMap> => {
  const response = await apiClient.get("/artworks/report-status/", {
    params: { ids: ids.join(",") },
  });
  return response.data;
};

const useBulkReportStatus = (artworkIds: string[]) => {
  return useQuery({
    queryKey: ["bulkReportStatus", artworkIds],
    queryFn: () => fetchBulkReportStatuses(artworkIds),
    enabled: artworkIds.length > 0,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 30000, // Poll every 30 seconds for report status updates (lower priority)
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};

export default useBulkReportStatus;
