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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce calls
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 2 * 60 * 1000, // Poll every 2 minutes for report status updates (lower priority)
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};

export default useBulkBidReportStatus;
