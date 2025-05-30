import React, { useState, useEffect, useContext, useCallback, memo } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikedArtworksContext } from "@/context/LikedArtworksProvider";
import { toast } from "sonner";
import TipJarIcon from "../tip_jar/TipJarIcon";
import { useDonation } from "../../../../context/DonationContext";
import ArtCardMenu from "./ArtCardMenu";
import OwnerMenu from "@/components/user_dashboard/own_profile/Menu";
import ArchivedMenu from "@/components/user_dashboard/user_profile/components/status_options/Archived";
import DeletedMenu from "@/components/user_dashboard/user_profile/components/status_options/Deleted";
import { Link } from "react-router-dom";
import useFavorite from "@/hooks/interactions/useFavorite";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { useFetchArtworkById } from "@/hooks/artworks/fetch_artworks/useArtworkDetails";
import useLikeStatus from "@/hooks/interactions/useLikeStatus";
import useHideArtwork from "@/hooks/mutate/visibility/private/useHideArtwork";
import useUnArchivedArtwork from "@/hooks/mutate/visibility/arc/useUnarchivedArtwork";
import useRestoreArtwork from "@/hooks/mutate/visibility/trash/useRestoreArtwork";
import useSubmitReport from "@/hooks/mutate/report/useSubmitReport";
import useReportStatus from "@/hooks/mutate/report/useReportStatus";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
export interface ArtCardProps {
  artwork: Artwork;
  isExplore?: boolean;
  isDeleted?: boolean;
  isArchived?: boolean;
  visibility?: string;
  onButtonClick?: () => void;
  isLikedFromBulk?: boolean;
  isSavedFromBulk?: boolean;
  isReportedFromBulk?: boolean;
  reportStatusFromBulk?: "Pending" | "In Progress" | "Resolved" | null;

  status?: {
    isLiked?: boolean;
    isSaved?: boolean;
  };
  report?: {
    reported?: boolean;
    status?: "Pending" | "In Progress" | "Resolved" | null;
  };
}

