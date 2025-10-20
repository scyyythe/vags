import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import apiClient from "@/utils/apiClient";

type ReportStatusResponse = {
  [auctionId: string]: {
    reported: boolean;
    status: "Pending" | "In Progress" | "Resolved" | null;
  };
};

const fetchBulkReportStatus = async (ids: string[]): Promise<ReportStatusResponse> => {
  const queryParam = ids.join(",");
  const response = await apiClient.get(`auction/report-status/bulk/?ids=${queryParam}`);
  return response.data;
};

const useBulkBidReportStatus = (ids: string[]) => {
  const stableIds = useMemo(() => [...ids].sort(), [ids]);
  const stableKey = stableIds.join(",");

  return useQuery<ReportStatusResponse, Error, ReportStatusResponse, [string, string]>({
    queryKey: ["auctionReportStatusBulk", stableKey],
    queryFn: () => fetchBulkReportStatus(stableIds),
    enabled: stableIds.length > 0,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 30000, // Poll every 30 seconds for report status updates (lower priority)
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};

export default useBulkBidReportStatus;
