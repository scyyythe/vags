import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitContribution } from "./submitContribution";
import { toast } from "sonner";

export const useSubmitContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitContribution,
    onSuccess: () => {
      toast.success("Contribution submitted!");
      
      // Invalidate notifications since the backend creates notifications for the exhibit owner
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error submitting contribution");
    },
  });
};
