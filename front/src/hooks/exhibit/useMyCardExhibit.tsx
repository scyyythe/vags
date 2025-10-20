import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};
export const useMyExhibitCards = (
  { includeDeleted, includeHidden, includeArchived } = {
    includeDeleted: false,
    includeHidden: false,
    includeArchived: false,
  }
) => {
  return useQuery({
    queryKey: ["my-exhibit-cards", includeDeleted, includeHidden, includeArchived],
    queryFn: async () => {
      const response = await apiClient.get(`/exhibits/my/`, {
        params: {
          include_deleted: includeDeleted,
          include_hidden: includeHidden,
          include_archived: includeArchived,
        },
      });
      return response.data;
    },
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for my exhibits updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
