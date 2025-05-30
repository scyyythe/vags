import React, { useRef, useState } from "react";
import { EyeOff, Flag, Undo2 } from "lucide-react";
import ReportOptionsPopup from "./ReportOptions";
import { reportCategories } from "./ReportOptions";
import { normalizeReportType } from "./ReportOptions";
import { ReportOption } from "./ReportOptions";
import useUndoAuctionReport from "@/hooks/mutate/report/undo/useUndoReport";
interface ArtCardMenuProps {
  isOpen: boolean;
  onHide: () => void;
  onReport: (data: { category: string; option?: string; description: string; additionalInfo: string }) => void;
  onUndoReport?: () => void;
  isReported: boolean;
  isHidden?: boolean;
  className?: string;
  auctionId: string;
}

const BLACK = "#000000";

const BidMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onHide,
  onReport,
  onUndoReport,
  isReported = false,
  isHidden = false,
  auctionId,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const { handleUndoReport } = useUndoAuctionReport();

  if (!isOpen) return null;

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReportOptions(true);
  };
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

  return (
    <>
      <div
        ref={menuRef}
        className="absolute -left-2 top-8 z-10 bg-gray-100 rounded-full py-1 px-1 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start">
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
                Report
              </span>
            )}
          </div>

          {/* Undo Report - Only show when content is reported */}
          {isReported && (
            <div className="flex items-center relative">
              <button
                onClick={(e) => handleUndoReport(e, auctionId)}
                className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
                aria-label="Undo Report"
                onMouseEnter={() => setHoveredItem("undoReport")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Undo2 size={10} stroke="currentColor" />
              </button>
              {hoveredItem === "undoReport" && (
                <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                  Undo Report
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

export default BidMenu;
