import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface Artwork {
  id: string;
  title: string;
  artistName: string;
  profile_picture: string;
  artist_id: string;
  artistId: string;
  artist: string;
  description: string;
  category: string;
  medium: string;
  size: string;
  status: string;
  art_status: string;
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
  endpointType: "all" | "created-by-me" | "specific-user" = "all",
  filterVisibility?: "public" | "private"
): Promise<Artwork[]> => {
  try {
    const params: { page: number; limit: number; userId?: string; visibility?: string } = {
      page: currentPage,
      limit: 20,
    };

    if (filterVisibility) {
      params.visibility = filterVisibility;
    }

    if (endpointType === "created-by-me") {
      params.userId = userId;
    }
    if (endpointType === "specific-user") {
      params.userId = userId;
    }

    let url = "art/list/";

    if (endpointType === "created-by-me") {
      url = "art/list/created-by-me/";
    } else if (endpointType === "specific-user") {
      url = "art/list/specific-user/";
    }

    const response = await apiClient.get(url, { params });

    return response.data.map((artwork: Artwork) => ({
      id: artwork.id,
      title: artwork.title,
      artistName: artwork.artist,
      artistId: artwork.artist_id,
      artistImage: artwork.profile_picture,
      description: artwork.description,
      style: artwork.category,
      medium: artwork.medium,
      size: artwork.size,
      status: artwork.art_status,

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
  endpointType: "all" | "created-by-me" | "specific-user" = "all",
  filterVisibility?: "public" | "private"
) => {
  return useQuery({
    queryKey: ["artworks", currentPage, userId, endpointType, filterVisibility],
    queryFn: () => fetchArtworks(currentPage, userId, endpointType, filterVisibility),
    staleTime: 1000 * 60 * 5,
    enabled: enabled,
  });
};

export default useArtworks;
