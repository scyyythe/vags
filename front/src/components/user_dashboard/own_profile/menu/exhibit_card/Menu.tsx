import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Share2, BarChart2, MoreHorizontal, RotateCcw } from "lucide-react";
import DeleteConfirmation from "./DeleteConfirmation";
import RestoreConfirmation from "./RestoreConfirmation";
import { useDeleteExhibit } from "@/hooks/exhibit/useDeleteExhibit";
import ShareModal from "../../../local_components/share/ShareModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface ExhibitCardMenuProps {
  isOpen: boolean;
  artworkId: string;
  artworkTitle?: string;
  isShared: boolean;
  onEdit: (id: string) => void;
  onToggleVisibility: (newVisibility: boolean, id: string) => void;
  onViewInsights: (id: string) => void;
  isPublic?: boolean;
  visibility?: string;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  className?: string;
}

const ExhibitCardMenu: React.FC<ExhibitCardMenuProps> = ({
  isOpen,
  artworkId,
  isShared = false,
  onEdit,
  onToggleVisibility,
  onViewInsights,
  artworkTitle,
  onDelete,
  onRestore,
  isPublic = true,
  visibility,
  className,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [publicStatus, setPublicStatus] = useState(isPublic);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showRestorePopup, setShowRestorePopup] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const navigate = useNavigate();
  const deleteExhibit = useDeleteExhibit();
  const [showShareModal, setShowShareModal] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const { language } = useLanguage();

  // Translation hooks for all text content
  const shareText = useAutoTranslation("Share", language);
  const unpublishText = useAutoTranslation("Unpublish", language);
  const publishText = useAutoTranslation("Publish", language);
  const viewInsightsText = useAutoTranslation("View Insights", language);
  const editText = useAutoTranslation("Edit", language);
  const deleteText = useAutoTranslation("Delete", language);
  const restoreText = useAutoTranslation("Restore", language);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (showDeletePopup || showRestorePopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "auto";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [showDeletePopup, showRestorePopup]);

  if (!isOpen) return null;

  const handleToggleVisibility = () => {
    const newStatus = !publicStatus;
    setPublicStatus(newStatus);
    onToggleVisibility(newStatus, artworkId);
  };

  const handleConfirmDelete = () => {
    deleteExhibit.mutate(artworkId, {
      onSuccess: () => setShowDeletePopup(false),
      onError: () => setShowDeletePopup(false),
    });
  };

  const handleConfirmRestore = () => {
    if (onRestore) {
      onRestore(artworkId);
    }
    setShowRestorePopup(false);
  };

  const handleEditClick = () => {
    navigate(`/edit-exhibit/${artworkId}?mode=edit`);
  };

  return (
    <>
      <div
        ref={menuRef}
        className={`absolute z-10 bg-gray-100 rounded-full py-1 px-1.5 shadow-md ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start">
          {/* Share */}
          <div className="flex items-center relative">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("share")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Share2 size={11} />
            </button>
            {hoveredItem === "share" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">{shareText}</span>
            )}
          </div>

          {/* Share Modal */}
          <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} linkToShare={shareUrl} />

          {/* Toggle Visibility (Unpublish) */}
          <div className="flex items-center relative">
            <button
              onClick={handleToggleVisibility}
              className="px-[4px] py-[-10px] rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("visibility")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {publicStatus ? <i className="bx bx-show-alt text-[11px]" /> : <i className="bx bxs-hide text-[11px]" />}
            </button>
            {hoveredItem === "visibility" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">
                {publicStatus ? unpublishText : publishText}
              </span>
            )}
          </div>

          {/* View Insights */}
          <div className="flex items-center relative">
            <button
              onClick={() => navigate(`/view-insights/${artworkId}`)}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("insights")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <BarChart2 size={12} />
            </button>
            {hoveredItem === "insights" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                {viewInsightsText}
              </span>
            )}
          </div>

          {/* More Options (Edit & Delete) */}
          <div className="flex items-center relative">
            <button
              onClick={() => setIsMoreOptionsOpen((prev) => !prev)}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("more")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <MoreHorizontal size={12} />
            </button>

            {isMoreOptionsOpen && (
              <div className="absolute left-8 -top-3 bg-black rounded text-[9px] flex flex-col z-20 w-18">
                {visibility?.toLowerCase() !== "deleted" && (
                  <button
                    onClick={() => {
                      handleEditClick();
                      setIsMoreOptionsOpen(false);
                    }}
                    className="px-3 py-1 text-left text-white"
                  >
                    {editText}
                  </button>
                )}
                {visibility?.toLowerCase() !== "deleted" && (
                  <button
                    onClick={() => {
                      setShowDeletePopup(true);
                      setIsMoreOptionsOpen(false);
                    }}
                    className="px-3 py-1 text-left text-red-500 hover:text-red-400"
                  >
                    {deleteText}
                  </button>
                )}
                {visibility?.toLowerCase() === "deleted" && onRestore && (
                  <button
                    onClick={() => {
                      setShowRestorePopup(true);
                      setIsMoreOptionsOpen(false);
                    }}
                    className="px-3 py-1 text-left text-green-400 hover:text-green-300 flex items-center gap-1"
                  >
                    <RotateCcw size={8} />
                    {restoreText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeleteConfirmation
        isOpen={showDeletePopup}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Restore Confirmation Popup */}
      <RestoreConfirmation
        isOpen={showRestorePopup}
        onCancel={() => setShowRestorePopup(false)}
        onConfirm={handleConfirmRestore}
        exhibitTitle={artworkTitle}
      />
    </>
  );
};

export default ExhibitCardMenu;
