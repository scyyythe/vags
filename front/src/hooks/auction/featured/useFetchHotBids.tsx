import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "../useAuction";
const fetchHotBids = async (): Promise<ArtworkAuction[]> => {
  const response = await apiClient.get("auction/", {
    params: {
      page: 1,
      limit: 5, 
    },
  });

  const artworks: ArtworkAuction[] = response.data;

  return artworks
    .map((auction) => ({
      ...auction,
      timeRemaining: calculateTimeRemaining(auction.end_time),
      highest_bid: auction.highest_bid ?? null,
    }))
    .filter((auction) => auction.highest_bid !== null); 
};

export const useFetchHotBids = () => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["hotBids"],
    queryFn: fetchHotBids,
    staleTime: 1000 * 60 * 5,
  });
};
