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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
