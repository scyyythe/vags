import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface ArtCard {
  id: string;
  title: string;
  medium?: string;
  price: number;
  discounted_price?: number | null;
  total_ratings: number;
  image_url: string[];
  category: string;
  edition?: string;
  artist?: string;
  year_created?: string;
  size?: string;
  art_status?: string;
  visibility?: string;
  artist_id?: string;
  average_rating: number;
  quantity?: number;
  description?: string;
  profile_picture?: string;
}

const fetchArtCards = async () => {
  try {
    const response = await apiClient.get("/art/cards/?page_size=100");

    // Handle paginated response
    if (response.data && typeof response.data === "object" && "results" in response.data) {
      const results = response.data.results;

      if (Array.isArray(results)) {
        return results as ArtCard[];
      } else {
        return [];
      }
    }

    // Fallback for non-paginated response
    if (Array.isArray(response.data)) {
      return response.data as ArtCard[];
    }

    return [];
  } catch (error) {
    return [];
  }
};

const useFetchArtCards = () => {
  return useQuery<ArtCard[], Error>({
    queryKey: ["marketplace-art-cards"],
    queryFn: fetchArtCards,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: false, // Disable automatic polling
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export default useFetchArtCards;
