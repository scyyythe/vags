import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

interface Artwork {
  id: string;
  title: string;
  artistName: string;
  artist: string;
  description: string;
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
const fetchArtworks = async (currentPage: number): Promise<Artwork[]> => {
  try {
    const response = await apiClient.get("art/list/", {
      params: { page: currentPage, limit: 20 },
    });
    return response.data.map((artwork: Artwork) => ({
      id: artwork.id,
      title: artwork.title,
      artistName: artwork.artist,
      artistImage: "",
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
      artworkImage: artwork.image_url,
      likesCount: artwork.likes_count,
    }));
  } catch (error) {
    console.error("Error fetching artworks: ", error);
    throw error;
  }
};

const useArtworks = (currentPage: number) => {
  return useQuery({
    queryKey: ["artworks", currentPage],
    queryFn: () => fetchArtworks(currentPage),
    staleTime: 1000 * 60 * 5,
  });
};

export default useArtworks;
