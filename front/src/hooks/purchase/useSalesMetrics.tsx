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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
