import React, { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface CloseBidConfirmationPopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const CloseBidConfirmationPopup: React.FC<CloseBidConfirmationPopupProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const { language } = useLanguage();

  // Translation hooks
  const titleText = useAutoTranslation("You are about to close this auction", language);
  const descriptionText = useAutoTranslation("Once closed, no new bids can be placed for this auction.", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const closeText = useAutoTranslation("Close", language);

  // Prevent background scrolling when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg py-7 px-10 shadow-xl max-w-sm w-full text-center relative">
        <h2 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {titleText}
        </h2>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-6">
          {descriptionText}
        </p>
        <div className="flex justify-between gap-6">
          <button
            onClick={onCancel}
            className="w-full text-[10px] px-8 py-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-gray-200 border border-gray-500 dark:border-gray-400 hover:border-black dark:hover:border-gray-300 rounded-full transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] px-8 py-1 rounded-full"
          >
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseBidConfirmationPopup;
