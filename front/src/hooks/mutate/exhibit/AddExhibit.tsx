import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExhibit, ExhibitPayload } from "./exhibit";
import { toast } from "sonner";

export const useCreateExhibit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createExhibit,
    onSuccess: () => {
      toast.success("Exhibit created successfully!");

      // Invalidate exhibit queries
      queryClient.invalidateQueries({ queryKey: ["exhibit-cards"] });
      
      // Invalidate notifications query so collaborators see the new notification
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },

    onError: (error: any) => {
      if (error.message !== "Banner is required") {
        toast.error(`Error creating exhibit: ${error?.message || "Something went wrong"}`);
      }
    },
  });

  return mutation;
};
