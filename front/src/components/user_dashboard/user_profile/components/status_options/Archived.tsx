import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, ArchiveRestore, Trash2 } from "lucide-react";
import DeleteConfirmationPopup from "@/components/user_dashboard/own_profile/DeletePopup"; 

interface ArtCardMenuProps {
  isOpen: boolean;
  onEdit: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  className?: string;
}

const BLACK = "#000000";

const ArchivedMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onEdit,
  onUnarchive,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const navigate = useNavigate();
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  if (!isOpen) return null;

  const handleUpdateClick = () => {
    navigate("/update");
  };

  return (
    <>
    <div
      ref={menuRef}
      className="absolute -right-1 top-8 z-10 bg-gray-100 rounded-full py-1 px-1 shadow-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-start">
        {/* Edit */}
        <div className="flex items-center relative">
          <button
            onClick={() => {
                handleUpdateClick();
                setIsEditOpen(false); 
            }}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Edit"
            onMouseEnter={() => setHoveredItem("edit")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Pencil size={10} stroke={BLACK} />
          </button>
          {hoveredItem === "edit" && (
            <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Edit
            </span>
          )}
        </div>

        {/* Unarchive */}
        <div className="flex items-center relative">
          <button
            onClick={onUnarchive}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Unarchive"
            onMouseEnter={() => setHoveredItem("unarchive")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <ArchiveRestore size={10} stroke={BLACK} />
          </button>
          {hoveredItem === "unarchive" && (
            <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Unarchive
            </span>
          )}
        </div>

        {/* Delete */}
        <div className="flex items-center relative">
          <button
            onClick={() => {
                setShowDeletePopup(true);
                setIsEditOpen(false);
            }}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Delete"
            onMouseEnter={() => setHoveredItem("delete")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Trash2 size={10} className="text-red-700"  />
          </button>
          {hoveredItem === "delete" && (
            <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
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
            onConfirm={() => {
            toast.success("Confirmed delete logic here");
            setShowDeletePopup(false);
            }}
        />

    </>
  );
};

export default ArchivedMenu;
