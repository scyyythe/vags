import React, { useRef, useState } from "react";
import { Trash2, BarChart3, Hammer, RotateCcw } from "lucide-react";
import DeleteConfirmationPopup from "./DeletePopup";
import CloseBidConfirmationPopup from "./CloseBidPopup";
import ViewBidsModal from "./ViewBidsModal";
import RestoreConfirmation from "./RestoreConfirmation";

interface Bid {
  id?: string;
  amount: number;
  bidderFullName: string;
  timestamp: string | Date;
  identity_type?: string;
  user?: {
    profile_picture?: string;
  };
}

interface OwnerBidMenuProps {
  isOpen: boolean;
  onDelete: () => void;
  onViewBids: () => void;
  onCloseBid: () => void;
  onRestore?: (id: string) => void;
  className?: string;
  bids?: Bid[];
  auctionId?: string;
  auctionTitle?: string;
  visibility?: string;
}

const OwnerBidMenu: React.FC<OwnerBidMenuProps> = ({
  isOpen,
  onDelete,
  onCloseBid,
  onRestore,
  bids = [],
  className,
  auctionId,
  auctionTitle,
  visibility,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [showRestorePopup, setShowRestorePopup] = useState(false);
  const [showViewBidsModal, setShowViewBidsModal] = useState(false);

  if (!isOpen) return null;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeletePopup(false);
  };

  const handleConfirmRestore = () => {
    if (onRestore && auctionId) {
      onRestore(auctionId);
    }
    setShowRestorePopup(false);
  };

  return (
    <>
      <div
        ref={menuRef}
        className={`absolute z-10 bg-gray-100 rounded-full py-1 px-1 shadow-md ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start">
          {/* View Bids */}
          <div className="flex items-center relative">
            <button
              onClick={() => setShowViewBidsModal(true)}
              className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
              aria-label="View Bids"
              onMouseEnter={() => setHoveredItem("view")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <BarChart3 size={10} stroke="currentColor" />
            </button>
            {hoveredItem === "view" && (
              <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                View Bids
              </span>
            )}
          </div>

          {/* Close Bidding - Only show if not deleted */}
          {visibility?.toLowerCase() !== "deleted" && (
            <div className="flex items-center relative">
              <button
                onClick={() => setShowClosePopup(true)}
                className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
                aria-label="Close Bidding"
                onMouseEnter={() => setHoveredItem("close")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Hammer size={10} stroke="currentColor" />
              </button>
              {hoveredItem === "close" && (
                <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                  Close Bidding
                </span>
              )}
            </div>
          )}

          {/* Delete Bid - Only show if not deleted */}
          {visibility?.toLowerCase() !== "deleted" && (
            <div className="flex items-center relative">
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
                aria-label="Delete Bid"
                onMouseEnter={() => setHoveredItem("delete")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Trash2 size={10} fill="none" stroke="#ea384c" />
              </button>
              {hoveredItem === "delete" && (
                <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                  Delete Bid
                </span>
              )}
            </div>
          )}

          {/* Restore Auction - Only show if deleted */}
          {visibility?.toLowerCase() === "deleted" && onRestore && (
            <div className="flex items-center relative">
              <button
                onClick={() => setShowRestorePopup(true)}
                className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
                aria-label="Restore Auction"
                onMouseEnter={() => setHoveredItem("restore")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <RotateCcw size={10} stroke="#10b981" />
              </button>
              {hoveredItem === "restore" && (
                <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                  Restore Auction
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationPopup
        isOpen={showDeletePopup}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={handleConfirmDelete}
      />

      <CloseBidConfirmationPopup
        isOpen={showClosePopup}
        onCancel={() => setShowClosePopup(false)}
        onConfirm={() => {
          onCloseBid();
          setShowClosePopup(false);
        }}
      />

      <ViewBidsModal
        isOpen={showViewBidsModal}
        onClose={() => setShowViewBidsModal(false)}
        bids={bids}
        isOwner={true}
      />

      <RestoreConfirmation
        isOpen={showRestorePopup}
        onCancel={() => setShowRestorePopup(false)}
        onConfirm={handleConfirmRestore}
        auctionTitle={auctionTitle}
      />
    </>
  );
};

export default OwnerBidMenu;
