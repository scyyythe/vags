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
    setIsFavorite((prev) => !prev);

    apiClient
      .post(`saved/${id}/`)
      .then((response) => {
        const { detail } = response.data;

        setIsFavorite(detail !== "You have unsaved this artwork.");
        queryClient.invalidateQueries({ queryKey: ["artworks"] });
        toast(detail || (isFavorite ? "Unsaved artwork." : "You have saved this artwork!"), { closeButton: true });
      })
      .catch(() => {
        setIsFavorite((prev) => !prev);
        toast.error("Failed to save artwork");
      });
  };

  return { isFavorite, handleFavorite };
};

export default useFavorite;
