import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type ReportStatusResponse = {
  reported: boolean;
  status: "Pending" | "In Progress" | "Resolved" | null;
};

const fetchArtworkReportStatus = async (id: string): Promise<ReportStatusResponse> => {
  const response = await apiClient.get(`/artworks/${id}/report-status/`);
  return response.data;
};

const useArtworkReportStatus = (id: string) => {
  return useQuery({
    queryKey: ["artworkReportStatus", id],
    queryFn: () => fetchArtworkReportStatus(id),
    enabled: !!id,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 30000, // Poll every 30 seconds for report status updates (lower priority)
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};

export default useArtworkReportStatus;
