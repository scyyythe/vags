import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
interface SalesMetrics {
  total_artworks_sold: number;
  total_earnings: number;
  pending_sales: number;
  completed_sales: number;
  cancelled_sales: number;
  refunded_sales: number;
  current_month_sales: number;
  growth_percentage: number;
  last_updated: string;
}

export const useSalesMetrics = () => {
  return useQuery<SalesMetrics>({
    queryKey: ["sales-metrics"],
    queryFn: async () => {
      const response = await apiClient.get("/sales-metrics/");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 300000, // Poll every 5 minutes for sales metrics updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
