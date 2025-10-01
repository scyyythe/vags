import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
const useFavorite = (id, initialIsFavorite = false) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);
  const queryClient = useQueryClient();

  const handleFavorite = async () => {
    try {
      const response = await apiClient.post(`saved/${id}/`);
      const { detail } = response.data;
      setIsFavorite(detail !== "You have unsaved this artwork.");

      queryClient.invalidateQueries({ queryKey: ["artworks"] });

      toast("You have saved this artwork!", { closeButton: true });
    } catch (error) {
      toast.error("Failed to save artwork");
    }
  };

  return { isFavorite, handleFavorite };
};

export default useFavorite;
