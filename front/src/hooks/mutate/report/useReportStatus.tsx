import { useMemo } from "react";
import useReportStatusManager from "./useReportStatusManager";

type ReportStatus = {
  reported: boolean;
  status: "Pending" | "In Progress" | "Resolved" | null;
};

type ReportStatusMap = {
  [artworkId: string]: ReportStatus;
};

const useBulkReportStatus = (artworkIds: string[]) => {
  const { getReportStatus, isLoading } = useReportStatusManager();
  
  // Get report status for the specific artwork IDs
  const reportStatusMap = useMemo(() => {
    return getReportStatus(artworkIds);
  }, [getReportStatus, artworkIds]);

  return {
    data: reportStatusMap,
    isLoading,
    error: null,
  };
};

export default useBulkReportStatus;
