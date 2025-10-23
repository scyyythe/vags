import React, { useRef, useState } from "react";
import { Bookmark, EyeOff, Eye, Flag, Share2, Undo2 } from "lucide-react";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { reportCategories } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { normalizeReportType } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { ReportOption } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import ShareModal from "../../local_components/share/ShareModal";
import useUndoArtworkReport from "@/hooks/mutate/report/undo/useUndoArtworkReport";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
interface ArtCardMenuProps {
  isOpen: boolean;
  onFavorite: () => void;
  onHide: () => void;
  onReport: (data: { category: string; option?: string; description: string; additionalInfo: string }) => void;

  onUndoReport?: () => void;
  onUndoReportRevert?: () => void;
  isFavorite: boolean;
  isReported: boolean;
  isShared: boolean;
  isHidden?: boolean;
  className?: string;
  isReportedFromBulk?: boolean;
  reportStatusFromBulk?: "Pending" | "In Progress" | "Resolved" | null;
  artworkId?: string;
}

const YELLOW = "#ffc107";
const BLACK = "#000000";

const ArtCardMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onFavorite,
  onHide,
  onReport,
  onUndoReport,
  onUndoReportRevert,
  isFavorite = false,
  isReported = false,
  isShared = false,
  isHidden = false,
  isReportedFromBulk,
  reportStatusFromBulk,
  artworkId,
  className,
}) => {
  const { language } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const [showReportOptions, setShowReportOptions] = useState(false);
  const { handleUndoReport: undoArtworkReport } = useUndoArtworkReport();

  // Translations for hovering texts
  const favoriteText = useAutoTranslation("Favorite", language);
  const shareText = useAutoTranslation("Share", language);
  const hideText = useAutoTranslation("Hide", language);
  const unhideText = useAutoTranslation("Unhide", language);
  const reportText = useAutoTranslation("Report", language);
  const undoReportText = useAutoTranslation("Undo Report", language);
  
  // Console error messages
  const categoryNotFoundText = useAutoTranslation("Category not found for id:", language);
  
  const handleReportSubmit = (categoryId: string, optionData?: ReportOption | string) => {
    const selectedCategory = reportCategories.find((cat) => cat.id === categoryId);
    if (!selectedCategory) {
      console.error(categoryNotFoundText, categoryId);
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

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={menuRef}
        className={`absolute z-10 bg-gray-100 dark:bg-gray-800 rounded-full py-1 px-1 shadow-md ${className || "-right-1 top-8"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start">
          {/* Favorite */}

          <div className="flex items-center relative">
            <button
              onClick={onFavorite}
              className="p-2 rounded-full text-black dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={favoriteText}
              onMouseEnter={() => setHoveredItem("favorite")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Bookmark
                size={10}
                fill={isFavorite ? "#ffc107" : "none"}
                stroke={isFavorite ? "#ffc107" : "currentColor"}
              />
            </button>
            {hoveredItem === "favorite" && (
              <span className="absolute left-10 text-[9px] text-center bg-black dark:bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                {favoriteText}
              </span>
            )}
          </div>

          {/* Share */}
          <div className="flex items-center relative">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-full text-black dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={shareText}
              onMouseEnter={() => setHoveredItem("share")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Share2 size={10} fill={isShared ? "#ea384c" : "none"} stroke={isShared ? "#ea384c" : "currentColor"} />
            </button>
            {hoveredItem === "share" && (
              <span className="absolute left-10 text-[9px] text-center bg-black dark:bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                {shareText}
              </span>
            )}
          </div>

          {/* Share Modal */}
          <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} linkToShare={shareUrl} />

          {/* Hide / Unhide */}
          <div className="flex items-center relative">
            <button
              onClick={onHide}
              className="p-2 rounded-full text-black dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={isHidden ? unhideText : hideText}
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
              <span className="absolute left-10 text-[9px] text-center bg-black dark:bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                {isHidden ? unhideText : hideText}
              </span>
            )}
          </div>

          {/* Report */}
          <div className="flex items-center relative">
            <button
              onClick={() => setShowReportOptions(true)}
              className="p-2 rounded-full text-black dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={reportText}
              onMouseEnter={() => setHoveredItem("report")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Flag size={10} fill={isReported ? "red" : "none"} stroke={isReported ? "red" : "currentColor"} />
            </button>

            {hoveredItem === "report" && (
              <span className="absolute left-10 text-[9px] text-center bg-black dark:bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                {reportText}
              </span>
            )}
          </div>

          {/* Undo Report - Only show when content is reported */}
          {isReported && artworkId && (
            <div className="flex items-center relative">
              <button
                onClick={(e) => {
                  undoArtworkReport(e, artworkId, onUndoReport, onUndoReportRevert);
                }}
                className="p-2 rounded-full text-black dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={undoReportText}
                onMouseEnter={() => setHoveredItem("undoReport")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Undo2 size={10} stroke="currentColor" />
              </button>
              {hoveredItem === "undoReport" && (
                <span className="absolute left-10 text-[9px] text-center bg-black dark:bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                  {undoReportText}
                </span>
              )}
            </div>
          )}
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
