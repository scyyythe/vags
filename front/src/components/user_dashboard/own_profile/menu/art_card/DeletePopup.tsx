import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface DeleteConfirmationPopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  // Language and translation
  const { language } = useLanguage();
  const deleteArtworkTitleText = useAutoTranslation("You are about to delete this artwork", language);
  const deleteArtworkDescText = useAutoTranslation("This will permanently remove the artwork from your profile.", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const deleteText = useAutoTranslation("Delete", language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg py-7 px-10 shadow-xl max-w-sm w-full text-center relative">
        <h2 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">{deleteArtworkTitleText}</h2>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-6">{deleteArtworkDescText}</p>
        <div className="flex justify-between gap-6">
          <button
            onClick={onCancel}
            className="w-full text-[10px] px-8 py-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-gray-200 border border-gray-500 dark:border-gray-400 hover:border-black dark:hover:border-gray-300 rounded-full transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-red-700 hover:bg-red-600 text-white text-[10px] px-8 py-1 rounded-full"
          >
            {deleteText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
