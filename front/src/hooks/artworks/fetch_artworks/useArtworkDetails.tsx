import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { Artwork } from "./useArtworks";

export const useFetchArtworkById = (id: string) => {
  return useQuery<Artwork, Error>({
    queryKey: ["artworks", id],
    queryFn: async () => {
      const response = await apiClient.get(`art/${id}/`);
      const artwork = response.data;
      
      // Map the response to match the Artwork interface, similar to useArtworks.tsx
      return {
        ...artwork,
        datePosted: new Date(artwork.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        // Ensure other fields are properly mapped
        artistName: artwork.artist || artwork.artistName || "",
        artist_id: artwork.artist_id || artwork.artistId || "",
        artistId: artwork.artist_id || artwork.artistId || "",
        artist: artwork.artist || artwork.artistName || "",
        style: artwork.category || artwork.style || "",
        category: artwork.category || "",
        status: artwork.art_status || artwork.status || "",
        art_status: artwork.art_status || "",
        likes_count: artwork.likes_count || artwork.likesCount || 0,
        likesCount: artwork.likes_count || artwork.likesCount || 0,
        artworkImage: artwork.artworkImage || (artwork.image_url && artwork.image_url[0]) || "",
        image_url: artwork.image_url || [],
        profile_picture: artwork.profile_picture || artwork.artistImage || "",
        artistImage: artwork.profile_picture || artwork.artistImage || "",
        isShared: artwork.isShared || false,
      };
    },
    enabled: Boolean(id && id.trim() !== ""),
    staleTime: 5 * 60 * 1000,
    
    refetchOnWindowFocus: false,
  });
};
