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
    staleTime: 1000 * 60,
  });
};

export default useBulkReportStatus;
