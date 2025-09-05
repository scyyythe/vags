import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExhibit, ExhibitPayload } from "./exhibit";
import { toast } from "sonner";

export const useCreateExhibit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createExhibit,
    onSuccess: () => {
      toast.success("Exhibit created successfully!");

      queryClient.invalidateQueries({ queryKey: ["exhibit-cards"] });
    },

    onError: (error: any) => {
      if (error.message !== "Banner is required") {
        toast.error(`Error creating exhibit: ${error?.message || "Something went wrong"}`);
      }
    },
  });

  return mutation;
};
