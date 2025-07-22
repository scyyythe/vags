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
    staleTime: 1000 * 60,
  });
};

export default useArtworkReportStatus;
