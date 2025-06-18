import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Share2, BarChart2, MoreHorizontal } from "lucide-react";
import DeleteConfirmationPopup from "@/components/user_dashboard/user_profile/components/status_options/popups/delete/DeletePopup";
import useDeleteArtwork from "@/hooks/mutate/visibility/trash/useDeleteArtwork";
import ShareModal from "../../../local_components/share/ShareModal";

interface ExhibitCardMenuProps {
  isOpen: boolean;
  artworkId: string;
  artworkTitle?: string;
  isShared: boolean;
  onEdit: (id: string) => void;
  onToggleVisibility: (newVisibility: boolean, id: string) => void;
  onViewInsights: (id: string) => void;
  isPublic?: boolean;
}

const ExhibitCardMenu: React.FC<ExhibitCardMenuProps> = ({
  isOpen,
  artworkId,
  isShared = false,
  onEdit,
  onToggleVisibility,
  onViewInsights,
  artworkTitle,
  isPublic = true,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [publicStatus, setPublicStatus] = useState(isPublic);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
    const navigate = useNavigate();
    const deleteArtwork = useDeleteArtwork();
    const [showShareModal, setShowShareModal] = useState(false);
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        if (showDeletePopup) {
        document.body.style.overflow = "hidden";
        } else {
        document.body.style.overflow = originalOverflow || "auto";
        }
        return () => {
        document.body.style.overflow = originalOverflow || "auto";
        };
    }, [showDeletePopup]);

    if (!isOpen) return null;

    const handleToggleVisibility = () => {
        const newStatus = !publicStatus;
        setPublicStatus(newStatus);
        onToggleVisibility(newStatus, artworkId);
    };

    const handleConfirmDelete = () => {
        deleteArtwork.mutate(artworkId, {
        onSuccess: () => setShowDeletePopup(false),
        onError: () => setShowDeletePopup(false),
        });
    };

    const handleEditClick = () => {
        onEdit(artworkId);
        navigate(`/update/${artworkId}`);
    };

    return (
        <>
        <div
            ref={menuRef}
            className="absolute -left-2 top-5 z-10 bg-gray-100 rounded-full py-2 px-2 shadow-md"
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
                <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">Share</span>
                )}
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                linkToShare={shareUrl}
            />

            {/* Toggle Visibility (Unpublish) */}
            <div className="flex items-center relative">
                <button
                onClick={handleToggleVisibility}
                className="px-[4px] py-[-10px] rounded-full text-black hover:bg-gray-200 transition-colors"
                onMouseEnter={() => setHoveredItem("visibility")}
                onMouseLeave={() => setHoveredItem(null)}
                >
                {publicStatus ? (
                    <i className="bx bx-show-alt text-[11px]" />
                ) : (
                    <i className="bx bxs-hide text-[11px]" />
                )}
                </button>
                {hoveredItem === "visibility" && (
                <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded">
                    {publicStatus ? "Unpublish" : "Publish"}
                </span>
                )}
            </div>

            {/* View Insights */}
            <div className="flex items-center relative">
                <button
                onClick={() => onViewInsights(artworkId)}
                className="p-1 rounded-full text-black hover:bg-gray-200 transition-colors"
                onMouseEnter={() => setHoveredItem("insights")}
                onMouseLeave={() => setHoveredItem(null)}
                >
                <BarChart2 size={12} />
                </button>
                {hoveredItem === "insights" && (
                <span className="absolute left-10 text-[9px] bg-black text-white px-2 py-1 rounded whitespace-nowrap">View Insights</span>
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
                    <button
                    onClick={() => {
                        handleEditClick();
                        setIsMoreOptionsOpen(false);
                    }}
                    className="px-3 py-1 text-left text-white"
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

export default ExhibitCardMenu;
