import React, { useRef, useState } from "react";
import { EyeOff, Flag, Undo2, Share2 } from "lucide-react";
import ShareModal from "../../local_components/share/ShareModal";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import useUndoExhibitReport from "@/hooks/mutate/report/undo/useUndoExhibitReport";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface ExhibitMenuProps {
  exhibitId: string;
  isOpen: boolean;
  onHide: () => void;
  onReport: (category: string, option?: string) => void;
  onUndoReport?: () => void;
  isReported?: boolean;
  isShared: boolean;
  isHidden?: boolean;
  className?: string;
}

const BLACK = "#000000";

const ExhibitMenu: React.FC<ExhibitMenuProps> = ({
  exhibitId,
  isOpen,
  onHide,
  onReport,
  onUndoReport,
  isReported = false,
  isShared = false,
  isHidden = false,
  className,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const { language } = useLanguage();

  // Translation hooks for all text content
  const shareText = useAutoTranslation("Share", language);
  const hideText = useAutoTranslation("Hide", language);
  const reportText = useAutoTranslation("Report", language);
  const undoReportText = useAutoTranslation("Undo Report", language);

  const { handleUndoReport } = useUndoExhibitReport();

  if (!isOpen) return null;

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReportOptions(true);
  };

  const handleReportSubmit = (category: string, option?: string) => {
    setShowReportOptions(false);
    onReport(category, option);
  };

  return (
    <>
      <div
        ref={menuRef}
        className={`absolute z-10 bg-gray-100 rounded-full py-1 px-1 shadow-md ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start">
          {/* Share */}
          <div className="flex items-center relative">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
              aria-label="Share"
              onMouseEnter={() => setHoveredItem("share")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Share2 size={10} fill={isShared ? "#ea384c" : "none"} stroke={isShared ? "#ea384c" : "currentColor"} />
            </button>
            {hoveredItem === "share" && (
              <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                {shareText}
              </span>
            )}
          </div>

          <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} linkToShare={shareUrl} />

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
                {hideText}
              </span>
            )}
          </div>

          {/* Report */}
          <div className="flex items-center relative">
            <button
              onClick={handleReportClick}
              className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
              aria-label="Report"
              onMouseEnter={() => setHoveredItem("report")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Flag size={10} fill={isReported ? "#ea384c" : "none"} stroke={isReported ? "#ea384c" : "currentColor"} />
            </button>
            {hoveredItem === "report" && (
              <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                {reportText}
              </span>
            )}
          </div>

          {/* Undo Report */}
          {isReported && (
            <div className="flex items-center relative">
              <button
                onClick={(e) => handleUndoReport(e, exhibitId)}
                className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
                aria-label="Undo Report"
                onMouseEnter={() => setHoveredItem("undoReport")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Undo2 size={10} stroke="currentColor" />
              </button>
              {hoveredItem === "undoReport" && (
                <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                  {undoReportText}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report Options Popup */}
      <ReportOptionsPopup
        isOpen={showReportOptions}
        onClose={() => setShowReportOptions(false)}
        onSubmit={handleReportSubmit}
      />
    </>
  );
};

export default ExhibitMenu;
