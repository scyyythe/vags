import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Flag, Share2, Search, Undo2 } from "lucide-react";
import { toast } from "sonner";
import ShareModal from "../../local_components/share/ShareModal";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { reportCategories } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { normalizeReportType } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { ReportOption } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import useUndoArtworkReport from "@/hooks/mutate/report/undo/useUndoArtworkReport";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface SellCardMenuProps {
  isOpen: boolean;
  onReport: (data: { category: string; option?: string; description: string; additionalInfo: string }) => void;
  isReported: boolean;
  artworkId?: string;
  onUndoReport?: () => void;
  className?: string;
  positionOffset?: {
    top?: number;
    left?: number;
    marginTop?: number;
  };
}

const SellCardMenu: React.FC<SellCardMenuProps> = ({
  isOpen,
  onReport,
  isReported = false,
  artworkId,
  onUndoReport,
  className,
  positionOffset = { top: 8, left: -8, marginTop: -2 },
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const { handleUndoReport: undoArtworkReport } = useUndoArtworkReport();

  // Translation hooks
  const { language } = useLanguage();
  const shareText = useAutoTranslation("Share", language);
  const findSimilarText = useAutoTranslation("Find Similar", language);
  const reportText = useAutoTranslation("Report", language);
  const undoReportText = useAutoTranslation("Undo Report", language);
  const noArtworkIdText = useAutoTranslation("No artwork ID provided", language);
  const showingSimilarText = useAutoTranslation("Showing similar artworks...", language);

  // Calculate position for portal
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + (positionOffset.top || 8),
        left: rect.left + window.scrollX + (positionOffset.left || -8),
      });
    }
  }, [isOpen, positionOffset]);

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

  if (!isOpen) return <div ref={triggerRef} className={className} />;

  return (
    <>
      <div ref={triggerRef} className={className} />
      {typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className="absolute z-[9999] bg-gray-100 rounded-full py-1 px-1.5 shadow-md"
            style={{
              top: position.top,
              left: position.left,
              zIndex: 9999,
              marginTop: positionOffset.marginTop || -2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-start">
              {/* Share */}
              <MenuItem
                icon={<Share2 size={10} />}
                label={shareText}
                onHover={setHoveredItem}
                hoveredItem={hoveredItem}
                itemId="share"
                onClick={(e) => setShowShareModal(true)}
              />

              {/* Share Modal */}
              <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} linkToShare={shareUrl} />

              {/* Find Similar */}
              {/* <MenuItem
                icon={<Search size={10} />}
                label={findSimilarText}
                onHover={setHoveredItem}
                hoveredItem={hoveredItem}
                itemId="similar"
                onClick={() => toast.info(showingSimilarText)}
              /> */}

              {/* Report */}
              <MenuItem
                icon={<Flag size={10} fill={isReported ? "red" : "none"} stroke={isReported ? "red" : "currentColor"} />}
                label={reportText}
                onHover={setHoveredItem}
                hoveredItem={hoveredItem}
                itemId="report"
                onClick={(e) => setShowReportOptions(true)}
              />

              {/* Undo Report - Only show when content is reported */}
              {isReported && artworkId && (
                <MenuItem
                  icon={<Undo2 size={10} stroke="currentColor" />}
                  label={undoReportText}
                  onHover={setHoveredItem}
                  hoveredItem={hoveredItem}
                  itemId="undoReport"
                  onClick={(e) => {
                    if (!artworkId) {
                      toast.error(noArtworkIdText);
                      return;
                    }
                    undoArtworkReport(e, artworkId, onUndoReport, () => {
                      // Revert function - this will be called if undo fails
                      console.log("Undo failed, reverting local state");
                    });
                  }}
                />
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Report Options */}
      {showReportOptions &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <ReportOptionsPopup
            isOpen={showReportOptions}
            onClose={() => setShowReportOptions(false)}
            onSubmit={handleReportSubmit}
          />,
          document.body
        )}
    </>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  onHover: (id: string | null) => void;
  hoveredItem: string | null;
  itemId: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, onHover, hoveredItem, itemId }) => (
  <div className="flex items-center relative">
    <button
      onClick={(e) => onClick(e)}
      className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
      aria-label={label}
      onMouseEnter={() => onHover(itemId)}
      onMouseLeave={() => onHover(null)}
    >
      {icon}
    </button>
    {hoveredItem === itemId && (
      <span className="absolute left-10 z-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
        {label}
      </span>
    )}
  </div>
);

export default SellCardMenu;
