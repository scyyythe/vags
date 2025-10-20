import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

export const useExhibitCards = () => {
  return useQuery({
    queryKey: ["exhibit-cards"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/exhibits/cards/");
        devLog("Exhibit Cards Response:", response.data);
        return response.data;
      } catch (error: any) {
        toast.error("Failed to load exhibit cards.");
        console.error("Error fetching exhibit cards:", error);
        throw new Error(error?.response?.data?.detail || error.message || "Error fetching exhibit cards");
      }
    },
    staleTime: 0, // Always consider data stale for real-time updates
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for new exhibits
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 2,
  });
};
