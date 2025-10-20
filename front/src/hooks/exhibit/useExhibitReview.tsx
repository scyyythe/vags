import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const useExhibitReview = (id: string | undefined) => {
  return useQuery({
    queryKey: ["exhibit-review", id],
    queryFn: async () => {
      if (!id) throw new Error("No exhibit ID");

      try {
        const response = await apiClient.get(`/exhibits/${id}/review/`);
        console.log("Exhibit Review Response:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("Exhibit review fetch error:", error);
        toast.error("Failed to fetch exhibit review");
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for exhibit review updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
