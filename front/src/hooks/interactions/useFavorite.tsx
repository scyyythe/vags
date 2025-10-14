import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const useFavorite = (id: string, initialIsFavorite = false) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleFavorite = () => {
    // Optimistic UI update - change color immediately
    const previousState = isFavorite;
    setIsFavorite((prev) => !prev);

    apiClient
      .post(`saved/${id}/`)
      .then((response) => {
        const { detail } = response.data;

        // Update state based on server response
        setIsFavorite(detail !== "You have unsaved this artwork.");
        queryClient.invalidateQueries({ queryKey: ["artworks"] });
        queryClient.invalidateQueries({ queryKey: ["bulkReportStatus"] });
        queryClient.invalidateQueries({ queryKey: ["artworkReportStatus"] });
        toast.success(detail || (previousState ? "Unsaved artwork." : "You have saved this artwork!"), {
          closeButton: true,
        });
      })
      .catch(() => {
        // Revert optimistic update on error
        setIsFavorite(previousState);
        toast.error("Failed to save artwork");
      });
  };

  return { isFavorite, handleFavorite };
};

export default useFavorite;
