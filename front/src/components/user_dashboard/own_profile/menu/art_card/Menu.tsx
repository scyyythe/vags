import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, ShoppingCart, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmationPopup from "@/components/user_dashboard/own_profile/menu/art_card/DeletePopup";
import AuctionPopup from "@/components/user_dashboard/own_profile/request_bid/RequestBid";
import SellArtworkModal, { SellArtworkData } from "@/components/user_dashboard/own_profile/sell_artwork/SellArtModal";
import SellConfirmationModal from "@/components/user_dashboard/own_profile/sell_artwork/SellConfirmationModal";
import useDeleteArtwork from "@/hooks/mutate/visibility/trash/useDeleteArtwork";
import useArchivedArtwork from "@/hooks/mutate/visibility/arc/useArchivedArtwork";
import useUpdateArtwork from "@/hooks/artworks/sell/useUpdateArtwork";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
interface ArtCardMenuProps {
  isOpen: boolean;
  artworkId: string;
  artworkTitle?: string;
  onRequestBid: (id: string) => void;
  onSell: () => void;
  onEdit: (id: string) => void;
  onToggleVisibility: (newVisibility: boolean, id: string) => void;
  onArchive: () => void;
  isPublic?: boolean;
  isHidden?: boolean;
  className?: string;
}

const ArtCardMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  artworkId,
  onRequestBid,
  onSell,
  onEdit,
  onToggleVisibility,
  onArchive,
  artworkTitle,
  isPublic = true,
  isHidden = false,
  className,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [publicStatus, setPublicStatus] = useState(isPublic);
  
  // Update publicStatus when isHidden prop changes
  useEffect(() => {
    if (isHidden) {
      setPublicStatus(false); // Hidden artworks are not public
    } else {
      setPublicStatus(isPublic);
    }
  }, [isHidden, isPublic]);
  const [showAuctionPopup, setShowAuctionPopup] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showSellConfirmation, setShowSellConfirmation] = useState(false);
  const [sellArtworkData, setSellArtworkData] = useState<SellArtworkData | null>(null);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const deleteArtwork = useDeleteArtwork();
  const { mutate: archiveArtwork } = useArchivedArtwork();

  const { updateArtwork, isUpdating } = useUpdateArtwork();

  // Language and translation
  const { language } = useLanguage();
  const requestToAuctionText = useAutoTranslation("Request to Auction", language);
  const sellArtworkText = useAutoTranslation("Sell Artwork", language);
  const publicText = useAutoTranslation("Public", language);
  const privateText = useAutoTranslation("Private", language);
  const moreText = useAutoTranslation("more", language);
  const editText = useAutoTranslation("Edit", language);
  const archiveText = useAutoTranslation("Archive", language);
  const deleteText = useAutoTranslation("Delete", language);
  const artworkListedSuccessText = useAutoTranslation("Artwork listed for sale successfully", language);

  useEffect(() => {
    const shouldHideScroll = showAuctionPopup || showDeletePopup;

    const originalOverflow = document.body.style.overflow;

    if (shouldHideScroll) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "auto";
    }

    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [showAuctionPopup, showDeletePopup]);

  if (!isOpen) return null;

  const handleToggleVisibility = () => {
    if (isHidden) {
      // If artwork is hidden, unhide it (make it public)
      onToggleVisibility(true, artworkId);
    } else {
      // For public/private artworks, toggle between public and private
      const newStatus = !publicStatus;
      // Optimistic update - update UI immediately
      setPublicStatus(newStatus);
      onToggleVisibility(newStatus, artworkId);
    }
  };

  const handleConfirmDelete = () => {
    deleteArtwork.mutate(artworkId, {
      onSuccess: () => {
        setShowDeletePopup(false);
      },
      onError: () => {
        setShowDeletePopup(false);
      },
    });
  };

  const handleUpdateClick = () => {
    onEdit(artworkId);
    navigate(`/update/${artworkId}`);
  };

  const handleArchiveClick = () => {
    archiveArtwork(artworkId);
    setIsEditOpen(false);
  };

  const handleSellClick = () => {
    setShowSellModal(true);
  };

  const handleAuctionClick = () => {
    setShowAuctionPopup(true);
  };

  const handleSellArtwork = (data: SellArtworkData) => {
    setSellArtworkData(data);
    setShowSellModal(false);
    setShowSellConfirmation(true);
  };

  const handleConfirmSell = async () => {
    if (!sellArtworkData) return;

    try {
      await updateArtwork(artworkId, {
        price: sellArtworkData.price,
        quantity: parseInt(sellArtworkData.quantity),
        edition: sellArtworkData.edition,
        additionalImages: sellArtworkData.additionalImages,
        year_created: sellArtworkData.yearCreated,
      });

      toast.success(artworkListedSuccessText);
      setShowSellConfirmation(false);
      setSellArtworkData(null);
      onSell();
    } catch (err) {}
  };

  const handleCancelSell = () => {
    setShowSellConfirmation(false);
    setSellArtworkData(null);
  };

  return (
    <>
      <div
        ref={menuRef}
        className={`absolute z-10 bg-gray-100 dark:bg-gray-700 rounded-full py-1 px-1.5 shadow-md ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start gap-[3px]">
          {/* Request to Bid */}
          <div className="flex items-center relative">
            <button
              onClick={handleAuctionClick}
              className="p-1 rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onMouseEnter={() => setHoveredItem("bid")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <DollarSign size={10} />
            </button>
            {hoveredItem === "bid" && (
              <span className="absolute left-10 text-[9px] bg-black dark:bg-gray-800 text-white dark:text-gray-100 px-2 py-1 rounded whitespace-nowrap">
                {requestToAuctionText}
              </span>
            )}
          </div>

          {/* Sell */}
          <div className="flex items-center relative">
            <button
              onClick={handleSellClick}
              className="p-1 rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onMouseEnter={() => setHoveredItem("sell")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <ShoppingCart size={10} />
            </button>
            {hoveredItem === "sell" && (
              <span className="absolute left-10 text-[9px] bg-black dark:bg-gray-800 text-white dark:text-gray-100 px-2 py-1 rounded whitespace-nowrap">
                {sellArtworkText}
              </span>
            )}
          </div>

          {/* Toggle Visibility */}
          <div className="flex items-center relative">
            <button
              onClick={handleToggleVisibility}
              className="p-[3px] rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onMouseEnter={() => setHoveredItem("visibility")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {isHidden ? (
                <i className="bx bx-show-alt text-[11px]"></i>
              ) : publicStatus ? (
                <i className="bx bx-show-alt text-[11px]"></i>
              ) : (
                <i className="bx bxs-hide text-[11px]"></i>
              )}
            </button>
            {hoveredItem === "visibility" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">
                {isHidden ? "Unhide" : publicStatus ? publicText : privateText}
              </span>
            )}
          </div>

          {/* More Options */}
          <div className="flex items-center relative -top-1">
            <button
              onClick={() => setIsEditOpen((prev) => !prev)}
              onMouseEnter={() => setHoveredItem("edit")}
              onMouseLeave={() => setHoveredItem(null)}
              className="p-1 rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <MoreHorizontal size={10} />
            </button>

            {hoveredItem === "edit" && (
              <span className="absolute left-10 text-[9px] bg-black dark:bg-gray-800 text-white dark:text-gray-100 px-2 py-1 rounded">{moreText}</span>
            )}

            {isEditOpen && (
              <div className="absolute left-8 -top-7 bg-black dark:bg-gray-800 rounded text-[9px] flex flex-col z-20 w-18">
                <button
                  onClick={() => {
                    handleUpdateClick();
                    setIsEditOpen(false);
                  }}
                  className="px-3 py-1 text-left text-white dark:text-gray-100"
                >
                  {editText}
                </button>
                <button
                  onClick={() => {
                    handleArchiveClick();
                    setIsEditOpen(false);
                  }}
                  className="px-3 py-1 text-left text-white dark:text-gray-100"
                >
                  {archiveText}
                </button>

                <button
                  onClick={() => {
                    setShowDeletePopup(true);
                    setIsEditOpen(false);
                  }}
                  className="px-3 py-1 text-left text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300"
                >
                  {deleteText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}

      <DeleteConfirmationPopup
        isOpen={showDeletePopup}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={handleConfirmDelete}
      />
      {/* Auction Popup */}
      <AuctionPopup
        open={showAuctionPopup}
        onOpenChange={setShowAuctionPopup}
        artworkId={artworkId}
        artworkTitle={artworkTitle}
      />
      {/* Sell Artwork Modal */}
      <SellArtworkModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        onSellArtwork={handleSellArtwork}
        artworkTitle={artworkTitle}
      />
      {/* Sell Confirmation Modal */}
      <SellConfirmationModal isOpen={showSellConfirmation} onConfirm={handleConfirmSell} onCancel={handleCancelSell} />
    </>
  );
};

export default ArtCardMenu;
