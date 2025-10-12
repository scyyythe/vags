import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface TopArtwork {
  id: string;
  title: string;
  image_url: string | null;
  profile_picture: string | null;
  starting_price: number | null;
  buyers: number;
  edition: number;
  sold_count: number;
  artist_name: string;
  change24h: string;
  change7d: string;
  category?: string;
  medium?: string;
}

export interface TopArtworksFilters {
  category?: string;
  medium?: string;
  timeRange?: string;
}

const fetchTopArtworks = async (filters?: TopArtworksFilters): Promise<TopArtwork[]> => {
  const params = new URLSearchParams();

  if (filters?.category && filters.category !== "All") {
    params.append("category", filters.category);
  }

  if (filters?.medium && filters.medium !== "Medium") {
    params.append("medium", filters.medium);
  }

  if (filters?.timeRange) {
    // Convert time range to backend format
    const timeRangeMap: Record<string, string> = {
      "Last 7 days": "7d",
      "Last 30 days": "30d",
      "All time": "all",
    };
    params.append("time_range", timeRangeMap[filters.timeRange] || "7d");
  }

  const queryString = params.toString();
  const url = queryString ? `/top-artworks/?${queryString}` : "/top-artworks/";

  const { data } = await apiClient.get(url);
  return data;
};

const useTopArtworks = (filters?: TopArtworksFilters) => {
  return useQuery<TopArtwork[]>({
    queryKey: ["top-artworks", filters],
    queryFn: () => fetchTopArtworks(filters),
  });
};

export default useTopArtworks;
