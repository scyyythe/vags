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
    staleTime: 1000 * 60,
  });
};

export default useBidReportStatus;
