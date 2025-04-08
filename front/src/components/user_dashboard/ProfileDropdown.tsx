import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import { useModal } from "@/context/ModalContext";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown = ({ isOpen, onClose }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();
  
  const handleEditProfile = () => {
    navigate("/profile/edit");
    onClose();
  };

  const handleSettings = () => {
    navigate("/settings");
    onClose();
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    
    // Show login modal
    setShowLoginModal(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 mt-2 w-48 bg-black rounded-md shadow-lg overflow-hidden z-50">
      <div className="py-2">
        <button 
          onClick={handleEditProfile}
          className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          <User size={16} className="mr-2" />
          Edit Profile
        </button>
        
        <button 
          onClick={handleSettings}
          className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          <Settings size={16} className="mr-2" />
          Settings
        </button>
        
        <div className="border-t border-gray-700 my-1"></div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
