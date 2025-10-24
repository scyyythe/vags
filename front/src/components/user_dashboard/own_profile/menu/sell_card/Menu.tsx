import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, EyeOff, Eye, Trash2 } from "lucide-react";
import DeleteConfirmationPopup from "./DeleteConfirmation";
import useDeleteArtwork from "@/hooks/mutate/visibility/trash/useDeleteArtwork";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface SellMenuProps {
  isOpen: boolean;
  artworkId: string;
  artworkTitle?: string;
  isPublic?: boolean;
  onEdit: (id: string) => void;
  onToggleVisibility: (newVisibility: string, artworkId: string) => void;
  onDelete: () => void;
  onViewInsights: () => void;
  onMarkAsSold: (id: string) => void;
  className?: string;
  positionOffset?: {
    top?: number;
    left?: number;
    marginTop?: number;
  };
}

const SellMenu: React.FC<SellMenuProps> = ({
  isOpen,
  artworkId,
  onEdit,
  onToggleVisibility,
  onDelete,
  artworkTitle,
  isPublic = true,
  className,
  positionOffset = { top: 8, left: -8, marginTop: -2 },
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [publicStatus, setPublicStatus] = useState(isPublic);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const deleteArtwork = useDeleteArtwork();

  // Language and translation
  const { language } = useLanguage();
  const unlistText = useAutoTranslation("Unlist", language);
  const relistText = useAutoTranslation("Relist", language);
  const editText = useAutoTranslation("Edit", language);
  const deleteText = useAutoTranslation("Delete", language);
  const isNowListedText = useAutoTranslation("is now listed.", language);
  const hasBeenUnlistedText = useAutoTranslation("has been unlisted.", language);
  const artworkDeletedSuccessText = useAutoTranslation("Artwork deleted successfully.", language);
  const failedToDeleteText = useAutoTranslation("Failed to delete artwork.", language);
  const artworkText = useAutoTranslation("Artwork", language);

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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = showDeletePopup ? "hidden" : originalOverflow;
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showDeletePopup]);

  // Sync publicStatus with isPublic prop
  useEffect(() => {
    setPublicStatus(isPublic);
  }, [isPublic]);

  const handleToggleVisibility = () => {
    const newStatus = !publicStatus;
    setPublicStatus(newStatus);

    const visibilityString = newStatus ? "Listed" : "Unlisted";
    onToggleVisibility(visibilityString, artworkId);

    toast.success(
      newStatus
        ? `"${artworkTitle ?? artworkText}" ${isNowListedText}`
        : `"${artworkTitle ?? artworkText}" ${hasBeenUnlistedText}`,
      { closeButton: true }
    );
  };

  const handleConfirmDelete = () => {
    deleteArtwork.mutate(artworkId, {
      onSuccess: () => {
        setShowDeletePopup(false);
        toast.success(artworkDeletedSuccessText, { closeButton: true });
      },
      onError: () => {
        setShowDeletePopup(false);
        toast.error(failedToDeleteText, { closeButton: true });
      },
    });
  };

  if (!isOpen) return <div ref={triggerRef} className={className} />;

  return (
    <>
      <div ref={triggerRef} className={className} />
      {typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className="absolute bg-gray-100 dark:bg-gray-700 rounded-full py-1 px-1.5 shadow-md z-[60]"
            style={{
              top: position.top,
              left: position.left,
              marginTop: positionOffset.marginTop || -2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-start">
              {/* Unlist / Relist Button */}
              <MenuItem
                icon={publicStatus ? <EyeOff size={10} /> : <Eye size={10} />}
                label={publicStatus ? unlistText : relistText}
                onHover={setHoveredItem}
                hoveredItem={hoveredItem}
                itemId="visibility"
                onClick={handleToggleVisibility}
              />

              {/* Edit Button */}
              <MenuItem
                icon={<Pencil size={10} />}
                label={editText}
                onHover={setHoveredItem}
                hoveredItem={hoveredItem}
                itemId="edit"
                onClick={() => onEdit(artworkId)}
              />

              {/* Delete Button */}
              <MenuItem
                icon={<Trash2 size={10} />}
                label={deleteText}
                onHover={setHoveredItem}
                hoveredItem={hoveredItem}
                itemId="delete"
                onClick={() => setShowDeletePopup(true)}
                isDelete
              />
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        isOpen={showDeletePopup}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={handleConfirmDelete}
      />
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
  isDelete?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, onHover, hoveredItem, itemId, isDelete }) => (
  <div className="flex items-center relative">
    <button
      onClick={onClick}
              className={`p-2 rounded-full transition-colors ${
        isDelete ? "text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20" : "text-black dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
      aria-label={label}
      onMouseEnter={() => onHover(itemId)}
      onMouseLeave={() => onHover(null)}
    >
      {icon}
    </button>
    {hoveredItem === itemId && (
      <span className="absolute left-10 z-10 text-[9px] text-center bg-black dark:bg-gray-800 text-white dark:text-gray-100 px-2 py-1 rounded whitespace-nowrap">
        {label}
      </span>
    )}
  </div>
);

export default SellMenu;
