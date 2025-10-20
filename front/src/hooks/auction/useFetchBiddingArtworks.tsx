import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "./useAuction";
type FetchBiddingParams = {
  status?: string;
  page?: number;
  limit?: number;
};

const fetchBiddingArtworks = async ({
  status = "on_going",
  page = 1,
  limit = 20,
}: FetchBiddingParams): Promise<ArtworkAuction[]> => {
  const response = await apiClient.get("auction/", {
    params: { status, page, limit },
  });

  const artworks: ArtworkAuction[] = response.data;

  return artworks.map((auction) => ({
    ...auction,
    timeRemaining: calculateTimeRemaining(auction.end_time),
    highest_bid: auction.highest_bid ?? null,
  }));
};

export const useFetchBiddingArtworks = (params?: FetchBiddingParams) => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["biddingArtworks", params],
    queryFn: () => fetchBiddingArtworks(params ?? {}),
    staleTime: 0, // Always consider data stale for real-time updates
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for auction updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
