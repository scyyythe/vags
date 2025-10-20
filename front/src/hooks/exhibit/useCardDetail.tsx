import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

export const useExhibitCardDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["exhibit-card", id],
    queryFn: async () => {
      if (!id) throw new Error("No exhibit ID provided");

      try {
        const response = await apiClient.get(`/exhibits/${id}/`);
        devLog("Exhibit Card Detail Response:", response.data);
        return response.data;
      } catch (error: any) {
        toast.error("Failed to load exhibit details.");
        console.error("Error fetching exhibit detail:", error);
        throw new Error(error?.response?.data?.detail || error.message || "Error fetching exhibit details");
      }
    },
    enabled: !!id,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for exhibit detail updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
