import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "./useAuction";

const fetchBiddingArtworks = async (): Promise<ArtworkAuction[]> => {
  const response = await apiClient.get("auction/");
  const artworks: ArtworkAuction[] = response.data;

  return artworks
    .filter((auction) => auction.status === "on_going")
    .map((auction) => ({
      ...auction,
      timeRemaining: calculateTimeRemaining(auction.end_time),
      highest_bid: auction.highest_bid ?? null,
    }));
};

export const useFetchBiddingArtworks = () => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["biddingArtworks"],
    queryFn: fetchBiddingArtworks,
    staleTime: 1000 * 60 * 5,
   
  });
};
