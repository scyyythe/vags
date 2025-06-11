import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

export const useExhibitCardDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["exhibit-card", id],
    queryFn: async () => {
      if (!id) throw new Error("No exhibit ID provided");

      try {
        const response = await apiClient.get(`/exhibits/${id}/`);
        devLog("Exhibit Card Detail Response:", response.data);
        return response.data;
      } catch (error: any) {
        toast.error("Failed to load exhibit details.");
        console.error("Error fetching exhibit detail:", error);
        throw new Error(
          error?.response?.data?.detail ||
          error.message ||
          "Error fetching exhibit details"
        );
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
