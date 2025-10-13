import React, { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface ReactivationConfirmationPopupProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  userEmail?: string;
}

const ReactivationConfirmationPopup: React.FC<ReactivationConfirmationPopupProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  userEmail,
}) => {
  const { language: selectedLanguage } = useLanguage();

  // Translated labels
  const title = useAutoTranslation("Account Reactivation Required", selectedLanguage);
  const description = useAutoTranslation(
    "Your account is currently deactivated. Would you like to reactivate it now?",
    selectedLanguage
  );
  const notice = useAutoTranslation(
    "Once you confirm, your account will be reactivated and you can access all features again.",
    selectedLanguage
  );
  const confirmBtn = useAutoTranslation("Yes, Reactivate", selectedLanguage);
  const cancelBtn = useAutoTranslation("Cancel", selectedLanguage);

  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 px-10 shadow-xl max-w-md w-full text-center relative">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-xs font-semibold text-gray-900 mb-3">{title}</h2>
        <p className="text-[10px] text-gray-600 mb-4">{description}</p>

        {userEmail && <p className="text-[9px] text-gray-500 mb-4">Account: {userEmail}</p>}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <p className="text-[9px] text-blue-800 leading-relaxed">{notice}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-[10px] text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md transition-colors"
          >
            {cancelBtn}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white text-[10px] rounded-md hover:bg-blue-700 transition-colors"
          >
            {confirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactivationConfirmationPopup;
