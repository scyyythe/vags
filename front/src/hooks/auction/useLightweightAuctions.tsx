// hooks/auction/useLightweightAuctions.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";

export interface LightBid {
  bidderFullName: string;
  amount: number;
  timestamp: string;
}

export interface LightArtwork {
  id: string;
  title: string;
  image_url: string;
}

export interface LightweightAuction {
  id: string;
  artwork: LightArtwork;
  start_bid_amount: number;
  start_time: string;
  end_time: string;
  status: string;
  highest_bid: LightBid | null;
  timeRemaining: {
    finished: boolean;
    hrs: number;
    mins: number;
    secs: number;
  };
}

const fetchLightAuctions = async (page: number): Promise<LightweightAuction[]> => {
  const response = await apiClient.get("/auction/light-cards/", {
    params: { page, limit: 100 },
  });

  return response.data.map((auction: LightweightAuction) => ({
    ...auction,
    timeRemaining: calculateTimeRemaining(auction.end_time),
  }));
};

const useLightweightAuctions = (page = 1) => {
  return useQuery<LightweightAuction[]>({
    queryKey: ["light-auctions", page],
    queryFn: () => fetchLightAuctions(page),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
};

export default useLightweightAuctions;
