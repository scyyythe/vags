import { useRef, useEffect } from "react";
import { Save, EyeOff, Flag } from "lucide-react";

interface ArtCardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position?: "top" | "bottom";
  onSave?: () => void;
  onHide?: () => void;
  onReport?: () => void;
}

const ArtCardMenu = ({ isOpen, onClose, position = "top", onSave, onHide, onReport }: ArtCardMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef} 
      className={`card-menu ${position === "bottom" ? "bottom-full mb-1" : "top-full"}`}
    >
      <div className="card-menu-item" onClick={onSave}>
        <Save size={16} />
        <span>Save</span>
      </div>
      <div className="card-menu-item" onClick={onHide}>
        <EyeOff size={16} />
        <span>Hide</span>
      </div>
      <div className="card-menu-item" onClick={onReport}>
        <Flag size={16} />
        <span>Report</span>
      </div>
    </div>
  );
};

export default ArtCardMenu;
