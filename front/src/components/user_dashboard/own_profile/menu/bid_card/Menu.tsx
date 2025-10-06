import React, { useRef, useState } from "react";
import { Edit3, Trash2, BarChart3, Hammer } from "lucide-react";

interface OwnerBidMenuProps {
  isOpen: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewBids: () => void;
  onCloseBid: () => void;
  className?: string;
}

const BLACK = "#000000";

const OwnerBidMenu: React.FC<OwnerBidMenuProps> = ({
  isOpen,
  onEdit,
  onDelete,
  onViewBids,
  onCloseBid,
  className,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`absolute z-10 bg-gray-100 rounded-full py-1 px-1 shadow-md ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-start">
        {/* Edit Bid */}
        <div className="flex items-center relative">
          <button
            onClick={onEdit}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Edit Bid"
            onMouseEnter={() => setHoveredItem("edit")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Edit3 size={10} stroke="currentColor" />
          </button>
          {hoveredItem === "edit" && (
            <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Edit Bid
            </span>
          )}
        </div>

        {/* View Bids */}
        <div className="flex items-center relative">
          <button
            onClick={onViewBids}
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

        {/* Close Bidding */}
        <div className="flex items-center relative">
          <button
            onClick={onCloseBid}
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

        {/* Delete Bid */}
        <div className="flex items-center relative">
          <button
            onClick={onDelete}
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
      </div>
    </div>
  );
};

export default OwnerBidMenu;
