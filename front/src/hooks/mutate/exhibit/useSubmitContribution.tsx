import { useMutation } from "@tanstack/react-query";
import { submitContribution } from "./submitContribution";
import { toast } from "sonner";

export const useSubmitContribution = () => {
  return useMutation({
    mutationFn: submitContribution,
    onSuccess: () => {
      toast.success("Contribution submitted!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error submitting contribution");
    },
  });
};