const ArtCard = ({
  artwork,
  isExplore = false,
  isDeleted = false,
  isArchived = false,
  visibility = "public",
  onButtonClick,
  isLikedFromBulk,
  isSavedFromBulk,
  isReportedFromBulk,
  reportStatusFromBulk,
  status = { isLiked: false, isSaved: false },
  report,
}: ArtCardProps) => {
  const { id, artistId, artistName, artistImage, artworkImage, title, likesCount = 0 } = artwork;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const { isFavorite, handleFavorite: toggleFavorite } = useFavorite(id, isSavedFromBulk ?? false);

  const { likedArtworks, likeCounts, setLikedArtworks, setLikeCounts, toggleLike } = useContext(LikedArtworksContext);

  const { openPopup } = useDonation();

  const [isDeletedLocally, setIsDeletedLocally] = useState(false);

  const { mutate: hideArtwork } = useHideArtwork();
  const { mutate: unarchiveArtwork } = useUnArchivedArtwork();
  const { mutate: restore } = useRestoreArtwork();
  const { mutate: submitReport } = useSubmitReport();

  const isLiked = typeof isLikedFromBulk === "boolean" ? isLikedFromBulk : likedArtworks[id] ?? false;

  useEffect(() => {
    setLikedArtworks((prev) => ({ ...prev, [id]: isLiked }));
  }, [isLiked, id, setLikedArtworks]);

  const handleLike = () => {
    if (id) {
      toggleLike(id);
    }
  };

  const handleHide = () => {
    setIsHidden(true);
    hideArtwork(id);
    setMenuOpen(false);
  };
  const handleUnarchive = () => {
    unarchiveArtwork(id);
    setMenuOpen(false);
  };
  const handleRestore = () => {
    restore(id);
    setMenuOpen(false);
  };

  const handleReport = (issueDetails: string) => {
    if (isReportedFromBulk) {
      toast.error("You have already reported this artwork.");
      setMenuOpen(false);
      return;
    }

    submitReport({ id, issue_details: issueDetails });
    setMenuOpen(false);
  };

  const handleFavorite = () => {
    toggleFavorite();
    setMenuOpen(false);
  };

  const handleTipJar = () => {
    openPopup({
      id,
      title: title || "Untitled Artwork",
      artistName,
      artworkImage,
      artistId,
    });
  };

  if (isHidden || isDeletedLocally) {
    return null;
  }

  return (
    <div className="art-card h-full text-xs group animate-fadeIn rounded-xl bg-white hover:shadow-lg transition-all duration-300 border 1px border-gray-200 px-4 py-3">
      <div className="py-1 px-1 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to={`/userprofile/${artistId}`}>
            <Avatar className="h-5 w-5 border">
              <AvatarImage src={artistImage} alt={artistName} />
              <AvatarFallback>{(artistName || "?").charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>

          <span className="text-[9px] font-medium">{artistName}</span>
        </div>
        <div className="relative text-gray-500" style={{ height: "24px" }}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`p-1 rounded-full ${menuOpen ? "border border-gray-300 text-black" : ""}`}
          >
            <MoreHorizontal size={14} />
          </button>

          {/* CONDITIONAL MENU */}
          {isExplore ? (
            <ArtCardMenu
              isOpen={menuOpen}
              onFavorite={handleFavorite}
              onHide={handleHide}
              onReport={handleReport}
              isFavorite={status.isSaved}
              isReported={isReportedFromBulk}
            />
          ) : isDeleted ? (
            <DeletedMenu
              artworkId={id}
              isOpen={menuOpen}
              onEdit={() => {
                console.log("Edit artwork");
                setMenuOpen(false);
              }}
              onUnarchive={handleRestore}
              onDelete={() => {
                toast.success("Artwork permanently deleted");
                setIsDeletedLocally(true);
                setMenuOpen(false);
              }}
            />
          ) : isArchived ? (
            <ArchivedMenu
              artworkId={id}
              isOpen={menuOpen}
              onEdit={() => console.log("Edit artwork")}
              onUnarchive={handleUnarchive}
              onDelete={() => console.log("Delete artwork")}
            />
          ) : (
            <OwnerMenu
              isOpen={menuOpen}
              artworkId={id}
              artworkTitle={artwork.title}
              onRequestBid={() => console.log("Request to bid", id)}
              onSell={() => console.log("Sell artwork", id)}
              onEdit={() => console.log("Edit artwork", id)}
              onToggleVisibility={(newStatus: boolean) => console.log("Toggle visibility", newStatus, id)}
              onArchive={() => console.log("Archive", id)}
              isPublic={true}
            />
          )}
        </div>
      </div>
      <Link
        to={`/artwork/${artwork.id}`}
        state={{
          artwork,
          isLikedFromBulk: status?.isLiked,
          isSavedFromBulk: status?.isSaved,
          isReportedFromBulk: report?.reported,
          reportStatusFromBulk: report?.status,
        }}
        className="w-full"
      >
        <div className="aspect-square overflow-hidden py-2 px-1">
          <img
            src={artwork.artworkImage}
            alt={`Artwork by ${artwork.artistName}`}
            className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
          />
        </div>
      </Link>

      <div className="px-1 py-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">
            {title ? title.slice(0, 10) + (title.length > 10 ? "..." : "") : "Untitled Artwork"}
          </p>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleLike}
              className={`p-1 rounded-full transition-colors ${
                status.isLiked ? "text-red-600" : "text-gray-400 hover:text-red-600"
              }`}
              aria-label={status.isLiked ? "Unlike" : "Like"}
            >
              <Heart
                size={15}
                className={status.isLiked ? "text-red-600 fill-red-600" : "text-gray-800"}
                fill={status.isLiked ? "currentColor" : "none"}
              />
            </button>

            <span className="text-[9px] text-gray-500">{likeCounts[id] ?? likesCount ?? 0}</span>

            <div
              onClick={(e) => {
                e.stopPropagation();
                handleTipJar();
              }}
            >
              <TipJarIcon onClick={handleTipJar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ArtCard);
