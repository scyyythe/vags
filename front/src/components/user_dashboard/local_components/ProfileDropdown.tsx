import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import { useModal } from "../../../context/ModalContext";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown = ({ isOpen, onClose }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const { showLoginModal, setShowLoginModal } = useModal();

  const handleEditProfile = () => {
    navigate('/settings/edit-profile');
  };

  useEffect(() => {
    console.log('showLoginModal updated:', showLoginModal);
  }, [showLoginModal]);

  const handleSettings = () => {
    navigate("/settings");
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    navigate("/");
    setShowLoginModal(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 mt-2 w-41 bg-black rounded-md shadow-lg overflow-hidden z-50 whitespace-nowrap">
      <div className="py-2 px-7">
        <button 
          onClick={handleEditProfile}
          className="flex items-center w-full px-4 py-2 text-xs text-white hover:bg-gray-800 rounded-sm"
        >
          <User size={13} className="mr-2" />
          Edit Profile
        </button>
        
        <button 
          onClick={handleSettings}
          className="flex items-center w-full px-4 py-2 text-xs text-white hover:bg-gray-800 rounded-sm"
        >
          <Settings size={13} className="mr-2" />
          Settings
        </button>
        
        <div className="border-t border-gray-700 my-1"></div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-xs text-white hover:bg-gray-800 rounded-sm"
        >
          <LogOut size={13} className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
