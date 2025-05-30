import React, { useRef, useState } from "react";
import { Bookmark, EyeOff, Eye, Flag, Undo2 } from "lucide-react";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { reportCategories } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { normalizeReportType } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { ReportOption } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
interface ArtCardMenuProps {
  isOpen: boolean;
  onFavorite: () => void;
  onHide: () => void;
  onReport: (data: { category: string; option?: string; description: string; additionalInfo: string }) => void;

  onUndoReport?: () => void;
  isFavorite: boolean;
  isReported: boolean;
  isHidden?: boolean;
  className?: string;
  isReportedFromBulk?: boolean;
  reportStatusFromBulk?: "Pending" | "In Progress" | "Resolved" | null;
}

const YELLOW = "#ffc107";
const BLACK = "#000000";

const ArtCardMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onFavorite,
  onHide,
  onReport,
  onUndoReport,
  isFavorite = false,
  isReported = false,
  isHidden = false,
  isReportedFromBulk,
  reportStatusFromBulk,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const handleReportSubmit = (categoryId: string, optionData?: ReportOption | string) => {
    const selectedCategory = reportCategories.find((cat) => cat.id === categoryId);
    if (!selectedCategory) {
      console.error("Category not found for id:", categoryId);
      return;
    }

    const isCustomReason = typeof optionData === "string";
    const selectedOption = !isCustomReason ? (optionData as ReportOption) : null;

    const option = isCustomReason ? optionData : selectedOption?.id || "";
    const additionalInfo = isCustomReason ? optionData : selectedOption?.additionalInfo || "";

    const normalizedCategory = normalizeReportType(option, categoryId);

    onReport({
      category: normalizedCategory,
      option,
      description: selectedCategory.title,
      additionalInfo,
    });

    setShowReportOptions(false);
  };

  const handleUndoReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUndoReport) {
      onUndoReport();
    }
  };

  if (!isOpen) return null;

  return (
    <>
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

          {/* Hide / Unhide */}
          <div className="flex items-center relative">
            <button
              onClick={onHide}
              className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
              aria-label={isHidden ? "Unhide" : "Hide"}
              onMouseEnter={() => setHoveredItem("hide")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {isHidden ? (
                <Eye size={10} fill={BLACK} stroke={BLACK} />
              ) : (
                <EyeOff size={10} fill="none" stroke="currentColor" />
              )}
            </button>
            {hoveredItem === "hide" && (
              <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                {isHidden ? "Unhide" : "Hide"}
              </span>
            )}
          </div>

          {/* Report / Undo */}
          <div className="flex items-center relative">
            <button
              onClick={() => setShowReportOptions(true)}
              className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
              aria-label="Report"
              onMouseEnter={() => setHoveredItem("report")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Flag size={10} fill={isReported ? "red" : "none"} stroke={isReported ? "red" : "currentColor"} />
            </button>

            {hoveredItem === "report" && (
              <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                Report
              </span>
            )}
            {hoveredItem === "undo" && (
              <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                Undo Report
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Report Options Popup */}
      {showReportOptions && (
        <ReportOptionsPopup
          isOpen={showReportOptions}
          onClose={() => setShowReportOptions(false)}
          onSubmit={handleReportSubmit}
        />
      )}
    </>
  );
};

export default ArtCardMenu;
