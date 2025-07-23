import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type ReportStatusResponse = {
  reported: boolean;
  status: "Pending" | "In Progress" | "Resolved" | null;
};

const fetchExhibitReportStatus = async (id: string): Promise<ReportStatusResponse> => {
  const response = await apiClient.get(`/exhibit/${id}/report-status/`);
  return response.data;
};

const useExhibitReportStatus = (id: string) => {
  return useQuery({
    queryKey: ["exhibitReportStatus", id],
    queryFn: () => fetchExhibitReportStatus(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

export default useExhibitReportStatus;
