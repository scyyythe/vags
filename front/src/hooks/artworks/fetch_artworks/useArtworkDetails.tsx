import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import useArtworkQuery from "../fetch_artworks/useCardArtwork";

const useArtworkDetails = (explicitArtId?: string) => {
  const { id: routeParamId } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state || {};

  const artId = explicitArtId || routeParamId;

  const { data: artwork, isLoading, error } = useArtworkQuery(artId!);

  const datePosted = useMemo(() => {
    const formattedDate =
      state.datePosted ||
      artwork?.created_at ||
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    if (artwork?.created_at && typeof artwork.created_at === "string") {
      return new Date(artwork.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return formattedDate;
  }, [state.datePosted, artwork?.created_at]);

  return {
    data: {
      id: artId,
      image: state.artworkImage || artwork?.image_url || "",
      title: state.title || artwork?.title || "Untitled Artwork",
      artistId: artwork?.artist_id || "Unknown ID",
      artist: state.artistName || artwork?.artist || "Unknown Artist",
      likes: state.likesCount ?? artwork?.likes_count ?? 0,
      style: state.style || artwork?.category || "Painting",
      description: state.description || artwork?.description || "No description available.",
      medium: state.medium || artwork?.medium || "Unknown Medium",
      size: state.size || artwork?.size || "No Size Provided",
      status: state.status || artwork?.status || "Unknown Status",
      price: state.price || artwork?.price || 0,
      visibility: state.visibility || artwork?.visibility || "Public",
      datePosted,
    },
    isLoading,
    error,
  };
};

export default useArtworkDetails;
