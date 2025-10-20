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
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for new marketplace items
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};

export default useFetchArtCards;
