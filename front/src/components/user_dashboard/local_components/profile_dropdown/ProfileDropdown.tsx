import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User, Plus, Headphones, Sun, Moon } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLogout } from "@/hooks/auth/useLogout";
import { useTheme } from "@/components/user_dashboard/footer/ThemeProvider";
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
  const { theme, setTheme } = useTheme();

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
  const lightModeLabel = useAutoTranslation("Light Mode", selectedLanguage);
  const darkModeLabel = useAutoTranslation("Dark Mode", selectedLanguage);

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

  const handleThemeToggle = () => {
    // Toggle between light and dark themes
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
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
      <div className="absolute right-2 mt-2 w-60 bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-50 text-sm">
        {/* Top profile section */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-7 h-7 rounded-full">
              <AvatarImage src={profilePicture} alt={fullName} />
              <AvatarFallback>{fullName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="leading-[14px]">
              <div className="font-semibold text-black dark:text-white text-[11px] whitespace-nowrap">{translatedFullName}</div>
              <div className="text-[9px] text-gray-400 dark:text-gray-500">{translatedEmail}</div>
            </div>
          </div>
        </div>

        <hr className="my-2 border-gray-200 dark:border-gray-600" />

        {/* Menu options */}
        <div className="flex flex-col px-4 gap-3 py-2 text-gray-700 dark:text-gray-300 text-[10px]">
          <button onClick={handleEditProfile} className="flex items-center gap-3 hover:text-black dark:hover:text-white">
            <User size={14} /> {editProfileLabel}
          </button>

          <button onClick={handleSettings} className="flex items-center gap-3 hover:text-black dark:hover:text-white">
            <Settings size={14} /> {settingsLabel}
          </button>

          <button onClick={handleHelpCenter} className="flex items-center gap-3 hover:text-black dark:hover:text-white">
            <Headphones size={14} /> {helpCenterLabel}
          </button>
        </div>

        <hr className="my-2 border-gray-200 dark:border-gray-600" />

        {/* Bottom actions */}
        <div className="flex flex-col px-4 gap-3 pb-4 text-gray-700 dark:text-gray-300 text-[10px]">
          {/* <button className="flex items-center gap-3 hover:text-black dark:hover:text-white">
            <Plus size={14} /> {addAccountLabel}
          </button> */}
          <button onClick={handleThemeToggle} className="flex items-center gap-3 hover:text-black dark:hover:text-white">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} 
            {theme === 'dark' ? lightModeLabel : darkModeLabel}
          </button>

          <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-3 hover:text-black dark:hover:text-white">
            <LogOut size={14} /> {logoutLabel}
          </button>
        </div>
      </div>

      {/* Logout confirmation popup */}
      {showLogoutConfirm && (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-md p-6 w-[90%] max-w-xs text-center shadow-lg">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-4">{logoutConfirmText}</p>
            <div className="flex justify-center gap-4 text-[10px]">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-8 py-2 bg-gray-200 dark:bg-gray-600 text-black dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-500"
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
