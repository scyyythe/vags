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
  isShared: boolean;
}
const fetchArtworks = async (
  currentPage: number,
  userId?: string,
  endpointType: "all" | "created-by-me" | "specific-user" = "all",
  filterVisibility?: "public" | "private" | "hidden" | "deleted" | "archived",
  onlyActivePublic: boolean = false,
  limit: number = 30
): Promise<Artwork[]> => {
  try {
    const params: { page: number; limit: number; userId?: string; visibility?: string } = {
      page: currentPage,
      limit,
    };

    if (filterVisibility) {
      params.visibility = filterVisibility;
    }

    if (endpointType === "created-by-me" || endpointType === "specific-user") {
      params.userId = userId;
    }

    let url = "art/list/bulk/";

    if (endpointType === "created-by-me") {
      url = "art/list/created-by-me/";
    } else if (endpointType === "specific-user") {
      url = "art/list/specific-user/";
    }

    const response = await apiClient.get(url, { params });

    let artworks = response.data.map((artwork: Artwork) => ({
      id: artwork.id,
      title: artwork.title,
      artistName: artwork.artist,
      artistId: artwork.artist_id,
      artistImage: artwork.profile_picture,
      description: artwork.description,
      style: artwork.category,
      category: artwork.category,
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

    if (onlyActivePublic) {
      artworks = artworks.filter((art) => art.status === "Active" && art.visibility === "Public");
    }

    return artworks;
  } catch (error) {
    console.error("Error fetching artworks: ", error);
    throw error;
  }
};
export async function fetchOwnedArtworksCount(userId: string): Promise<number> {
  const artworks = await fetchArtworks(1, userId, "specific-user");
  return artworks.length;
}
const useArtworks = (
  currentPage: number,
  userId?: string,
  enabled: boolean = true,
  endpointType: "all" | "created-by-me" | "specific-user" = "all",
  filterVisibility?: "public" | "private" | "hidden" | "deleted" | "archived",
  onlyActivePublic: boolean = false
) => {
  return useQuery({
    queryKey: ["artworks", currentPage, userId, endpointType, filterVisibility, onlyActivePublic],
    queryFn: () => fetchArtworks(currentPage, userId, endpointType, filterVisibility, onlyActivePublic),
    staleTime: 1000 * 60 * 5,
    enabled: enabled,
    gcTime: 1000 * 60 * 5 

  });
};

export default useArtworks;
