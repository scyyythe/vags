import React, { useRef, useState } from "react";
import { DollarSign, ShoppingCart, Pencil, Eye, Trash } from "lucide-react";

interface ArtCardMenuProps {
  isOpen: boolean;
  onRequestBid: () => void;
  onSell: () => void;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onArchive: () => void;
  isPublic?: boolean;
}

const ArtCardMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onRequestBid,
  onSell,
  onEdit,
  onToggleVisibility,
  onArchive,
  isPublic = true,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-10 bg-gray-100 rounded-full py-2 px-2 shadow-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-start gap-2">
        {/* Request to Bid */}
        <div className="flex items-center relative">
          <button
            onClick={onRequestBid}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            onMouseEnter={() => setHoveredItem("bid")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <DollarSign size={16} />
          </button>
          {hoveredItem === "bid" && (
            <span className="absolute left-10 text-xs bg-black text-white px-2 py-1 rounded">
              Request to Bid
            </span>
          )}
        </div>

        {/* Sell Artwork */}
        <div className="flex items-center relative">
          <button
            onClick={onSell}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            onMouseEnter={() => setHoveredItem("sell")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <ShoppingCart size={16} />
          </button>
          {hoveredItem === "sell" && (
            <span className="absolute left-10 text-xs bg-black text-white px-2 py-1 rounded">
              Sell artwork
            </span>
          )}
        </div>

        {/* Edit */}
        <div className="flex items-center relative">
          <button
            onClick={onEdit}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            onMouseEnter={() => setHoveredItem("edit")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Pencil size={16} />
          </button>
          {hoveredItem === "edit" && (
            <span className="absolute left-10 text-xs bg-black text-white px-2 py-1 rounded">
              Edit
            </span>
          )}
        </div>

        {/* Toggle Visibility */}
        <div className="flex items-center relative">
          <button
            onClick={onToggleVisibility}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            onMouseEnter={() => setHoveredItem("visibility")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Eye size={16} fill={isPublic ? "#000" : "none"} />
          </button>
          {hoveredItem === "visibility" && (
            <span className="absolute left-10 text-xs bg-black text-white px-2 py-1 rounded">
              {isPublic ? "Public" : "Private"}
            </span>
          )}
        </div>

        {/* Archive */}
        <div className="flex items-center relative">
          <button
            onClick={onArchive}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            onMouseEnter={() => setHoveredItem("archive")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Trash size={16} />
          </button>
          {hoveredItem === "archive" && (
            <span className="absolute left-10 text-xs bg-black text-white px-2 py-1 rounded">
              Archive
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtCardMenu;
