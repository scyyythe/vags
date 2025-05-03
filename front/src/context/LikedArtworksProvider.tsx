// src/context/LikedArtworksContext.tsx
import { createContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";

export type LikedArtwork = {
  id: string;
  isLiked: boolean;
};

type LikedArtworksContextType = {
  likedArtworks: Record<string, boolean>;
  likeCounts: Record<string, number>;
  toggleLike: (id: string) => void;
  setLikedArtworks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setLikeCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
};

export const LikedArtworksContext = createContext<LikedArtworksContextType>({
  likedArtworks: {},
  likeCounts: {},
  toggleLike: () => {},
  setLikedArtworks: () => {},
  setLikeCounts: () => {},
});

export const LikedArtworksProvider = ({ children }: { children: ReactNode }) => {
  const [likedArtworks, setLikedArtworks] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const toggleLike = async (id: string) => {
    try {
      const response = await apiClient.post(`likes/${id}/`);

      const { is_liked, like_count, detail } = response.data;

      setLikedArtworks((prev) => ({ ...prev, [id]: is_liked }));

      if (like_count !== undefined) {
        setLikeCounts((prev) => ({ ...prev, [id]: like_count }));
      } else {
        setLikeCounts((prev) => {
          const prevCount = prev[id] || 0;
          const newCount = is_liked ? prevCount + 1 : Math.max(prevCount - 1, 0);
          return { ...prev, [id]: newCount };
        });
      }

      toast(detail || (is_liked ? "You liked this artwork." : "You unliked this artwork."));
    } catch (error) {
      console.error("Like operation failed:", error);
      toast("Failed to update like status");
    }
  };

  return (
    <LikedArtworksContext.Provider value={{ likedArtworks, likeCounts, toggleLike, setLikedArtworks, setLikeCounts }}>
      {children}
    </LikedArtworksContext.Provider>
  );
};
