import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useFavorite = (id) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const response = await apiClient.get(`/artworks/${id}/status/`);
        setIsFavorite(response.data.isSaved);
      } catch (error) {
        console.error("Failed to fetch favorite status:", error);
      }
    };

    if (id) {
      fetchFavoriteStatus();
    }
  }, [id]);

  const handleFavorite = async () => {
    try {
      const response = await apiClient.post(`saved/${id}/`);
      const { detail } = response.data;

      if (detail === "You have unsaved this artwork.") {
        setIsFavorite(false);
        toast.success("Artwork favorite removed");
      } else {
        setIsFavorite(true);
        toast.success("Artwork added to favorites");
      }
    } catch (error) {
      console.error("Failed to save artwork:", error);
      toast.error("Failed to save artwork");
    }
  };

  return { isFavorite, handleFavorite };
};

export default useFavorite;
