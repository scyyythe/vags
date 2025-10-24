import React, { useState, useEffect, memo } from "react";
import ReactDOM from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import SellMenu from "@/components/user_dashboard/own_profile/menu/sell_card/Menu";
import SellCardMenu from "./SellCardMenu";
import PreviewModal from "../buying_process/preview/PreviewModal";
import useSubmitReport from "@/hooks/mutate/report/useSubmitReport";
import { Badge } from "@/components/ui/badge";
import ChatDropdown from "../../local_components/chat/ChatDropdown";
import { useChat } from "@/context/ChatContext";
import useToggleArtworkStatus from "@/hooks/purchase/useMarkArtworkAsSold";
import useMarkArtworkAsUnlisted from "@/hooks/purchase/useMarkArtworkAsUnlisted";
import { getLoggedInUserId } from "@/auth/decode";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
export interface SellCardProps {
  id: string;
  artworkImage: string;
  artist?: string;
  artistId?: string;
  price: number;
  medium?: string;
  description?: string;
  profile_picture?: string;
  originalPrice?: number;
  title: string;
  category?: string;
  edition?: string;
  size?: string;
  yearCreated?: string;
  rating?: number;
  isLiked?: boolean;
  additionalImages?: string[];
  quantity?: number;
  default_paypal_email?: string;
  onLike?: () => void;
  isReported?: boolean;
  onReportSuccess?: () => void;
  isMarketplace?: boolean;
  isProfileView?: boolean;
  onCardClick?: () => void;
  isOwner?: boolean;
  status?: string;
  reason?: string;
  onRelist?: (id: string) => void;
  onUnlist?: (id: string) => void;
  isWishlistView?: boolean;
  isFading?: boolean;
  onBuyNowClick?: () => void;
}

