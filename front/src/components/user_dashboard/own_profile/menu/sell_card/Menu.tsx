import React, { useRef, useState, useEffect } from "react";
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
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [publicStatus, setPublicStatus] = useState(isPublic);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const navigate = useNavigate();
  const deleteArtwork = useDeleteArtwork();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = showDeletePopup ? "hidden" : originalOverflow;
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showDeletePopup]);

  if (!isOpen) return null;

  const handleToggleVisibility = () => {
    const newStatus = !publicStatus;
    setPublicStatus(newStatus);

    const visibilityString = newStatus ? "Listed" : "Unlisted";
    onToggleVisibility(visibilityString, artworkId);

    toast.success(
      newStatus
        ? `"${artworkTitle ?? "Artwork"}" is now listed.`
        : `"${artworkTitle ?? "Artwork"}" has been unlisted."`,
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

  return (
    <>
      <div
        ref={menuRef}
        className={`absolute z-10 bg-gray-100 rounded-full py-1 px-1.5 shadow-md ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start gap-1 text-[10px]">

          {/* Unlist / Relist Button */}
          <div className="flex items-center relative">
            <button
              onClick={handleToggleVisibility}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("visibility")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {publicStatus ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            {hoveredItem === "visibility" && (
              <span className="absolute left-8 text-[9px] bg-black text-white px-2 py-1 rounded">
                {publicStatus ? "Unlist" : "Relist"}
              </span>
            )}
          </div>

          {/* Edit Button */}
          <div className="flex items-center relative">
            <button
              onClick={() => onEdit(artworkId)}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("edit")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Pencil size={12} />
            </button>
            {hoveredItem === "edit" && (
              <span className="absolute left-8 text-[9px] bg-black text-white px-2 py-1 rounded">
                Edit
              </span>
            )}
          </div>

          {/* Delete Button */}
          <div className="flex items-center relative">
            <button
              onClick={() => setShowDeletePopup(true)}
              className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
              onMouseEnter={() => setHoveredItem("delete")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Trash2 size={12} />
            </button>
            {hoveredItem === "delete" && (
              <span className="absolute left-8 text-[9px] bg-black text-white px-2 py-1 rounded">
                Delete
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        isOpen={showDeletePopup}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default SellMenu;
