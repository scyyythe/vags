import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface UseMyPurchasesOptions {
  status?: string;
}

export const useMyPurchases = (options: UseMyPurchasesOptions = {}) => {
  const { status } = options;

  return useQuery<any[]>({
    queryKey: ["my-purchases", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const { data } = await apiClient.get(`/my-purchases/?${params.toString()}`);
      return data;
    },
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep data fresh for 10 minutes
    gcTime: 10 * 60 * 1000,
  });
};
