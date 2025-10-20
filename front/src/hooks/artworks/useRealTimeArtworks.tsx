import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getLoggedInUserId } from "@/auth/decode";
import useUserActivity from "@/hooks/useUserActivity";

const useRealTimeArtworks = () => {
  const queryClient = useQueryClient();
  const userId = getLoggedInUserId();
  const { isActive } = useUserActivity();
  const [hasNewArtworks, setHasNewArtworks] = useState(false);

  // Effect that runs when artworks data changes
  useEffect(() => {
    if (!userId || !isActive) return;

    // Get current artworks from cache
    const currentArtworks = queryClient.getQueryData<any[]>(["artworks", 1, undefined, "all", "public", true]) || [];
    const popularArtworks = queryClient.getQueryData<any[]>(["popularArtworks"]) || [];

    // Show visual feedback if there are new artworks (you can customize this logic)
    if (currentArtworks.length > 0 || popularArtworks.length > 0) {
      setHasNewArtworks(true);
      // Reset after a short delay
      const timer = setTimeout(() => setHasNewArtworks(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setHasNewArtworks(false);
    }
  }, [queryClient, userId, isActive]);

  // Function to manually refresh artwork queries
  const refreshArtworks = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          (queryKey.includes("artworks") ||
            queryKey.includes("popularArtworks") ||
            queryKey.includes("explore") ||
            queryKey.includes("feed") ||
            queryKey.includes("profile") ||
            queryKey.includes("user-artworks"))
        );
      },
    });
  };

  return {
    hasNewArtworks,
    refreshArtworks,
  };
};

export default useRealTimeArtworks;
