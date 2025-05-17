import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type ReportStatusResponse = {
  reported: boolean;
  status: "Pending" | "In Progress" | "Resolved" | null;
};

const fetchReportStatus = async (id: string): Promise<ReportStatusResponse> => {
  const response = await apiClient.get(`artworks/${id}/report-status/`);
  return response.data;
};

const useReportStatus = (id: string) => {
  return useQuery({
    queryKey: ["reportStatus", id],
    queryFn: () => fetchReportStatus(id),
    staleTime: 1000 * 60,
  });
};

export default useReportStatus;
