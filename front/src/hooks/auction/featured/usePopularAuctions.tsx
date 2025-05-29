import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "../useAuction";
const fetchPopularAuctions = async (): Promise<ArtworkAuction[]> => {
  const params = { page: 1, limit: 100 };
  const response = await apiClient.get("auction/", { params });

  const ongoingAuctions = response.data.filter(
    (auction: ArtworkAuction) => auction.status === "on_going" || auction.status === "reauctioned"
  );
  const sorted = ongoingAuctions.sort(
    (a: ArtworkAuction, b: ArtworkAuction) => b.auction_likes_count - a.auction_likes_count
  );

  const top4 = sorted.slice(0, 4);

  return top4.map((auction: ArtworkAuction) => ({
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
