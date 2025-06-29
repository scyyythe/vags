import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface Artwork {
  id: string;
  title: string;
  artistName: string;
  artist: string;
  artist_id: string;
  description: string;
  profile_picture: string;
  category: string;
  medium: string;
  status: string;
  price: number;
  visibility: string;
  created_at: string;
  image_url: string;
  likes_count: number;
  artistImage: string;
  style: string;
  datePosted: string;
  artworkImage: string;
  likesCount: number;
}
const fetchPopularArtworks = async (limit = 5): Promise<Artwork[]> => {
  try {
    const response = await apiClient.get("art/list/", {
      params: { sort: "likes", limit },
    });

    const artworks = response.data.map((artwork: Artwork) => ({
      id: artwork.id,
      title: artwork.title,
      artistName: artwork.artist,
      artistId: artwork.artist_id,
      artistImage: artwork.profile_picture,
      description: artwork.description,
      style: artwork.category,
      medium: artwork.medium,
      status: artwork.status,
      price: artwork.price,
      visibility: artwork.visibility,
      datePosted: new Date(artwork.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      image_url: artwork.image_url,
      likes_count: artwork.likes_count,
    }));

    return artworks.sort((a, b) => b.likes_count - a.likes_count).slice(0, limit);
  } catch (error) {
    console.error("Error fetching popular artworks: ", error);
    throw error;
  }
};

const useFetchPopularArtworks = (limit = 5) => {
  return useQuery({
    queryKey: ["popular-artworks", limit],
    queryFn: () => fetchPopularArtworks(limit),
    gcTime: 1000 * 60 * 10,
    staleTime: 1000 * 60 * 5,
  });
};

export default useFetchPopularArtworks;
