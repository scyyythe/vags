import React, { useRef, useState } from "react";
import { Flag, Mail } from "lucide-react";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { reportCategories } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { normalizeReportType } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { ReportOption } from "@/components/user_dashboard/Bidding/cards/ReportOptions";

interface SellCardMenuProps {
  isOpen: boolean;
  onContact: () => void;
  onReport: (data: { category: string; option?: string; description: string; additionalInfo: string }) => void;
  isReported: boolean;
  className?: string;
}

const SellCardMenu: React.FC<SellCardMenuProps> = ({
  isOpen,
  onContact,
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
          {/* Contact Artist / Seller */}
          <div className="flex items-center relative">
            <button
              onClick={onContact}
              className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
              aria-label="Contact Seller"
              onMouseEnter={() => setHoveredItem("contact")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Mail size={10} />
            </button>
            {hoveredItem === "contact" && (
              <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                Contact Artist
              </span>
            )}
          </div>

          {/* Report */}
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

export default SellCardMenu;
