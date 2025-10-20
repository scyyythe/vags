import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface BuyerActivity {
  id: string;
  buyerName: string;
  action: string;
  artworkTitle: string;
  price: number;
  timestamp: string;
  status: string;
  artworkId: string;
  transactionId: string;
  paymentMethod: string;
  currency: string;
  paymentStatus: string;
  createdAt: string;
}

export const useBuyerActivity = () => {
  return useQuery<BuyerActivity[], Error>({
    queryKey: ["buyer-activity"],
    queryFn: async () => {
      const response = await apiClient.get("/buyer-activity/");
      return response.data;
    },
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for buyer activity updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
