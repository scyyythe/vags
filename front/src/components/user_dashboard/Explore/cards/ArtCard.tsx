import { useState, useEffect, useContext, memo } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikedArtworksContext } from "@/context/LikedArtworksProvider";
import { toast } from "sonner";
import TipJarIcon from "../tip_jar/TipJarIcon";
import { useDonation } from "../../../../context/DonationContext";
import ArtCardMenu from "./ArtCardMenu";
import OwnerMenu from "@/components/user_dashboard/own_profile/menu/art_card/Menu";
import ArchivedMenu from "@/components/user_dashboard/user_profile/components/status_options/Archived";
import DeletedMenu from "@/components/user_dashboard/user_profile/components/status_options/Deleted";
import { Link } from "react-router-dom";
import useFavorite from "@/hooks/interactions/useFavorite";
import ArtCardSkeleton from "@/components/skeletons/artworks/ArtCardSkeleton";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import useHideArtwork, { useUnhideArtwork } from "@/hooks/mutate/visibility/private/useHideArtwork";
import useUnarchiveArtwork from "@/hooks/mutate/visibility/arc/useUnarchiveArtwork";
import useRestoreArtwork from "@/hooks/mutate/visibility/trash/useRestoreArtwork";
import useSubmitReport from "@/hooks/mutate/report/useSubmitReport";
import { getLoggedInUserId } from "@/auth/decode";
import useUpdateArtworkVisibility from "@/hooks/mutate/visibility/private/useUpdateArtworkVisibility";
import useArchivedArtwork from "@/hooks/mutate/visibility/arc/useArchivedArtwork";
import { useQueryClient } from "@tanstack/react-query";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";

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
  const { language } = useLanguage();
  const translatedAlreadyReported = useAutoTranslation("You have already reported this artwork.", language);
  const translatedArtworkPermanentlyDeleted = useAutoTranslation("Artwork permanently deleted", language);
  const translatedUntitledArtwork = useAutoTranslation("Untitled Artwork", language);
  const translatedLike = useAutoTranslation("Like", language);
  const translatedUnlike = useAutoTranslation("Unlike", language);

  const {
    id,
    artistId,
    artistName,
    artistImage,
    default_paypal_email,
    artworkImage,
    image_url,
    title,
    likesCount = 0,
  } = artwork;

  const translatedArtistName = useAutoTranslation(artistName, language);
  const translatedTitle = useAutoTranslation(title, language);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image error when artwork changes
  useEffect(() => {
    setImageError(false);
  }, [artwork.id, artwork.artworkImage]);

  const { likedArtworks, likeCounts, setLikedArtworks, toggleLike } = useContext(LikedArtworksContext);

  const { openPopup } = useDonation();

  const [isDeletedLocally, setIsDeletedLocally] = useState(false);

  const { mutate: hideArtwork } = useHideArtwork();
  const { mutate: unhideArtwork } = useUnhideArtwork();
  const { mutate: unarchiveArtwork } = useUnarchiveArtwork();
  const { mutate: restore } = useRestoreArtwork();
  const { mutate: submitReport } = useSubmitReport();
  const { mutate: updateVisibility } = useUpdateArtworkVisibility();
  const { mutate: archiveArtwork } = useArchivedArtwork();
  const queryClient = useQueryClient();
  const [localIsLiked, setLocalIsLiked] = useState(status?.isLiked ?? isLikedFromBulk ?? false);
  const [localIsReported, setLocalIsReported] = useState(report?.reported ?? isReportedFromBulk ?? false);
  const { isFavorite: localIsFavorite, handleFavorite } = useFavorite(id, status?.isSaved ?? isSavedFromBulk ?? false);

  useEffect(() => {
    setLocalIsLiked(status?.isLiked ?? isLikedFromBulk ?? false);
  }, [status?.isLiked, isLikedFromBulk]);

  useEffect(() => {
    setLocalIsReported(report?.reported ?? isReportedFromBulk ?? false);
  }, [report?.reported, isReportedFromBulk]);

  const handleLike = () => {
    setLocalIsLiked((prev) => !prev);
    if (id) toggleLike(id);
  };

  const handleHide = () => {
    if (visibility?.toLowerCase() === "hidden") {
      // If viewing hidden tab, unhide the artwork
      console.log("ArtCardMenu: Calling unhideArtwork for id:", id);
      unhideArtwork(id);
    } else {
      // If viewing other tabs, hide the artwork
      console.log("ArtCardMenu: Calling hideArtwork for id:", id);
      setIsHidden(true);
      hideArtwork(id);
    }
    // Additional cache invalidation to ensure consistent state across components
    queryClient.invalidateQueries({ queryKey: ["bulkReportStatus"] });
    queryClient.invalidateQueries({ queryKey: ["artworks"] });
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
  const handleArchive = () => {
    archiveArtwork(id);
    setMenuOpen(false);
  };

  const handleReport = ({
    category,
    option,
    description,
    additionalInfo,
  }: {
    category: string;
    option?: string;
    description?: string;
    additionalInfo?: string;
  }) => {
    if (localIsReported || isReportedFromBulk) {
      toast.error(translatedAlreadyReported, { closeButton: true });
      setMenuOpen(false);
      return;
    }
    // Update local state immediately for visual feedback
    setLocalIsReported(true);

    submitReport(
      {
        art_id: id,
        category,
        option,
        description,
        additionalInfo,
      },
      {
        onError: () => {
          // Revert local state if submission fails
          setLocalIsReported(false);
        },
      }
    );

    setMenuOpen(false);
  };

  const handleUndoReport = () => {
    // Update local state immediately for visual feedback
    setLocalIsReported(false);
    setMenuOpen(false);
  };

  const handleUndoReportRevert = () => {
    // Revert local state if undo fails
    setLocalIsReported(true);
  };

  const handleTipJar = () => {
    openPopup({
      id,
      title: title || translatedUntitledArtwork,
      artistName,
      artworkImage,
      artistId,
      default_paypal_email,
    });
  };

  const loggedInUserId = getLoggedInUserId();
  const isOwner = String(loggedInUserId) === String(artistId);

  if (isHidden || isDeletedLocally) return null;

  return (
    <div className="art-card h-full text-xs group animate-fadeIn rounded-xl bg-white hover:shadow-lg transition-all duration-300 border 1px border-gray-200 px-4 py-3">
      <div className="py-1 px-1 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to={`/userprofile/${artistId}`}>
            <Avatar className="h-5 w-5 border">
              <AvatarImage src={artistImage} alt={translatedArtistName} />
              <AvatarFallback>{(translatedArtistName || "?").charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <span className="text-[9px] font-medium">{translatedArtistName}</span>
        </div>

        <div className="relative text-gray-500" style={{ height: "24px" }}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`p-1 rounded-full ${menuOpen ? "border border-gray-300 text-black" : ""} ${
              localIsReported ? "text-red-600" : ""
            }`}
          >
            <MoreHorizontal size={14} />
          </button>

          {/* CONDITIONAL MENU */}
          {isDeleted ? (
            <DeletedMenu
              artworkId={id}
              isOpen={menuOpen}
              onEdit={() => {
                console.log("Edit artwork");
                setMenuOpen(false);
              }}
              onUnarchive={handleRestore}
              onDelete={() => {
                toast.success(translatedArtworkPermanentlyDeleted, { closeButton: true });
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
          ) : isOwner ? (
            <OwnerMenu
              isOpen={menuOpen}
              artworkId={id}
              artworkTitle={artwork.title}
              onRequestBid={() => console.log("Request to bid", id)}
              onSell={() => console.log("Sell artwork", id)}
              onEdit={() => console.log("Edit artwork", id)}
              onToggleVisibility={(newStatus: boolean) => {
                // Handle different visibility states
                if (visibility?.toLowerCase() === "hidden") {
                  // If artwork is hidden, unhide it (make it public)
                  unhideArtwork(id);
                } else {
                  // For public/private artworks, use the normal visibility toggle
                  // Optimistic update - the UI will update immediately via the menu component
                  updateVisibility({ id, visibility: newStatus ? "Public" : "Private" });
                }
                setMenuOpen(false);
              }}
              onArchive={handleArchive}
              isPublic={artwork.visibility === "Public"}
              isHidden={visibility?.toLowerCase() === "hidden"}
              className="-left-1 top-7"
            />
          ) : (
            <ArtCardMenu
              isOpen={menuOpen}
              onFavorite={() => {
                handleFavorite();
                // Additional cache invalidation to ensure consistent state across components
                queryClient.invalidateQueries({ queryKey: ["bulkReportStatus"] });
                queryClient.invalidateQueries({ queryKey: ["artworks"] });
                setMenuOpen(false);
              }}
              onHide={handleHide}
              onReport={handleReport}
              onUndoReport={handleUndoReport}
              onUndoReportRevert={handleUndoReportRevert}
              isFavorite={localIsFavorite}
              isReported={localIsReported}
              isShared={false}
              isHidden={visibility?.toLowerCase() === "hidden"}
              artworkId={id}
              className="-right-1 top-7"
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
          {imageError || (!artwork.artworkImage && !image_url) ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500">
              <div className="w-12 h-12 mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-xs text-center px-2">
                <div className="font-medium">Artwork by</div>
                <div className="text-gray-600">{translatedArtistName}</div>
              </div>
            </div>
          ) : (
            <img
              src={artwork.artworkImage || (Array.isArray(image_url) ? image_url[0] : image_url)}
              alt={`Artwork by ${translatedArtistName}`}
              className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          )}
        </div>
      </Link>

      <div className="px-1 py-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">
            {translatedTitle
              ? translatedTitle.slice(0, 10) + (translatedTitle.length > 10 ? "..." : "")
              : translatedUntitledArtwork}
          </p>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleLike}
              className={`p-1 rounded-full transition-colors ${
                localIsLiked ? "text-red-600" : "text-gray-400 hover:text-red-600"
              }`}
              aria-label={localIsLiked ? translatedUnlike : translatedLike}
            >
              <Heart
                size={15}
                className={localIsLiked ? "text-red-600 fill-red-600" : "text-gray-800"}
                fill={localIsLiked ? "currentColor" : "none"}
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
