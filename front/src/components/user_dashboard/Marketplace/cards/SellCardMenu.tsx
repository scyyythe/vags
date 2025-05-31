import React, { useRef, useState } from "react";
import { Flag, Share2, Search } from "lucide-react";
import { toast } from "sonner";

import ShareModal from "../../local_components/share/ShareModal";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { reportCategories } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { normalizeReportType } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { ReportOption } from "@/components/user_dashboard/Bidding/cards/ReportOptions";

interface SellCardMenuProps {
  isOpen: boolean;
  onReport: (data: {
    category: string;
    option?: string;
    description: string;
    additionalInfo: string;
  }) => void;
  isReported: boolean;
  className?: string;
}

const SellCardMenu: React.FC<SellCardMenuProps> = ({
  isOpen,
  onReport,
  isReported = false,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleReportSubmit = (
    categoryId: string,
    optionData?: ReportOption | string
  ) => {
    const selectedCategory = reportCategories.find(
      (cat) => cat.id === categoryId
    );
    if (!selectedCategory) {
      console.error("Category not found for id:", categoryId);
      return;
    }

    const isCustomReason = typeof optionData === "string";
    const selectedOption = !isCustomReason
      ? (optionData as ReportOption)
      : null;

    const option = isCustomReason
      ? optionData
      : selectedOption?.id || "";
    const additionalInfo = isCustomReason
      ? optionData
      : selectedOption?.additionalInfo || "";

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
        className="absolute -right-1.5 top-5 z-10 bg-gray-100 rounded-full py-1 px-1 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start">
          {/* Share */}
          <MenuItem
            icon={<Share2 size={10} />}
            label="Share"
            onHover={setHoveredItem}
            hoveredItem={hoveredItem}
            itemId="share"
            onClick={() => setShowShareModal(true)}
          />

          {/* Share Modal */}
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            linkToShare={shareUrl}
          />

          {/* Find Similar */}
          <MenuItem
            icon={<Search size={10} />}
            label="Find Similar"
            onHover={setHoveredItem}
            hoveredItem={hoveredItem}
            itemId="similar"
            onClick={() => toast.info("Showing similar artworks...")}
          />

          {/* Report */}
          <MenuItem
            icon={
              <Flag
                size={10}
                fill={isReported ? "red" : "none"}
                stroke={isReported ? "red" : "currentColor"}
              />
            }
            label="Report"
            onHover={setHoveredItem}
            hoveredItem={hoveredItem}
            itemId="report"
            onClick={() => setShowReportOptions(true)}
          />
        </div>
      </div>

      {/* Report Options */}
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

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  onHover: (id: string | null) => void;
  hoveredItem: string | null;
  itemId: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onClick,
  onHover,
  hoveredItem,
  itemId,
}) => (
  <div className="flex items-center relative">
    <button
      onClick={onClick}
      className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
      aria-label={label}
      onMouseEnter={() => onHover(itemId)}
      onMouseLeave={() => onHover(null)}
    >
      {icon}
    </button>
    {hoveredItem === itemId && (
      <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
        {label}
      </span>
    )}
  </div>
);

export default SellCardMenu;
