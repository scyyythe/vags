import React, { useRef, useState } from "react";
import { Flag, Mail, Share2, Search, FileText, Brush } from "lucide-react";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { reportCategories } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { normalizeReportType } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { ReportOption } from "@/components/user_dashboard/Bidding/cards/ReportOptions";

interface SellCardMenuProps {
  isOpen: boolean;
  onReport: (data: { category: string; option?: string; description: string; additionalInfo: string }) => void;
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
            onClick={() => alert("Share functionality coming soon.")}
          />

          {/* Find Similar */}
          <MenuItem
            icon={<Search size={10} />}
            label="Find Similar"
            onHover={setHoveredItem}
            hoveredItem={hoveredItem}
            itemId="similar"
            onClick={() => alert("Showing similar artworks...")}
          />

          {/* Certificate */}
          {/* <MenuItem
            icon={<FileText size={12} />}
            label="Certificate"
            onHover={setHoveredItem}
            hoveredItem={hoveredItem}
            itemId="certificate"
            onClick={() => alert("Downloading certificate...")}
          /> */}

          {/* Request Custom Art */}
          {/* <MenuItem
            icon={<Brush size={12} />}
            label="Custom Art"
            onHover={setHoveredItem}
            hoveredItem={hoveredItem}
            itemId="custom"
            onClick={() => alert("Redirecting to custom art request...")}
          /> */}

          {/* Report */}
          <MenuItem
            icon={<Flag size={10} fill={isReported ? "red" : "none"} stroke={isReported ? "red" : "currentColor"} />}
            label="Report"
            onHover={setHoveredItem}
            hoveredItem={hoveredItem}
            itemId="report"
            onClick={() => setShowReportOptions(true)}
          />
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

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  onHover: (id: string | null) => void;
  hoveredItem: string | null;
  itemId: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, onHover, hoveredItem, itemId }) => (
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
