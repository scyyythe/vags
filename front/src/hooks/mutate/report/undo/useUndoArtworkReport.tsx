import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { AxiosError } from "axios";

type UndoArtworkReportInput = {
  id: string; // artwork id
};

const undoArtworkReport = async ({ id }: UndoArtworkReportInput): Promise<any> => {
  if (!id) throw new Error("Artwork ID is required.");

  const response = await apiClient.delete("/reports/undo/", {
    data: {
      id,
      type: "artwork",
    },
  });

  return response.data;
};

const useUndoArtworkReport = () => {
  const queryClient = useQueryClient();

  const { mutate: undoReport } = useMutation({
    mutationFn: undoArtworkReport,

    onSuccess: (_, { id }) => {
      toast.success("Artwork report has been undone.");
      queryClient.invalidateQueries({ queryKey: ["reportStatus", id] });
      queryClient.invalidateQueries({ queryKey: ["artworkReportStatus", id] });
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-sold-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });
    },

    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.detail || error.response?.data?.error || "";
        toast.error(serverMessage || "Failed to undo report.");
      } else {
        toast.error("Failed to undo report.");
      }
    },
  });

  const handleUndoReport = (
    e: React.MouseEvent,
    id: string,
    onLocalUpdate?: () => void,
    onLocalRevert?: () => void
  ) => {
    e.stopPropagation();
    if (!id) {
      toast.error("Invalid artwork ID.");
      return;
    }

    // Call local update immediately for instant UI feedback
    if (onLocalUpdate) {
      onLocalUpdate();
    }

    undoReport(
      { id },
      {
        onError: () => {
          // Revert local state if undo fails
          if (onLocalRevert) {
            onLocalRevert();
          }
        },
      }
    );
  };

  return { handleUndoReport };
};

export default useUndoArtworkReport;
