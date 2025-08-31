import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};
export const useMyExhibitCards = (includeSpecial = false) => {
  return useQuery({
    queryKey: ["my-exhibit-cards", includeSpecial],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/exhibits/my/?include_deleted=${includeSpecial}`);
        return response.data;
      } catch (error: any) {
        toast.error("Failed to load my exhibit cards.");
        console.error("Error fetching my exhibit cards:", error);
        throw new Error(error?.response?.data?.detail || error.message || "Error fetching my exhibit cards");
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};
