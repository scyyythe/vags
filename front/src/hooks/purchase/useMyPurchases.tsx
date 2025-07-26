import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export const useMyPurchases = () => {
  return useQuery({
    queryKey: ["my-purchases"],
    queryFn: async () => {
      const { data } = await apiClient.get("/my-purchases/");
      return data;
    },
  });
};
