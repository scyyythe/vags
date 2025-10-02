// useUpdateExhibit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExhibit } from "./edit-exhibit";
import { toast } from "sonner";
export const useUpdateExhibit = (exhibitId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => updateExhibit(exhibitId, data),
    onSuccess: (updatedExhibit) => {
      console.log("✅ Exhibit updated response:", updatedExhibit);
      console.log("🎨 Artworks after update:", updatedExhibit.artworks);
      console.log("👥 Collaborators after update:", updatedExhibit.collaborators);

      toast.success("Exhibit updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["exhibit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["exhibit", exhibitId] });
    },
    onError: (error: any) => {
      console.error("❌ Error updating exhibit:", error);
      toast.error(`Error updating exhibit: ${error?.message || "Something went wrong"}`);
    },
  });
};
