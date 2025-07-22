import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { AxiosError } from "axios";

type UndoExhibitReportInput = {
  id: string;
};

const undoExhibitReport = async ({ id }: UndoExhibitReportInput): Promise<any> => {
  if (!id) throw new Error("Exhibit ID is required.");

  const response = await apiClient.delete("/reports/undo/", {
    data: {
      id,
      type: "exhibit",
    },
  });

  return response.data;
};

const useUndoExhibitReport = () => {
  const queryClient = useQueryClient();

  const { mutate: undoReport } = useMutation({
    mutationFn: undoExhibitReport,

    onSuccess: (_, { id }) => {
      toast.success("Exhibit report has been undone.");
      queryClient.invalidateQueries({ queryKey: ["exhibitReportStatus", id] });
      queryClient.invalidateQueries({ queryKey: ["exhibitReportStatusBulk"] });
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

  const handleUndoReport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!id) {
      toast.error("Invalid exhibit ID.");
      return;
    }
    undoReport({ id });
  };

  return { handleUndoReport };
};

export default useUndoExhibitReport;
