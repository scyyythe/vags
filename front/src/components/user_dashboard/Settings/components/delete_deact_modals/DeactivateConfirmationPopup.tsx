import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface DeactivateConfirmationPopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  user: any; // you can replace this with a proper user type later
  setUser: (user: any) => void; // function to update user info
}

const DeactivateConfirmationPopup: React.FC<DeactivateConfirmationPopupProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  user,
  setUser,
}) => {
  const { language: selectedLanguage } = useLanguage();

  const [status, setStatus] = useState((user?.userStatus || "active").toLowerCase());

  // Translated labels
  const title = useAutoTranslation("Account Status", selectedLanguage);
  const description = useAutoTranslation(
    status === "deactivated" ? "Your account is currently deactivated." : "You are about to deactivate your account.",
    selectedLanguage
  );
  const cancelBtn = useAutoTranslation("Cancel", selectedLanguage);
  const deactivateBtn = useAutoTranslation("Deactivate", selectedLanguage);
  const reactivateBtn = useAutoTranslation("Reactivate", selectedLanguage);
  const note = useAutoTranslation(
    "You can cancel deactivation within 30 days. After that, reactivation is required.",
    selectedLanguage
  );

  // Additional notices
  const deactivationNotice = useAutoTranslation(
    "IMPORTANT: After deactivating your account, you will be immediately logged out and will need to log in again to reactivate your account. Your profile, artworks, and activity will be hidden from other users.",
    selectedLanguage
  );

  const reactivationNotice = useAutoTranslation(
    "Your account will be reactivated immediately. You can continue using all features and your content will be visible to other users again.",
    selectedLanguage
  );

  const deactivatedNotice = useAutoTranslation(
    "Your account is currently deactivated. All your content is hidden from other users. You can reactivate your account anytime by logging in again.",
    selectedLanguage
  );

  // Update status when user prop changes
  useEffect(() => {
    setStatus((user?.userStatus || "active").toLowerCase());
  }, [user?.userStatus]);

  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Deactivate
  const handleDeactivate = () => {
    onConfirm();
  };

  // Handle Reactivate
  const handleReactivate = () => {
    setUser({ ...user, userStatus: "active" });
    // Note: In practice, reactivation happens through login, not through this popup
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 px-10 shadow-xl max-w-md w-full text-center relative">
        <h2 className="text-xs font-semibold text-gray-900 mb-3">{title}</h2>
        <p className="text-[10px] text-gray-500 mb-3">{description}</p>

        {/* Show appropriate notice based on status */}
        {status === "active" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-[9px] text-yellow-800 leading-relaxed">{deactivationNotice}</p>
          </div>
        )}

        {status === "deactivated" && (
          <div className="space-y-3 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-[9px] text-blue-800 leading-relaxed">{deactivatedNotice}</p>
            </div>
            <p className="text-[9px] text-gray-400 italic">{note}</p>
          </div>
        )}

        <div className="flex justify-between gap-4">
          {status === "active" ? (
            <>
              <button
                onClick={onCancel}
                className="w-full text-[10px] px-8 py-1 text-gray-600 hover:text-black border border-gray-500 hover:border-black rounded-full transition-colors duration-200"
              >
                {cancelBtn}
              </button>
              <button
                onClick={handleDeactivate}
                className="w-full bg-red-700 hover:bg-red-600 text-white text-[10px] px-8 py-1 rounded-full"
              >
                {deactivateBtn}
              </button>
            </>
          ) : status === "deactivated" ? (
            <>
              <button
                onClick={onCancel}
                className="w-full text-[10px] px-8 py-1 text-gray-600 hover:text-black border border-gray-500 hover:border-black rounded-full transition-colors duration-200"
              >
                {cancelBtn}
              </button>
              <button 
                onClick={handleReactivate}
                className="w-full bg-green-700 hover:bg-green-600 text-white text-[10px] px-8 py-1 rounded-full"
              >
                {reactivateBtn}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DeactivateConfirmationPopup;
