import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User, Plus, Activity, Headphones } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
export interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown = ({ isOpen, onClose }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const userId = getLoggedInUserId();
  const { firstName, lastName, profilePicture, email } = useUserDetails(userId);
  const fullName = `${firstName} ${lastName}`;
  const { setShowLoginModal } = useModal();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  useEffect(() => {
    if (showLogoutConfirm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showLogoutConfirm]);

  if (!isOpen) return null;

  return (
    <>
    <div className="absolute right-2 mt-2 w-60 bg-white rounded-2xl shadow-xl z-50 text-sm">
      {/* Top profile section */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-7 h-7 rounded-full">
            <AvatarImage src={profilePicture} alt={fullName} />
            <AvatarFallback>{fullName?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="leading-[14px]">
            <div className="font-semibold text-black text-[11px] whitespace-nowrap">{fullName}</div>
            <div className="text-[9px] text-gray-400">{email}</div>
          </div>
        </div>
      </div>

      <hr className="my-2 border-gray-200" />

      {/* Menu options */}
      <div className="flex flex-col px-4 gap-3 py-2 text-gray-700 text-[10px]">
        <button onClick={handleEditProfile} className="flex items-center gap-3 hover:text-black">
          <User size={14} /> Edit Profile
        </button>

        <button className="flex items-center gap-3 hover:text-black">
          <Activity size={14} /> Stats
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

        <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-3 hover:text-black">
          <LogOut size={14} /> Logout
        </button>

      </div>
    </div>

    {showLogoutConfirm && (
      <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
        <div className="bg-white rounded-md p-6 w-[90%] max-w-xs text-center shadow-lg">
          <p className="text-xs font-medium text-gray-800 mb-4">Are you sure you want to logout?</p>
          <div className="flex justify-center gap-4 text-[10px]">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-8 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/");
                setShowLoginModal(true);
                onClose();
                setShowLogoutConfirm(false);
              }}
              className="px-8 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}

    </>
  );
};

export default ProfileDropdown;
