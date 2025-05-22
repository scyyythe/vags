import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  user_status?: string;
  created_at?: string;
  updated_at?: string;
  profile_picture?: string;
  cover_photo?: string;
  bio?: string;
  contact_number?: string;
  address?: string;
  gender?: "Male" | "Female" | "Other";
  date_of_birth?: string;
  password: string;
}
export interface Bid {
  user?: User;
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
  status: "on_going" | "sold" | "closed" | "no_bidder" | "reauctioned";
  start_bid_amount: number;
  timeRemaining: {
    finished: boolean;
    hrs: number;
    mins: number;
    secs: number;
  };
  viewers: string[];

  joinedByCurrentUser?: boolean;
  isHighestBidder?: boolean | null;
  isLost?: boolean;
}

const fetchAuctions = async (
  currentPage: number,
  userId?: string,
  endpointType: "all" | "created-by-me" | "specific-user" | "participated" = "all"
): Promise<ArtworkAuction[]> => {
  const params: { page: number; limit: number; userId?: string } = {
    page: currentPage,
    limit: 20,
  };

  if (endpointType !== "all" && userId) {
    params.userId = userId;
  }

  let url = "auction/";

  if (endpointType === "created-by-me") {
    url = "auction/list/created-by-me/";
  } else if (endpointType === "specific-user") {
    url = "auction/list/specific-user/";
  } else if (endpointType === "participated") {
    url = "auction/list/participated/";
  }

  const response = await apiClient.get(url, { params });

  return response.data.map((auction: ArtworkAuction) => ({
    ...auction,
    timeRemaining: calculateTimeRemaining(auction.end_time),
    highest_bid: auction.highest_bid ?? null,
  }));
};

const useAuctions = (
  currentPage: number,
  userId?: string,
  enabled = true,
  endpointType: "all" | "created-by-me" | "specific-user" | "participated" = "all"
) => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["auctions", currentPage, userId, endpointType],
    queryFn: () => fetchAuctions(currentPage, userId, endpointType),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled,
  });
};

export default useAuctions;
