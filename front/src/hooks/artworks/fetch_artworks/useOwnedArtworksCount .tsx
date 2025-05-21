import { useEffect, useState } from "react";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";

function useOwnedArtworksCount(userId: string) {
  const [ownedCount, setOwnedCount] = useState(0);
  const { data, isLoading } = useArtworks(1, userId, true, "specific-user");

  useEffect(() => {
    if (!isLoading && data) {
      const ownedArtworks = data.filter(
        (artwork) =>
          (artwork.artistId === userId || artwork.artistId === userId || artwork.artistId === userId) &&
          artwork.visibility === "Public" &&
          (artwork.status === "Active" || artwork.status === "OnBid")
      );
      setOwnedCount(ownedArtworks.length);
    }
  }, [data, isLoading, userId]);

  return ownedCount;
}

export default useOwnedArtworksCount;
