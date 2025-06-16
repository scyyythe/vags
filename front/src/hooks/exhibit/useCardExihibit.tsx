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
        throw new Error(
          error?.response?.data?.detail ||
          error.message ||
          "Error fetching exhibit cards"
        );
      }
    },
    staleTime: 1000 * 60 * 5,
 
  });
};
