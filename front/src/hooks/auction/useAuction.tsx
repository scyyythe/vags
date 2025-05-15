import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";

export interface Bid {
  bidderFullName: string;
  amount: number;
  timestamp: string;
  identity_type: "anonymous" | "username" | "fullName";
}

export interface AuctionArtwork {
  id: string;
  title: string;
  artist: string;
  artist_id: string;
  category: string;
  artistAvatar: string;
  description: string;
  image_url: string;
  likes_count: number;
  medium: string;
  price: number;
  profile_picture: string;
  size: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export interface ArtworkAuction {
  id: string;
  artwork: AuctionArtwork;
  highest_bid: Bid | null;
  bid_history: Bid[];
  end_time: string;
  start_time: string;
  status: boolean;
  start_bid_amount: number;
  timeRemaining: {
    finished: boolean;
    hrs: number;
    mins: number;
    secs: number;
  };
}

export const useFetchBiddingArtworks = () => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["biddingArtworks"],
    queryFn: async () => {
      const response = await apiClient.get("auction/");

      const updatedArtworks = response.data.map((artwork: ArtworkAuction) => {
        const timeRemaining = calculateTimeRemaining(artwork.end_time);
        return {
          ...artwork,
          timeRemaining,
          highest_bid: artwork.highest_bid ?? null,
        };
      });
      console.log("Updated Auction response:", updatedArtworks);
      return updatedArtworks;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
