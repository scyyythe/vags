import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

// Function to calculate remaining time in hours, minutes, and seconds
const calculateTimeRemaining = (endTime: string) => {
  const endDate = new Date(endTime);
  const now = new Date();

  const timeDiff = endDate.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return { hrs: 0, mins: 0, secs: 0 };
  }

  const hrs = Math.floor(timeDiff / (1000 * 60 * 60));
  const mins = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return { hrs, mins, secs };
};

export interface AuctionArtwork {
  id: string;
  title: string;
  artist: string;
  artistAvatar: string;
  description: string;
  image_url: string;
  likes: number;
  views: number;
}

export interface ArtworkAuction {
  id: string;
  artwork: AuctionArtwork;
  highestBid: number | null;
  end_time: string;
  status: boolean;
  timeRemaining: { hrs: number; mins: number; secs: number }; // Added this field
}

export const useFetchBiddingArtworks = () => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["biddingArtworks"],
    queryFn: async () => {
      const response = await apiClient.get("auction/");

      // Map through the fetched data and calculate the remaining time for each artwork
      const updatedArtworks = response.data.map((artwork: ArtworkAuction) => {
        const timeRemaining = calculateTimeRemaining(artwork.end_time);
        return { ...artwork, timeRemaining }; // Add timeRemaining to each artwork
      });

      console.log("Updated Auction response:", updatedArtworks);
      return updatedArtworks; // Return updated data
    },

    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
