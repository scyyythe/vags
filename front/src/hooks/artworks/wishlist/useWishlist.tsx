import { useState } from "react";
import apiClient from "@/utils/apiClient"; 

export const useWishlist = (initialLiked: string[] = []) => {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set(initialLiked));

  const toggleLike = async (artId: string) => {
    try {
      const res = await apiClient.post(`/wishlist/toggle/${artId}/`);
      const action = res?.data?.message?.includes("Removed") ? "removed" : "added";

      setLikedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(artId)) {
          newSet.delete(artId);
        } else {
          newSet.add(artId);
        }
        return newSet;
      });

      return action;
    } catch (err) {
      console.error("💥 Error toggling wishlist:", err);
      throw err;
    }
  };

  return {
    likedItems,
    toggleLike,
    isLiked: (id: string) => likedItems.has(id),
  };
};
