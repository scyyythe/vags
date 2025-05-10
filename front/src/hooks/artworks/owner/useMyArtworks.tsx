import { useQuery, UseQueryResult, UseQueryOptions } from "@tanstack/react-query";
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

const fetchMyArtworks = async (currentPage: number, userId?: string): Promise<Artwork[]> => {
  const params: { page: number; limit: number; userId?: string } = {
    page: currentPage,
    limit: 20,
  };
  if (userId) params.userId = userId;

  const response = await apiClient.get("art/list/created-by-me/", { params });

  return response.data.map((artwork: Artwork) => ({
    id: artwork.id,
    title: artwork.title,
    artistName: artwork.artist,
    artist_id: artwork.artist_id,
    artist: artwork.artist,
    description: artwork.description,
    category: artwork.category,
    medium: artwork.medium,
    status: artwork.status,
    price: artwork.price,
    visibility: artwork.visibility,
    created_at: artwork.created_at,
    image_url: artwork.image_url,
    likes_count: artwork.likes_count,
    artistImage: "", // You can modify this based on actual data
    style: artwork.category,
    datePosted: new Date(artwork.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    artworkImage: artwork.image_url,
    likesCount: artwork.likes_count,
  }));
};

const useMyArtworks = (
  currentPage: number,
  userId?: string,
  enabled: boolean = true
): UseQueryResult<Artwork[], Error> => {
  const queryOptions: UseQueryOptions<Artwork[], Error> = {
    queryKey: ["artworks", currentPage, userId],
    queryFn: () => fetchMyArtworks(currentPage, userId),
    staleTime: 1000 * 60 * 5,

    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  };

  return useQuery(queryOptions);
};

export default useMyArtworks;
