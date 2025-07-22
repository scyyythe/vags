import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Pencil,
  EyeOff,
  Eye,
  BarChart,
  Trash2,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import DeleteConfirmationPopup from "./DeleteConfirmation";
import useDeleteArtwork from "@/hooks/mutate/visibility/trash/useDeleteArtwork";

interface SellMenuProps {
  isOpen: boolean;
  artworkId: string;
  isOwnerView?: boolean;
  artworkTitle?: string;
  isPublic?: boolean;
  isSold?: boolean;
  onEdit: (id: string) => void;
  onToggleVisibility: (newVisibility: boolean, id: string) => void;
  onDelete: () => void;
  onViewInsights: () => void;
  onMarkAsSold: (id: string) => void;
}

const SellMenu: React.FC<SellMenuProps> = ({
  isOpen,
  artworkId,
  onEdit,
  onToggleVisibility,
  onDelete,
  onMarkAsSold,
  onViewInsights,
  artworkTitle,
  isPublic = true,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [publicStatus, setPublicStatus] = useState(isPublic);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isSold, setIsSold] = useState(false);
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
    onToggleVisibility(newStatus, artworkId);

    toast.success(
      newStatus
        ? `"${artworkTitle ?? "Artwork"}" is now listed.`
        : `"${artworkTitle ?? "Artwork"}" has been unlisted.`,
        {
          closeButton: true,
        }
    );
  };


  const handleConfirmDelete = () => {
    deleteArtwork.mutate(artworkId, {
      onSuccess: () => setShowDeletePopup(false),
      onError: () => setShowDeletePopup(false),
    });
  };

  const handleEdit = () => {
    navigate("/sell", { state: { artworkId } });
    setIsMoreOptionsOpen(false);
  };

  const handleInsights = () => {
    navigate(`/insights/${artworkId}`);
  };

  const handleMarkAsSold = () => {
    const newSoldStatus = !isSold;
    setIsSold(newSoldStatus);
    onMarkAsSold(artworkId);

    toast.success(
      newSoldStatus
        ? `"${artworkTitle ?? "Artwork"}" marked as sold.`
        : `"${artworkTitle ?? "Artwork"}" marked as not sold.`,
      {
        closeButton: true,
      }
    );
  };


  return (
    <>
      <div
        ref={menuRef}
        className="absolute right-2 top-8 z-10 bg-gray-100 rounded-full py-2 px-2 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start gap-1 text-[10px]">
            {/* Mark as Sold */}
            <div className="flex items-center relative">
                <button
                    onClick={handleMarkAsSold}
                    className={`p-1 rounded-full transition-colors hover:bg-gray-200 ${
                    isSold ? "text-green-600" : "text-black"
                    }`}
                    onMouseEnter={() => setHoveredItem("sold")}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <CheckCircle size={11} />
                </button>
                {hoveredItem === "sold" && (
                    <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                        {isSold ? "Mark as Not Sold" : "Mark as Sold"}
                    </span>
                )}
            </div>

          {/* Toggle Visibility */}
          <div className="flex items-center relative">
            <button
              onClick={handleToggleVisibility}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("visibility")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {publicStatus ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
            {hoveredItem === "visibility" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">
                {publicStatus ? "Unlist" : "List"}
              </span>
            )}
          </div>

          {/* View Insights */}
          <div className="flex items-center relative">
            <button
              onClick={handleInsights}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("insights")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <BarChart size={11} />
            </button>
            {hoveredItem === "insights" && (
              <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                View Insights
              </span>
            )}
          </div>

          {/* More Options: Edit & Delete */}
          <div className="flex items-center relative">
            <button
              onClick={() => setIsMoreOptionsOpen((prev) => !prev)}
              className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
              onMouseEnter={() => setHoveredItem("more")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <MoreHorizontal size={11} />
            </button>

            {isMoreOptionsOpen && (
              <div className="absolute left-8 -top-3 bg-black rounded text-[9px] flex flex-col z-20 w-18">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-left text-white hover:bg-gray-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDeletePopup(true);
                    setIsMoreOptionsOpen(false);
                  }}
                  className="px-3 py-1 text-left text-red-500 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
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
