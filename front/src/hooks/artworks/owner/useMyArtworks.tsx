import { useQuery, UseQueryResult, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
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

// Define the type of response we expect from the API
interface ApiResponse {
  id: string;
  title: string;
  artist: string;
  artist_id: string;
  description: string;
  category: string;
  medium: string;
  status: string;
  price: number;
  visibility: string;
  created_at: string;
  image_url: string;
  likes_count: number;
  artistImage?: string; // Optional
  style?: string; // Optional
}

const fetchMyArtworks = async (currentPage: number, userId?: string): Promise<Artwork[]> => {
  const params: { page: number; limit: number; userId?: string } = {
    page: currentPage,
    limit: 20,
  };
  if (userId) params.userId = userId;

  const response = await apiClient.get("art/list/created-by-me/", { params });

  // Map the response to the Artwork type
  return response.data.map((artwork: ApiResponse) => ({
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
    artistImage: artwork.artistImage || "",
    style: artwork.style || artwork.category,
    datePosted: new Date(artwork.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    artworkImage: artwork.image_url,
    likesCount: artwork.likes_count,
  }));
};

const useMyArtworks = (currentPage: number, userId?: string): UseQueryResult<Artwork[], Error> => {
  const queryClient = useQueryClient(); // Initialize the query client

  // Read initial data from localStorage if available
  const cachedData = localStorage.getItem("artworks");
  const initialData = cachedData ? JSON.parse(cachedData) : undefined;

  const queryOptions: UseQueryOptions<Artwork[], Error> = {
    queryKey: ["artworks", currentPage, userId],
    queryFn: () => fetchMyArtworks(currentPage, userId),
    staleTime: 1000 * 60 * 5, // Cache the data for 5 minutes
    initialData, // Set initial data from localStorage
    refetchOnWindowFocus: false, // Disable refetch when window is focused
    refetchOnMount: false, // Disable refetch on mount
    refetchOnReconnect: false, // Disable refetch on reconnect
  };

  const query = useQuery(queryOptions);

  // If the query is successful, save the fetched data to localStorage
  if (query.isSuccess && query.data) {
    localStorage.setItem("artworks", JSON.stringify(query.data));
  }

  return query;
};

export default useMyArtworks;
