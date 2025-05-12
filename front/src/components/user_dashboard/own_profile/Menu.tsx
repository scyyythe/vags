import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, ShoppingCart, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmationPopup from "@/components/user_dashboard/user_profile/components/status_options/popups/delete/DeletePopup";
import AuctionPopup from "@/components/user_dashboard/own_profile/request_bid/RequestBid";
import useDeleteArtwork from "@/hooks/mutate/visibility/useDeleteArtwork";
import useArchivedArtwork from "@/hooks/mutate/visibility/useArchivedArtwork";
interface ArtCardMenuProps {
  isOpen: boolean;
  artworkId: string;
  onRequestBid: (id: string) => void;
  onSell: () => void;
  onEdit: (id: string) => void;
  onToggleVisibility: (newVisibility: boolean, id: string) => void;
  onArchive: () => void;
  isPublic?: boolean;
}

const ArtCardMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  artworkId,
  onRequestBid,
  onSell,
  onEdit,
  onToggleVisibility,
  onArchive,
  isPublic = true,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [publicStatus, setPublicStatus] = useState(isPublic);
  const [showAuctionPopup, setShowAuctionPopup] = useState(false);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const deleteArtwork = useDeleteArtwork();
  const { mutate: archiveArtwork } = useArchivedArtwork();
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
    const newStatus = !publicStatus;
    setPublicStatus(newStatus);
    onToggleVisibility(newStatus, artworkId);
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

  return (
    <>
      <div
        ref={menuRef}
        className="absolute -left-2 top-8 z-10 bg-gray-100 rounded-full py-2 px-2 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start gap-[3px]">
          {/* Request to Bid */}
          <div className="flex items-center relative">
            <button
              onClick={() => setShowAuctionPopup(true)}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("bid")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <DollarSign size={10} />
            </button>
            {hoveredItem === "bid" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                Request to Bid
              </span>
            )}
          </div>

          {/* Sell */}
          <div className="flex items-center relative">
            <button
              onClick={onSell}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("sell")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <ShoppingCart size={10} />
            </button>
            {hoveredItem === "sell" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                Sell Artwork
              </span>
            )}
          </div>

          {/* Toggle Visibility */}
          <div className="flex items-center relative">
            <button
              onClick={handleToggleVisibility}
              className="p-[3px] rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("visibility")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {publicStatus ? (
                <i className="bx bx-show-alt text-[11px]"></i>
              ) : (
                <i className="bx bxs-hide text-[11px]"></i>
              )}
            </button>
            {hoveredItem === "visibility" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">
                {publicStatus ? "Public" : "Private"}
              </span>
            )}
          </div>

          {/* More Options */}
          <div className="flex items-center relative -top-1">
            <button
              onClick={() => setIsEditOpen((prev) => !prev)}
              onMouseEnter={() => setHoveredItem("edit")}
              onMouseLeave={() => setHoveredItem(null)}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
            >
              <MoreHorizontal size={10} />
            </button>

            {hoveredItem === "edit" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">more</span>
            )}

            {isEditOpen && (
              <div className="absolute left-8 -top-7 bg-black rounded text-[9px] flex flex-col z-20 w-18">
                <button
                  onClick={() => {
                    handleUpdateClick();
                    setIsEditOpen(false);
                  }}
                  className="px-3 py-1 text-left text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleArchiveClick();
                    setIsEditOpen(false);
                  }}
                  className="px-3 py-1 text-left text-white"
                >
                  Archive
                </button>

                <button
                  onClick={() => {
                    setShowDeletePopup(true);
                    setIsEditOpen(false);
                  }}
                  className="px-3 py-1 text-left text-red-500 hover:text-red-400"
                >
                  Delete
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
      <AuctionPopup open={showAuctionPopup} onOpenChange={setShowAuctionPopup} />
    </>
  );
};

export default ArtCardMenu;
