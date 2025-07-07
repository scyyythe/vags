import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const useExhibitReview = (id: string | undefined) => {
  return useQuery({
    queryKey: ["exhibit-review", id],
    queryFn: async () => {
      if (!id) throw new Error("No exhibit ID");

      try {
        const response = await apiClient.get(`/exhibits/${id}/review/`);
        console.log("Exhibit Review Response:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("Exhibit review fetch error:", error);
        toast.error("Failed to fetch exhibit review");
        throw error;
      }
    },
    enabled: !!id,
  });
};
