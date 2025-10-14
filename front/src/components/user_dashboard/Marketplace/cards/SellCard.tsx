import React, { useState, useEffect, memo } from "react";
import ReactDOM from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import SellMenu from "@/components/user_dashboard/own_profile/menu/sell_card/Menu";
import SellCardMenu from "./SellCardMenu";
import PreviewModal from "../buying_process/preview/PreviewModal";
import useSubmitReport from "@/hooks/mutate/report/useSubmitReport";
import useArtworkReportStatus from "@/hooks/mutate/report/useArtworkReportStatus";
import { Badge } from "@/components/ui/badge";
import ChatDropdown from "../../local_components/chat/ChatDropdown";
import { useChat } from "@/context/ChatContext";
import useToggleArtworkStatus from "@/hooks/purchase/useMarkArtworkAsSold";
import useMarkArtworkAsUnlisted from "@/hooks/purchase/useMarkArtworkAsUnlisted";
import { getLoggedInUserId } from "@/auth/decode";
import { useNavigate } from "react-router-dom";
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
  onCardClick?: () => void;
  isOwner?: boolean;
  status?: string;
  reason?: string;
  onRelist?: (id: string) => void;
  isWishlistView?: boolean;
  isFading?: boolean;
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
  additionalImages,
  onReportSuccess,
  isMarketplace = false,
  onCardClick,
  isFading = false,
  isWishlistView = false,
}: SellCardProps) => {
  const loggedInUserId = getLoggedInUserId();
  const isOwner = String(artistId) === String(loggedInUserId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const { mutate: submitReport } = useSubmitReport();
  const markAsSoldMutation = useToggleArtworkStatus();
  const markAsUnlistedMutation = useMarkArtworkAsUnlisted();
  const [heightValue, widthValue] = size ? size.split("x") : ["", ""];

  const { data: reportStatusData } = useArtworkReportStatus(id);
  const [localIsReported, setLocalIsReported] = useState(reportStatusData?.reported ?? false);

  // Sync local state with report status
  useEffect(() => {
    setLocalIsReported(reportStatusData?.reported ?? false);
  }, [reportStatusData?.reported]);

  const formatPrice = (amount: number) => {
    if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 10_000) return `₱${(amount / 1_000).toFixed(1)}k`;
    return `₱${amount.toLocaleString()}`;
  };

  const { isChatOpen, openChat, closeChat, participantId, participantName } = useChat();

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast(!isLiked ? "Added to wishlist" : "Removed from wishlist", {
      closeButton: true,
    });
    onLike?.();
  };
  const participantAvatar = profile_picture ?? undefined;
  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!artistId || !artist) {
      console.error("❌ Missing artist info", { artistId, artist });
      return;
    }

    openChat(String(artistId), artist, profile_picture, true);

    toast(`Redirecting to contact ${artist}...`, { closeButton: true });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
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
          toast.success("Report submitted successfully", { closeButton: true });
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
      className={`sell-card h-full text-xs group rounded-xl bg-white hover:shadow-lg border border-gray-200 px-3 py-3 relative cursor-pointer
        transition-all duration-300 ease-in-out transform 
        ${isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
    >

      <div className="relative">
        <img src={artworkImage} alt={title} className="rounded-md w-full h-44 object-cover" />

        {/* Icons or Status */}
        {status === "active" && (isWishlistView || isMarketplace) ? (
          <>
            {/* Message Icon */}
            <button
              onClick={handleContact}
              className="absolute top-2 right-9 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
            >
              <img
                src="https://img.icons8.com/?size=100&id=8h51YOzhBJmT&format=png&color=000000"
                alt="Message"
                className="w-3 h-3"
              />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={toggleLike}
              className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
            >
              <img
                src={
                  isLiked
                    ? "https://img.icons8.com/puffy-filled/32/B10303/like.png"
                    : "https://img.icons8.com/puffy/32/like.png"
                }
                alt="Heart"
                className="w-3 h-3"
              />
            </button>
          </>
        ) : (
          // Show status badge instead
          <div className="absolute top-2 right-2 bg-gray-100 border border-gray-300 text-[10px] text-gray-600 font-medium px-2 py-0.5 rounded-full">
            {status === "cancelled"
              ? "Cancelled"
              : status === "expired"
              ? "Expired"
              : status === "unsold"
              ? "Unsold"
              : status?.charAt(0).toUpperCase() + status?.slice(1) || "Unavailable"}
          </div>
        )}

        {edition !== "Original (1 of 1)" && rating !== undefined && (
          <div className="absolute bottom-2 right-2 bg-white font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <i className="bx bxs-star text-[10px] text-yellow-500"></i>
            <span className="text-red-800 text-[9px]">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-3 items-center">
        <div className="flex items-center gap-2">
          {price > 0 && <p className="text-sm font-bold text-gray-900">{formatPrice(price)}</p>}
          {originalPrice > 0 && originalPrice !== price && (
            <p className="text-xs line-through text-gray-400">{formatPrice(originalPrice)}</p>
          )}
        </div>

        <div className="relative text-gray-500" style={{ height: "24px" }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleMenuClick}
            className={`p-1 rounded-full ${localIsReported ? "text-red-600" : menuOpen ? "text-black" : ""}`}
          >
            <MoreHorizontal size={14} />
          </button>

          {isOwner ? (
            <SellMenu
              isOpen={menuOpen}
              artworkId={id}
              onEdit={() => {
                navigate(`/sell-update/${id}`, {
                  state: {
                    id,
                    title,
                    year_created: yearCreated || "",
                    style: category || "",
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
                if (newVisibility === "Unlisted") {
                  markAsUnlistedMutation.mutate(artworkId);
                } else {
                  toast(`Set visibility to ${newVisibility}`, { closeButton: true });
                }
              }}
              onDelete={() => toast("Delete clicked", { closeButton: true })}
              onMarkAsSold={() => markAsSoldMutation.mutate(id)}
              onViewInsights={() => toast("Viewing insights", { closeButton: true })}
              className="-right-1 top-5"
            />
          ) : (
            <SellCardMenu
              isOpen={menuOpen}
              onReport={handleReport}
              isReported={localIsReported}
              artworkId={id}
              onUndoReport={handleUndoReport}
              className="-left-2"
            />
          )}
        </div>
      </div>

      <div className="flex justify-between mt-1.5 items-center">
        <div className="flex flex-col">
          <p className="text-[11px] font-medium mt-0.5 truncate max-w-[110px]" title={title}>
            {title}
          </p>
          {status !== "active" && reason && <p className="text-[10px] text-red-600 mt-1">{reason}</p>}
        </div>

        {status === "active" ? (
          <button
            onClick={handleBuyNow}
            className="text-white text-[9px] bg-red-800 hover:bg-red-700 transition px-4 py-1.5 rounded-full"
          >
            Buy Now
          </button>
        ) : null}

        {/* ) : status === "sold" && onRelist ? (
           <button
            onClick={(e) => {
              e.stopPropagation();
              onRelist(id);
            }}
            className="text-white text-[10px] bg-blue-600 hover:bg-blue-500 transition px-4 py-1.5 rounded-full"
          >
            Relist
          </button>
        ) : onRelist ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRelist(id);
            }}
            className="text-white text-[9px] bg-blue-600 hover:bg-blue-500 transition px-4 py-1.5 rounded-full"
          >
            Relist
          </button>
        ) : null} */}

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
            medium,
            style: category,
            edition,
            size,
            yearCreated,
            price,
            default_paypal_email,
          }}
        />,
        document.body //ensures modal renders at the top of the DOM
      )}

    </div>
  );
};

export default memo(SellCard);
