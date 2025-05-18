import { createContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const toggleLike = async (id: string) => {
    try {
      const response = await apiClient.post(`likes/${id}/`);
      const { is_liked, like_count, detail } = response.data;

      // Update your local context state
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

      // **Update React Query cache to keep UI in sync with latest like status**
      queryClient.setQueryData(["artworkStatus", id], (oldData: any) => ({
        ...oldData,
        isLiked: is_liked,
        // optionally update likeCount if you have it in the cache
        likeCount: like_count !== undefined ? like_count : oldData?.likeCount,
      }));

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
