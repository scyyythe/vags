import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { AxiosError } from "axios";

type UndoAuctionReportInput = {
  id: string; // auction id
};

const undoAuctionReport = async ({ id }: UndoAuctionReportInput): Promise<any> => {
  if (!id) throw new Error("Auction ID is required.");

  const response = await apiClient.delete("/reports/undo/", {
    data: {
      id,
      type: "auction",
    },
  });

  return response.data;
};

const useUndoAuctionReport = () => {
  const queryClient = useQueryClient();

  const { mutate: undoReport } = useMutation({
    mutationFn: undoAuctionReport,

    onSuccess: (_, { id }) => {
      toast.success("Auction report has been undone.");
      queryClient.invalidateQueries({ queryKey: ["auctionReportStatus", id] });
      queryClient.invalidateQueries({ queryKey: ["auctionReportStatusBulk"] });
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
      toast.error("Invalid auction ID.");
      return;
    }
    undoReport({ id });
  };

  return { handleUndoReport };
};

export default useUndoAuctionReport;
