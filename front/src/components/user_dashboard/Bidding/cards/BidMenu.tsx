import React, { useRef, useState } from "react";
import { EyeOff, Flag, Undo2 } from "lucide-react";
import ReportOptionsPopup from "./ReportOptions";

interface ArtCardMenuProps {
  isOpen: boolean;
  onHide: () => void;
  onReport: () => void;
  onUndoReport?: () => void;
  isReported: boolean;
  isHidden?: boolean; 
  className?: string;
}

const BLACK = "#000000";

const BidMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onHide,
  onReport,
  onUndoReport,
  isReported = false,
  isHidden = false,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);

  if (!isOpen) return null;

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReportOptions(true);
  };

  const handleReportSubmit = (category: string, option?: string) => {
    console.log("Report submitted:", { category, option });
    onReport();
  };

  const handleUndoReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUndoReport) {
      onUndoReport();
    }
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
              <EyeOff
                size={10}
                fill={isHidden ? BLACK : "none"}
                stroke={isHidden ? BLACK : "currentColor"}
              />
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
              <Flag
                size={10}
                fill={isReported ? "#ea384c" : "none"}
                stroke={isReported ? "#ea384c" : "currentColor"}
              />
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
                onClick={handleUndoReport}
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