const SellCard = ({
  id,
  artworkImage,
  price,
  medium,
  artist,
  artistId,
  originalPrice = 0,
  title,
  quantity,
  category,
  edition,
  rating,
  description,
  size,
  yearCreated,
  default_paypal_email,
  profile_picture,
  isLiked = false,
  onLike,
  status,
  reason,
  onRelist,
  onUnlist,
  additionalImages,
  onReportSuccess,
  isMarketplace = false,
  isProfileView = false,
  onCardClick,
  isFading = false,
  isWishlistView = false,
  isReported = false,
  onBuyNowClick,
}: SellCardProps) => {
  const loggedInUserId = getLoggedInUserId();
  const isOwner = String(artistId) === String(loggedInUserId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Translation hooks
  const { language } = useLanguage();
  const addedToWishlistText = useAutoTranslation("Added to wishlist", language);
  const removedFromWishlistText = useAutoTranslation("Removed from wishlist", language);
  const redirectingToContactText = useAutoTranslation("Redirecting to contact", language);
  const reportSubmittedText = useAutoTranslation("Report submitted successfully", language);
  const soldOutText = useAutoTranslation("Sold Out", language);
  const onSaleText = useAutoTranslation("On Sale", language);
  const cancelledText = useAutoTranslation("Cancelled", language);
  const expiredText = useAutoTranslation("Expired", language);
  const unsoldText = useAutoTranslation("Unsold", language);
  const unavailableText = useAutoTranslation("Unavailable", language);
  const buyNowText = useAutoTranslation("Buy Now", language);
  const relistText = useAutoTranslation("Relist", language);
  const setVisibilityToText = useAutoTranslation("Set visibility to", language);
  const deleteClickedText = useAutoTranslation("Delete clicked", language);
  const viewingInsightsText = useAutoTranslation("Viewing insights", language);

  // Translate artwork title
  const translatedTitle = useAutoTranslation(title || "", language);

  const { mutate: submitReport } = useSubmitReport();
  const markAsSoldMutation = useToggleArtworkStatus();
  const markAsUnlistedMutation = useMarkArtworkAsUnlisted();
  const [heightValue, widthValue] = size ? size.split("x") : ["", ""];

  const [localIsReported, setLocalIsReported] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);

  // Use isReported prop if provided, otherwise default to false
  const isReportedFromProps = isReported ?? false;

  // Sync local state with prop
  useEffect(() => {
    setLocalIsReported(isReportedFromProps);
  }, [isReportedFromProps]);

  // Sync local liked state with prop
  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  const formatPrice = (amount: number) => {
    if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 10_000) return `₱${(amount / 1_000).toFixed(1)}k`;
    return `₱${amount.toLocaleString()}`;
  };

  const { isChatOpen, openChat, closeChat, participantId, participantName } = useChat();

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Store original state for potential rollback
    const originalLikedState = localIsLiked;
    const newLikedState = !localIsLiked;
    
    // Optimistic update - immediately update UI
    setLocalIsLiked(newLikedState);
    
    // Show toast with optimistic state
    toast(newLikedState ? addedToWishlistText : removedFromWishlistText, {
      closeButton: true,
    });
    
    try {
      // Call the actual API
      await onLike?.();
    } catch (error) {
      // Revert optimistic update on error
      setLocalIsLiked(originalLikedState);
      toast.error("Failed to update wishlist. Please try again.", {
        closeButton: true,
      });
    }
  };

  const participantAvatar = profile_picture ?? undefined;
  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!artistId || !artist) {
      console.error("❌ Missing artist info", { artistId, artist });
      return;
    }

    openChat(String(artistId), artist, profile_picture, true);

    toast(`${redirectingToContactText} ${artist}...`, { closeButton: true });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onBuyNowClick) {
      onBuyNowClick();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleReport = (data: { category: string; option?: string; description: string; additionalInfo: string }) => {
    if (!id) return;

    // Update local state immediately for visual feedback
    setLocalIsReported(true);

    submitReport(
      {
        art_id: id,
        category: data.category,
        option: data.option,
        description: data.description,
        additionalInfo: data.additionalInfo,
      },
      {
        onSuccess: () => {
          onReportSuccess?.();
          toast.success(reportSubmittedText, { closeButton: true });
        },
        onError: () => {
          // Revert local state if submission fails
          setLocalIsReported(false);
        },
      }
    );
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

  return (
    <div
      onClick={onCardClick}
      className={`sell-card h-full text-xs group rounded-xl bg-white dark:bg-gray-800 hover:shadow-lg border border-gray-200 dark:border-gray-600 px-3 py-3 relative cursor-pointer z-0
        transition-all duration-300 ease-in-out transform 
        ${isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
    >
      <div className="relative">
        <img src={artworkImage} alt={translatedTitle} className="rounded-md w-full h-44 object-cover" />

        {/* SOLD OUT Overlay (only for non-owner users) */}
        {!isOwner && status === "sold" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 dark:bg-gray-900/80 rounded-full px-6 py-6 flex items-center justify-center">
              <span className="text-white text-[12px] font-medium">{soldOutText}</span>
            </div>
          </div>
        )}

        {/* Icons or Status */}
        {(status === "active" || status === "onsale") && (!isOwner || (isOwner && isMarketplace && !isProfileView)) ? (
          <>
            {/* Message Icon */}
            <button
              onClick={handleContact}
              className="absolute top-2 right-9 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm"
            >
              <img
                src="https://img.icons8.com/?size=100&id=8h51YOzhBJmT&format=png&color=000000"
                alt="Message"
                className="w-3 h-3 dark:brightness-0 dark:invert"
              />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={toggleLike}
              className="absolute top-2 right-2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm"
            >
              <img
                src={
                  localIsLiked
                    ? "https://img.icons8.com/puffy-filled/32/B10303/like.png"
                    : "https://img.icons8.com/puffy/32/like.png"
                }
                alt="Heart"
                className="w-3 h-3 dark:brightness-0 dark:invert"
              />
            </button>
          </>
        ) : (status === "active" || status === "onsale") && isOwner && isProfileView ? (
          // Show status badge for owner's own artworks in profile view
          <div className="absolute top-2 right-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-[10px] text-gray-600 dark:text-gray-300 font-medium px-2 py-0.5 rounded-full">
            {onSaleText}
          </div>
        ) : (
          // Show status badge for other statuses
          <div className="absolute top-2 right-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-[10px] text-gray-600 dark:text-gray-300 font-medium px-2 py-0.5 rounded-full">
            {status === "cancelled"
              ? cancelledText
              : status === "expired"
              ? expiredText
              : status === "unsold"
              ? unsoldText
              : status?.charAt(0).toUpperCase() + status?.slice(1) || unavailableText}
          </div>
        )}

        {edition !== "Original (1 of 1)" && rating !== undefined && rating > 0 && (
          <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <i className="bx bxs-star text-[10px] text-yellow-500"></i>
            <span className="text-red-800 dark:text-red-400 text-[9px]">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-3 items-center">
        <div className="flex items-center gap-2">
          {price > 0 && <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatPrice(price)}</p>}
          {originalPrice > 0 && originalPrice !== price && (
            <p className="text-xs line-through text-gray-400 dark:text-gray-500">{formatPrice(originalPrice)}</p>
          )}
        </div>

        <div className="relative text-gray-500 dark:text-gray-400" style={{ height: "24px" }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleMenuClick}
            className={`p-1 rounded-full ${localIsReported ? "text-red-600" : menuOpen ? "text-black dark:text-white" : ""}`}
          >
            <MoreHorizontal size={14} />
          </button>

          {isOwner ? (
            <SellMenu
              isOpen={menuOpen}
              artworkId={id}
              isPublic={status === "onsale" || status === "active"}

              onEdit={() => {
                navigate(`/sell-update/${id}`, {
                  state: {
                    id,
                    title,
                    year_created: yearCreated || "",
                    style: category ? category.toLowerCase() : "",
                    medium: medium || "",
                    height: heightValue,
                    width: widthValue,
                    description: description || "",
                    price: String(price || 0),
                    edition: edition || "Original (1 of 1)",
                    quantity: quantity,
                    mainImageUrl: artworkImage,
                    additionalImagesUrls: additionalImages,
                  },
                });
              }}
              onToggleVisibility={(newVisibility, artworkId) => {
                if (newVisibility === "Unlisted" && onUnlist) {
                  // Use the onUnlist prop if provided, otherwise use the mutation
                  onUnlist(artworkId);
                } else if (newVisibility === "Unlisted") {
                  markAsUnlistedMutation.mutate(artworkId);
                } else if (newVisibility === "Listed" && onRelist) {
                  // Use the relist functionality when listing an artwork
                  onRelist(artworkId);
                } else {
                  toast(`${setVisibilityToText} ${newVisibility}`, { closeButton: true });
                }
              }}
              onDelete={() => toast(deleteClickedText, { closeButton: true })}
              onMarkAsSold={() => markAsSoldMutation.mutate(id)}
              onViewInsights={() => toast(viewingInsightsText, { closeButton: true })}
              positionOffset={{ top: 2, left: -8, marginTop: -2 }}
            />
          ) : (
            <SellCardMenu
              isOpen={menuOpen}
              onReport={handleReport}
              isReported={localIsReported}
              artworkId={id}
              onUndoReport={handleUndoReport}
              className="-left-2"
              positionOffset={{ top: 2, left: -8.5, marginTop: -2 }}
            />
          )}
        </div>
      </div>

      <div className="flex justify-between mt-1.5 items-center">
        <div className="flex flex-col">
          <p className="text-[11px] font-medium mt-0.5 truncate max-w-[110px] text-gray-900 dark:text-gray-100">{translatedTitle}</p>
          {status !== "active" && reason && <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{reason}</p>}
        </div>

        {status === "active" || status === "onsale" ? (
          (!isOwner || (isOwner && isMarketplace && !isProfileView)) && (
            <button
              onClick={handleBuyNow}
              className="text-white text-[9px] bg-red-800 hover:bg-red-700 transition px-4 py-1.5 rounded-full"
            >
              {buyNowText}
            </button>
          )
        ) : status === "sold" && onRelist ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRelist(id);
            }}
            className="text-white text-[10px] bg-blue-600 hover:bg-blue-500 transition px-4 py-1.5 rounded-full"
          >
            {relistText}
          </button>
        ) : onRelist ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRelist(id);
            }}
            className="text-white text-[9px] bg-blue-600 hover:bg-blue-500 transition px-4 py-1.5 rounded-full"
          >
            {relistText}
          </button>
        ) : null}
      </div>

      {isModalOpen &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <PreviewModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onProceedToCheckout={() => setIsModalOpen(false)}
            artwork={{
              id,
              artworkImage,
              title,
              artist,
              artistId,
              medium,
              style: category,
              edition,
              size,
              yearCreated,
              price,
              default_paypal_email,
              quantity: 1,
              availableQuantity: quantity || 1,
            }}
          />,
          document.body
        )}

    </div>
  );
};

export default memo(SellCard);
