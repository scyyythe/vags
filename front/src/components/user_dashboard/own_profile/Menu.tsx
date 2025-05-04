import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, ShoppingCart, Pencil } from "lucide-react";
import AuctionPopup from "@/components/user_dashboard/own_profile/request_bid/RequestBid";

interface ArtCardMenuProps {
  isOpen: boolean;
  onRequestBid: () => void;
  onSell: () => void;
  onEdit: () => void;
  onToggleVisibility: (newVisibility: boolean) => void;
  onArchive: () => void;
  isPublic?: boolean;
}

const ArtCardMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onRequestBid,
  onSell,
  onToggleVisibility,
  onArchive,
  isPublic = true,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [publicStatus, setPublicStatus] = useState(isPublic);
  const [showAuctionPopup, setShowAuctionPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = showAuctionPopup ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAuctionPopup]);

  if (!isOpen) return null;

  const handleToggleVisibility = () => {
    const newStatus = !publicStatus;
    setPublicStatus(newStatus);
    onToggleVisibility(newStatus);
  };

  const handleUpdateClick = () => {
    navigate("/update");
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

          {/* Edit */}
          <div className="flex items-center relative">
            <button
              onClick={handleUpdateClick}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("edit")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Pencil size={10} />
            </button>
            {hoveredItem === "edit" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">
                Edit
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
                <i className='bx bxs-hide text-[11px]' ></i>
              )}
            </button>
            {hoveredItem === "visibility" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">
                {publicStatus ? "Public" : "Private"}
              </span>
            )}
          </div>

          {/* Archive */}
          <div className="flex items-center -mt-[3px]">
            <button
              onClick={onArchive}
              className="p-[3px] rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("archive")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <i className='bx bx-archive text-[11px]'></i>
            </button>
            {hoveredItem === "archive" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">
                Archive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Auction Popup */}
      <AuctionPopup
        open={showAuctionPopup}
        onOpenChange={setShowAuctionPopup}
      />
    </>
  );
};

export default ArtCardMenu;
