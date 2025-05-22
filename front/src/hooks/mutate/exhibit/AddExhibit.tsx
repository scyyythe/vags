import { useMutation } from "@tanstack/react-query";
import { createExhibit, ExhibitPayload } from "./exhibit";
import { toast } from "sonner";
export const useCreateExhibit = () => {
  return useMutation({
    mutationFn: createExhibit,
    onSuccess: () => {
      toast.success("Exhibit created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Error creating exhibit: ${error?.message || "Something went wrong"}`);
    },
  });
};
