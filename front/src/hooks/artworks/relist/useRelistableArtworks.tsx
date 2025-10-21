import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { useMySoldArtworks } from "@/hooks/purchase/useMySoldArtworks";

export interface RelistableArtwork {
  id: string;
  title: string;
  artworkImage: string;
  originalPrice: number;
  status: string;
  reason: string;
  category: string;
  artist_id: string;
  price: number;
  rating: number;
}

export const useRelistableArtworks = () => {
  // Get sold artworks data (for cancelled/refunded transactions)
  const { data: soldArtworks = [], isLoading: isSoldArtworksLoading } = useMySoldArtworks();

  // Get cancelled/refunded transactions specifically
  const { data: cancelledSoldArtworks = [], isLoading: isCancelledLoading } = useMySoldArtworks({
    status: "Cancelled",
  });
  const { data: refundedSoldArtworks = [], isLoading: isRefundedLoading } = useMySoldArtworks({
    status: "Refunded",
  });

  return useQuery<RelistableArtwork[], Error>({
    queryKey: ["relistable-artworks", soldArtworks, cancelledSoldArtworks, refundedSoldArtworks],
    queryFn: async () => {
      // Get unlisted artworks from the main artwork API
      const response = await apiClient.get("/art/cards/my/");
      const allArtworks = response.data;

      console.log("🔍 All artworks from API:", allArtworks);
      console.log("🔍 Sold artworks data:", soldArtworks);
      console.log("🔍 Cancelled sold artworks:", cancelledSoldArtworks);
      console.log("🔍 Refunded sold artworks:", refundedSoldArtworks);

      // 1. Filter unlisted artworks (draft, inactive, unlisted)
      const unlistedArtworks = allArtworks
        .filter((art: any) => {
          const status = (art.art_status || "").trim().toLowerCase();
          const isUnlisted = ["unlisted", "draft", "inactive"].includes(status);
          console.log(`🔍 Artwork "${art.title}" - Status: "${status}" - Unlisted: ${isUnlisted}`);
          return isUnlisted;
        })
        .map((art: any) => ({
          id: art.id,
          title: art.title,
          artworkImage: art.image_url?.[0] || "",
          originalPrice: art.discounted_price ?? art.price,
          status: (art.art_status || "").trim().toLowerCase(),
          reason: getRelistReason(art.art_status),
          category: art.category,
          artist_id: art.artist_id,
          price: art.discounted_price ?? art.price,
          rating: art.total_ratings || 0,
        }));

      // 2. Process cancelled sold artworks
      const cancelledArtworks = cancelledSoldArtworks.map((sale: any) => {
        console.log(`🔍 Processing cancelled sale:`, sale);
        return {
          id: sale.artwork_id || sale.id,
          title: sale.artwork_title || sale.title,
          artworkImage: sale.artwork_image || sale.artworkImage || "",
          originalPrice: sale.price,
          status: "cancelled",
          reason: "Order was cancelled",
          category: sale.artwork_style || sale.artwork?.style || "Art",
          artist_id: sale.artist_id,
          price: sale.price,
          rating: sale.review?.rating || 0,
        };
      });

      // 3. Process refunded sold artworks
      const refundedArtworks = refundedSoldArtworks.map((sale: any) => {
        console.log(`🔍 Processing refunded sale:`, sale);
        return {
          id: sale.artwork_id || sale.id,
          title: sale.artwork_title || sale.title,
          artworkImage: sale.artwork_image || sale.artworkImage || "",
          originalPrice: sale.price,
          status: "refunded",
          reason: "Order was refunded",
          category: sale.artwork_style || sale.artwork?.style || "Art",
          artist_id: sale.artist_id,
          price: sale.price,
          rating: sale.review?.rating || 0,
        };
      });

      // 4. Combine all sources
      const relistableArtworks = [...unlistedArtworks, ...cancelledArtworks, ...refundedArtworks];

      console.log("🔍 Unlisted artworks:", unlistedArtworks);
      console.log("🔍 Cancelled artworks:", cancelledArtworks);
      console.log("🔍 Refunded artworks:", refundedArtworks);
      console.log("🔍 Combined relistable artworks:", relistableArtworks);
      console.log("🔍 Total relistable artworks count:", relistableArtworks.length);

      return relistableArtworks;
    },
    enabled: !isSoldArtworksLoading && !isCancelledLoading && !isRefundedLoading,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: false, // Disable automatic polling
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

const getRelistReason = (status: string): string => {
  const normalizedStatus = (status || "").trim().toLowerCase();

  switch (normalizedStatus) {
    case "cancelled":
      return "Order was cancelled";
    case "refunded":
      return "Order was refunded";
    case "unlisted":
      return "Artwork was unlisted";
    case "draft":
      return "Draft artwork";
    case "inactive":
      return "Artwork became inactive";
    default:
      return "Available for relisting";
  }
};
