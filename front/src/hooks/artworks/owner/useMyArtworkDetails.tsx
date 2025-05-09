import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import fetchArtworksByArtistId from "@/hooks/artworks/owner/useMyCard";

const useMyArtworkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { data: artwork, isLoading, error } = fetchArtworksByArtistId(id!);

  const state = location.state || {};

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

  const image = state.artworkImage || artwork?.image || "";
  const title = state.title || artwork?.title || "Untitled Artwork";
  const artistId = artwork?.artist_id || "Unknown ID";
  const artist = state.artistName || artwork?.artist || "Unknown Artist";
  const likes = state.likesCount ?? artwork?.likes_count ?? 0;
  const style = artwork?.style || "Painting";
  const description = state.description || artwork?.description || "No description available.";
  const medium = state.medium || artwork?.medium || "Unknown Medium";
  const status = state.status || artwork?.status || "Unknown Status";
  const price = state.price || artwork?.price || 0;
  const visibility = state.visibility || artwork?.visibility || "Public";

  return {
    id,
    image,
    title,
    artistId,
    artist,
    likes,
    style,
    description,
    medium,
    status,
    price,
    visibility,
    datePosted,
    isLoading,
    error,
  };
};

export default useMyArtworkDetails;
