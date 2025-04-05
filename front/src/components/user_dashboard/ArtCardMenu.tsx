import React, { useRef, useEffect, useState } from "react";
import { Star, Bookmark, EyeOff, Flag } from "lucide-react";

interface ArtCardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onFavorite: () => void;
  onHide: () => void;
  onReport: () => void;
  onSave?: () => void;
  isSaved: boolean;
  isFavorited: boolean;
  isReported: boolean;
}

const ArtCardMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onClose,
  onFavorite,
  onHide,
  onReport,
  onSave,
  isSaved = false,
  isFavorited = false,
  isReported = false,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-10 bg-gray-100 rounded-full py-2 px-1 shadow-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-start space-y-1">
        <div className="flex items-center relative">
          <button
            onClick={onSave}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-xs"
            aria-label="Save"
            onMouseEnter={() => setHoveredItem("share")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Bookmark size={15} />
          </button>
          {hoveredItem === "share" && (
            <span className="absolute left-10 text-xs text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Save
            </span>
          )}
        </div>

        <div className="flex items-center relative">
          <button
            onClick={onFavorite}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Favorite"
            onMouseEnter={() => setHoveredItem("save")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Star size={15} fill={isFavorited ? "#ffc107" : "none"} stroke={isFavorited ? "#ffc107" : "currentColor"}/>
          </button>
          {hoveredItem === "save" && (
            <span className="absolute left-10 text-xs text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Favorite
            </span>
          )}
        </div>

        <div className="flex items-center relative">
          <button
            onClick={onHide}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Hide"
            onMouseEnter={() => setHoveredItem("hide")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <EyeOff size={15} />
          </button>
          {hoveredItem === "hide" && (
            <span className="absolute left-10 text-xs text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Hide
            </span>
          )}
        </div>

        <div className="flex items-center relative">
          <button
            onClick={onReport}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Report"
            onMouseEnter={() => setHoveredItem("report")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Flag size={15} fill={isReported ? "#ea384c" : "none"} stroke={isReported ? "#ea384c" : "currentColor"} />
          </button>
          {hoveredItem === "report" && (
            <span className="absolute left-10 text-xs text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Report
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtCardMenu;
