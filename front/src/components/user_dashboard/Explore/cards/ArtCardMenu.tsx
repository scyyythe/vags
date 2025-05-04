import React, { useRef, useState } from "react";
import { Bookmark, EyeOff, Flag } from "lucide-react";

interface ArtCardMenuProps {
  isOpen: boolean;
  onFavorite: () => void;
  onHide: () => void;
  onReport: () => void;
  isFavorite: boolean;
  isReported: boolean;
  isHidden?: boolean;
  className?: string;
}

const YELLOW = "#ffc107";
const BLACK = "#000000";

const ArtCardMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onFavorite,
  onHide,
  onReport,
  isFavorite = false,
  isReported = false,
  isHidden = false,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute -right-1 top-8 z-10 bg-gray-100 rounded-full py-1 px-1 shadow-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-start">
        {/* Favorite */}
        <div className="flex items-center relative">
          <button
            onClick={onFavorite}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Favorite"
            onMouseEnter={() => setHoveredItem("favorite")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Bookmark size={10} fill={isFavorite ? YELLOW : "none"} stroke={isFavorite ? YELLOW : "currentColor"} />
          </button>
          {hoveredItem === "favorite" && (
            <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Favorite
            </span>
          )}
        </div>

        {/* Hide */}
        <div className="flex items-center relative">
          <button
            onClick={onHide}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Hide"
            onMouseEnter={() => setHoveredItem("hide")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <EyeOff size={10} fill={isHidden ? BLACK : "none"} stroke={isHidden ? BLACK : "currentColor"} />
          </button>
          {hoveredItem === "hide" && (
            <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Hide
            </span>
          )}
        </div>

        {/* Report*/}
        <div className="flex items-center relative">
          <button
            onClick={onReport}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Report"
            onMouseEnter={() => setHoveredItem("report")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Flag size={10} fill={isReported ? "#ea384c" : "none"} stroke={isReported ? "#ea384c" : "currentColor"} />
          </button>
          {hoveredItem === "report" && (
            <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Report
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtCardMenu;
