import { useEffect, useState } from "react";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";

function useOwnedArtworksCount(userId: string) {
  const [ownedCount, setOwnedCount] = useState(0);
  const { data, isLoading } = useArtworks(1, userId, true, "specific-user");

  useEffect(() => {
    if (!isLoading && data) {
      setOwnedCount(data.length);
    }
  }, [data, isLoading]);

  return ownedCount;
}

export default useOwnedArtworksCount;
