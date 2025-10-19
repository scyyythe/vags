import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, EyeOff, Eye, Trash2 } from "lucide-react";
import DeleteConfirmationPopup from "./DeleteConfirmation";
import useDeleteArtwork from "@/hooks/mutate/visibility/trash/useDeleteArtwork";

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
      newStatus ? `"${artworkTitle ?? "Artwork"}" is now listed.` : `"${artworkTitle ?? "Artwork"}" has been unlisted.`,
      { closeButton: true }
    );
  };

  const handleConfirmDelete = () => {
    deleteArtwork.mutate(artworkId, {
      onSuccess: () => {
        setShowDeletePopup(false);
        toast.success("Artwork deleted successfully.", { closeButton: true });
      },
      onError: () => {
        setShowDeletePopup(false);
        toast.error("Failed to delete artwork.", { closeButton: true });
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
            className="absolute bg-gray-100 rounded-full py-1 px-1.5 shadow-md"
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
                label={publicStatus ? "Unlist" : "Relist"}
                onHover={setHoveredItem}
                hoveredItem={hoveredItem}
                itemId="visibility"
                onClick={handleToggleVisibility}
              />

              {/* Edit Button */}
              <MenuItem
                icon={<Pencil size={10} />}
                label="Edit"
                onHover={setHoveredItem}
                hoveredItem={hoveredItem}
                itemId="edit"
                onClick={() => onEdit(artworkId)}
              />

              {/* Delete Button */}
              <MenuItem
                icon={<Trash2 size={10} />}
                label="Delete"
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
        isDelete ? "text-red-600 hover:bg-red-100" : "text-black hover:bg-gray-200"
      }`}
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

export default SellMenu;
