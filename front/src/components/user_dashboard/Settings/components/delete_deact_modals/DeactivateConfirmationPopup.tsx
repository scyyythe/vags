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

  const [status, setStatus] = useState(user?.userStatus || "active");
  const [deactivatedAt, setDeactivatedAt] = useState<Date | null>(null);

  // Translated labels
  const title = useAutoTranslation("Account Status", selectedLanguage);
  const description = useAutoTranslation(
    status === "deactivated"
      ? "Your account is currently deactivated."
      : "You are about to deactivate your account.",
    selectedLanguage
  );
  const cancelBtn = useAutoTranslation("Cancel", selectedLanguage);
  const deactivateBtn = useAutoTranslation("Deactivate", selectedLanguage);
  const reactivateBtn = useAutoTranslation("Reactivate", selectedLanguage);
  const note = useAutoTranslation(
    "You can cancel deactivation within 30 days. After that, reactivation is required.",
    selectedLanguage
  );

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
    setStatus("deactivated");
    setDeactivatedAt(new Date());
    setUser({ ...user, userStatus: "deactivated" });
    onConfirm();
  };

  // Handle Reactivate
  const handleReactivate = () => {
    setStatus("active");
    setDeactivatedAt(null);
    setUser({ ...user, userStatus: "active" });
    onCancel(); // close modal after reactivation
  };

  // Check if within 30 days
  const within30Days =
    deactivatedAt && new Date().getTime() - deactivatedAt.getTime() <= 30 * 24 * 60 * 60 * 1000;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 px-10 shadow-xl max-w-sm w-full text-center relative">
        <h2 className="text-xs font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-[10px] text-gray-500 mb-3">{description}</p>
        {status === "deactivated" && (
          <p className="text-[9px] text-gray-400 italic mb-6">{note}</p>
        )}

        <div className="flex justify-between gap-4">
          {status === "active" && (
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
          )}

          {status === "deactivated" && (
            <>
              {within30Days && (
                <button
                  onClick={onCancel}
                  className="w-full text-[10px] px-8 py-1 text-gray-600 hover:text-black border border-gray-500 hover:border-black rounded-full transition-colors duration-200"
                >
                  {cancelBtn}
                </button>
              )}
              <button
                onClick={handleReactivate}
                className="w-full bg-green-700 hover:bg-green-600 text-white text-[10px] px-8 py-1 rounded-full"
              >
                {reactivateBtn}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeactivateConfirmationPopup;
