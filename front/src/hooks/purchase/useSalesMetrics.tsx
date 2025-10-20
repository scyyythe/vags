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
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for sales metrics updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
