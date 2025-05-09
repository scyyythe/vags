import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User, Plus, Activity, Headphones } from "lucide-react";
import { useModal } from "../../../context/ModalContext";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown = ({ isOpen, onClose }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();

  const handleEditProfile = () => {
    navigate("/settings/edit-profile");
    onClose();
  };

  const handleSettings = () => {
    navigate("/settings");
    onClose();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    setShowLoginModal(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 mt-2 w-56 bg-white rounded-2xl shadow-xl z-50 text-sm">
      {/* Top profile section */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="leading-[14px]">
            <div className="font-semibold text-black text-[11px]">Angel Canete</div>
            <div className="text-[9px] text-gray-400">Basic Plan</div>
          </div>
        </div>
        <button className="text-[8px] bg-blue-100 text-blue-700 px-2 rounded-md font-medium">
          Upgrade
        </button>
      </div>

      <hr className="my-2 border-gray-200" />

      {/* Menu options */}
      <div className="flex flex-col px-4 gap-3 py-2 text-gray-700 text-[10px]">
        <button onClick={handleEditProfile} className="flex items-center gap-3 hover:text-black">
          <User size={14} /> Edit Profile
        </button>

        <button className="flex items-center gap-3 hover:text-black">
          <Activity size={14} /> Activity
        </button>

        <button onClick={handleSettings} className="flex items-center gap-3 hover:text-black">
          <Settings size={14} /> Settings
        </button>

        <button className="flex items-center gap-3 hover:text-black">
          <Headphones size={14} /> Help Center
        </button>
      </div>

      <hr className="my-2 border-gray-200" />

      {/* Bottom actions */}
      <div className="flex flex-col px-4 gap-3 pb-4 text-gray-700 text-[10px]">
        <button className="flex items-center gap-3 hover:text-black">
          <Plus size={14} /> Add account
        </button>

        <button onClick={handleLogout} className="flex items-center gap-3 hover:text-black">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
