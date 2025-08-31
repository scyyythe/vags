import React, { useState, memo } from "react";
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

export interface SellCardProps {
  id: string;
  artworkImage: string;
  artist?: string;
  artistId?: string;
  price: number;
  medium?: string;

  profile_picture?: string;
  originalPrice?: number;
  title: string;
  category?: string;
  edition?: string;
  size?: string;
  yearCreated?: string;
  rating?: number;
  isLiked?: boolean;
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
  category,
  edition,
  rating,

  size,
  yearCreated,
  profile_picture,
  isLiked = false,
  onLike,
  status,
  reason,
  onRelist,
  onReportSuccess,
  isMarketplace = false,
  onCardClick,
  isOwner = false,

  isWishlistView = false,
}: SellCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: submitReport } = useSubmitReport();
  const { data: reportStatusData } = useArtworkReportStatus(id);
  const isReported = reportStatusData?.reported ?? false;

  // 👇 use context instead of local state
  const { isChatOpen, openChat, closeChat, participantId, participantName } = useChat();

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast(!isLiked ? "Added to wishlist" : "Removed from wishlist", {
      closeButton: true,
    });
    onLike?.();
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();

    openChat(artistId!, artist || "Unknown", profile_picture, true);
    toast("Redirecting to contact the artist...", { closeButton: true });
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
      }
    );
  };

  return (
    <div
      onClick={onCardClick}
      className="sell-card h-full text-xs group animate-fadeIn rounded-xl bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 px-3 py-3 relative cursor-pointer"
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
          {price > 0 && (
            <p className="text-sm font-bold text-gray-900">
              ₱{price >= 10000 ? `${(price / 10000).toFixed(1)}k` : price}
            </p>
          )}
          {originalPrice > 0 && originalPrice !== price && (
            <p className="text-xs line-through text-gray-400">
              ₱{originalPrice >= 10000 ? `${(originalPrice / 10000).toFixed(1)}k` : originalPrice}
            </p>
          )}
        </div>

        <div className="relative text-gray-500" style={{ height: "24px" }}>
          <button
            onClick={handleMenuClick}
            className={`p-1 rounded-full ${isReported ? "text-red-600" : menuOpen ? "text-black" : ""}`}
          >
            <MoreHorizontal size={14} />
          </button>

          {isOwner ? (
            <SellMenu
              isOpen={menuOpen}
              artworkId={id}
              onEdit={(artworkId) => toast(`Edit clicked for ${artworkId}`, { closeButton: true })}
              onToggleVisibility={(newVisibility, artworkId) =>
                toast(`Set visibility to ${newVisibility}`, { closeButton: true })
              }
              onDelete={() => toast("Delete clicked", { closeButton: true })}
              onMarkAsSold={() => toast("Marked as sold", { closeButton: true })}
              onViewInsights={() => toast("Viewing insights", { closeButton: true })}
              className="-right-1 top-5"
            />
          ) : (
            <SellCardMenu isOpen={menuOpen} onReport={handleReport} isReported={isReported} className="-left-2" />
          )}
        </div>
      </div>

      <div className="flex justify-between mt-1.5 items-center">
        <div className="flex flex-col">
          <p className="text-[11px] font-medium mt-0.5 truncate" title={title}>
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
        ) : onRelist ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRelist(id);
            }}
            className="text-white text-[9px] bg-blue-600 hover:bg-blue-500 transition px-4 py-1.5 rounded-full"
          >
            Relist Artwork
          </button>
        ) : null}
      </div>

      {isModalOpen && (
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
          }}
        />
      )}
    </div>
  );
};

export default memo(SellCard);
