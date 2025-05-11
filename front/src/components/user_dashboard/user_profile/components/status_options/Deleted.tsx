import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { ArchiveRestore, Trash2 } from "lucide-react";
import DeletePermanently from "@/components/user_dashboard/user_profile/components/status_options/popups/delete/DeletePermanently"; 

interface ArtCardMenuProps {
  isOpen: boolean;
  onEdit: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  className?: string;
}

const BLACK = "#000000";

const DeletedMenu: React.FC<ArtCardMenuProps> = ({
  isOpen,
  onUnarchive,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  if (!isOpen) return null;

  return (
    <>
    <div
      ref={menuRef}
      className="absolute -right-1 top-8 z-10 bg-gray-100 rounded-full py-1 px-1 shadow-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-start">
        {/* Restore */}
        <div className="flex items-center relative">
          <button
            onClick={onUnarchive}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Restore"
            onMouseEnter={() => setHoveredItem("restore")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <ArchiveRestore size={10} stroke={BLACK} />
          </button>
          {hoveredItem === "restore" && (
            <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Restore
            </span>
          )}
        </div>

        {/* Delete Permanently */}
        <div className="flex items-center relative">
          <button
            onClick={() => {
              setShowDeletePopup(true);
            }}
            className="p-2 rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Delete Permanently"
            onMouseEnter={() => setHoveredItem("delete")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Trash2 size={10} className="text-red-700" />
          </button>
          {hoveredItem === "delete" && (
            <span className="absolute left-10 text-[9px] text-center bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              Delete Permanently
            </span>
          )}
        </div>
      </div>  
    </div>

    {/* Delete Confirmation Popup */}
    <DeletePermanently
      isOpen={showDeletePopup}
      onCancel={() => setShowDeletePopup(false)}
      onConfirm={() => {
        toast.success("You've permanently deleted the artwork.");
        setShowDeletePopup(false);
        onDelete(); 
      }}
    />
    </>
  );
};

export default DeletedMenu;
