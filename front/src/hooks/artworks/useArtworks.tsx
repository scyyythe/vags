import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface Artwork {
  id: string;
  title: string;
  artistName: string;
  artist_id: string;
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

const fetchArtworks = async (
  currentPage: number,
  userId?: string,
  endpointType: "all" | "created-by-me" = "all"
): Promise<Artwork[]> => {
  try {
    const params: { page: number; limit: number; userId?: string } = {
      page: currentPage,
      limit: 20,
    };

    let url = "art/list/";

    if (endpointType === "created-by-me") {
      url = "art/list/created-by-me/";
    }

    const response = await apiClient.get(url, { params });

    return response.data.map((artwork: Artwork) => ({
      id: artwork.id,
      title: artwork.title,
      artistName: artwork.artist,
      artistId: artwork.artist_id,
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

const useArtworks = (
  currentPage: number,
  userId?: string,
  enabled: boolean = true,
  endpointType: "all" | "created-by-me" = "all",
  filterCategory?: string
) => {
  return useQuery({
    queryKey: ["artworks", currentPage, userId, endpointType],
    queryFn: () => fetchArtworks(currentPage, userId, endpointType),
    staleTime: 1000 * 60 * 5,
    enabled: enabled,
  });
};

export default useArtworks;
