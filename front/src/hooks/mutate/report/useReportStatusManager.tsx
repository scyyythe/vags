import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import apiClient from "@/utils/apiClient";

type ReportStatus = {
  reported: boolean;
  status: "Pending" | "In Progress" | "Resolved" | null;
};

type ReportStatusMap = {
  [artworkId: string]: ReportStatus;
};

const fetchBulkReportStatuses = async (ids: string[]): Promise<ReportStatusMap> => {
  if (ids.length === 0) return {};
  
  const response = await apiClient.get("/artworks/report-status/", {
    params: { ids: ids.join(",") },
  });
  return response.data;
};

// Global cache for report statuses to avoid duplicate requests
const reportStatusCache = new Map<string, { data: ReportStatusMap; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useReportStatusManager = () => {
  const queryClient = useQueryClient();

  // Get all unique artwork IDs from all active queries
  const getAllActiveArtworkIds = useCallback(() => {
    const queries = queryClient.getQueryCache().findAll({
      queryKey: ["bulkReportStatus"],
    });
    
    const allIds = new Set<string>();
    queries.forEach(query => {
      const artworkIds = query.queryKey[1] as string[];
      if (Array.isArray(artworkIds)) {
        artworkIds.forEach(id => allIds.add(id));
      }
    });
    
    return Array.from(allIds);
  }, [queryClient]);

  // Centralized query for all report statuses
  const { data: allReportStatuses, isLoading } = useQuery({
    queryKey: ["allReportStatuses"],
    queryFn: () => fetchBulkReportStatuses(getAllActiveArtworkIds()),
    enabled: getAllActiveArtworkIds().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchIntervalInBackground: false,
    retry: 1,
  });

  // Get report status for specific artwork IDs
  const getReportStatus = useCallback((artworkIds: string[]): ReportStatusMap => {
    if (!allReportStatuses || artworkIds.length === 0) return {};
    
    const result: ReportStatusMap = {};
    artworkIds.forEach(id => {
      if (allReportStatuses[id]) {
        result[id] = allReportStatuses[id];
      }
    });
    
    return result;
  }, [allReportStatuses]);

  // Invalidate and refetch report statuses
  const invalidateReportStatuses = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["allReportStatuses"] });
  }, [queryClient]);

  return {
    getReportStatus,
    invalidateReportStatuses,
    isLoading,
    allReportStatuses,
  };
};

export default useReportStatusManager;
