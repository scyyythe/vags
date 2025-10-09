import React, { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface DeactivateConfirmationPopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeactivateConfirmationPopup: React.FC<DeactivateConfirmationPopupProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const { language: selectedLanguage } = useLanguage();

  // Translated labels
  const title = useAutoTranslation("You are about to deactivate your account", selectedLanguage);
  const description = useAutoTranslation(
    "Your account and activities will be hidden temporarily until you reactivate it.",
    selectedLanguage
  );
  const cancelBtn = useAutoTranslation("Cancel", selectedLanguage);
  const deactivateBtn = useAutoTranslation("Deactivate", selectedLanguage);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 px-10 shadow-xl max-w-sm w-full text-center relative">
        <h2 className="text-xs font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-[10px] text-gray-500 mb-6">{description}</p>
        <div className="flex justify-between gap-6">
          <button
            onClick={onCancel}
            className="w-full text-[10px] px-8 py-1 text-gray-600 hover:text-black border border-gray-500 hover:border-black rounded-full transition-colors duration-200"
          >
            {cancelBtn}
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-red-700 hover:bg-red-600 text-white text-[10px] px-8 py-1 rounded-full"
          >
            {deactivateBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateConfirmationPopup;
