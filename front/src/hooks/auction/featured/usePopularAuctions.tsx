import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "../useAuction";

const fetchPopularAuctions = async (): Promise<ArtworkAuction[]> => {
  const response = await apiClient.get("auction/popular/");
  return response.data.map((auction: ArtworkAuction) => ({
    ...auction,
    timeRemaining: calculateTimeRemaining(auction.end_time),
    highest_bid: auction.highest_bid ?? null,
  }));
};

const usePopularAuctions = () => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["popular-auctions"],
    queryFn: fetchPopularAuctions,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export default usePopularAuctions;
