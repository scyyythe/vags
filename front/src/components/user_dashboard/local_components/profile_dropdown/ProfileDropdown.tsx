import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User, Plus, Headphones } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLogout } from "@/hooks/auth/useLogout";

export interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const ProfileDropdown = ({ isOpen, onClose, onLogout }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const userId = getLoggedInUserId();
  const { firstName, lastName, profilePicture, email } = useUserDetails(userId);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { language: selectedLanguage } = useLanguage();
  const { logout } = useLogout();

  const fullName = `${firstName || "Unknown"} ${lastName || ""}`.trim();

  // Translations
  const translatedFullName = useAutoTranslation(fullName, selectedLanguage);
  const translatedEmail = useAutoTranslation(email || "Unknown", selectedLanguage);
  const editProfileLabel = useAutoTranslation("Edit Profile", selectedLanguage);
  const settingsLabel = useAutoTranslation("Settings", selectedLanguage);
  const helpCenterLabel = useAutoTranslation("Help Center", selectedLanguage);
  const addAccountLabel = useAutoTranslation("Add account", selectedLanguage);
  const logoutLabel = useAutoTranslation("Logout", selectedLanguage);
  const logoutConfirmText = useAutoTranslation("Are you sure you want to logout?", selectedLanguage);
  const cancelLabel = useAutoTranslation("Cancel", selectedLanguage);
  const confirmLogoutLabel = useAutoTranslation("Logout", selectedLanguage);

  const handleEditProfile = () => {
    navigate("/settings/edit-profile");
    onClose();
  };

  const handleSettings = () => {
    navigate("/settings");
    onClose();
  };

  const handleHelpCenter = () => {
    navigate("/settings/help-center");
    onClose();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
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
              <div className="font-semibold text-black text-[11px] whitespace-nowrap">{translatedFullName}</div>
              <div className="text-[9px] text-gray-400">{translatedEmail}</div>
            </div>
          </div>
        </div>

        <hr className="my-2 border-gray-200" />

        {/* Menu options */}
        <div className="flex flex-col px-4 gap-3 py-2 text-gray-700 text-[10px]">
          <button onClick={handleEditProfile} className="flex items-center gap-3 hover:text-black">
            <User size={14} /> {editProfileLabel}
          </button>

          <button onClick={handleSettings} className="flex items-center gap-3 hover:text-black">
            <Settings size={14} /> {settingsLabel}
          </button>

          <button onClick={handleHelpCenter} className="flex items-center gap-3 hover:text-black">
            <Headphones size={14} /> {helpCenterLabel}
          </button>
        </div>

        <hr className="my-2 border-gray-200" />

        {/* Bottom actions */}
        <div className="flex flex-col px-4 gap-3 pb-4 text-gray-700 text-[10px]">
          <button className="flex items-center gap-3 hover:text-black">
            <Plus size={14} /> {addAccountLabel}
          </button>

          <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-3 hover:text-black">
            <LogOut size={14} /> {logoutLabel}
          </button>
        </div>
      </div>

      {/* Logout confirmation popup */}
      {showLogoutConfirm && (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90%] max-w-xs text-center shadow-lg">
            <p className="text-xs font-medium text-gray-800 mb-4">{logoutConfirmText}</p>
            <div className="flex justify-center gap-4 text-[10px]">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-8 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  if (onLogout) {
                    onLogout();
                  } else {
                    logout();
                  }
                  onClose();
                  setShowLogoutConfirm(false);
                }}
                className="px-8 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                {confirmLogoutLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileDropdown;
