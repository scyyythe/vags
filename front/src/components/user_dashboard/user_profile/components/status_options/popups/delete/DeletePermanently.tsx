import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface DeletePermanentlyPopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeletePermanentlyPopup: React.FC<DeletePermanentlyPopupProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  // Language and translation
  const { language } = useLanguage();
  const deleteArtworkPermanentlyText = useAutoTranslation("Delete artwork permanently ?", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const deleteText = useAutoTranslation("Delete", language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 px-6 shadow-xl max-w-sm w-full text-center relative">
        <p className="text-xs text-black mb-6">{deleteArtworkPermanentlyText}</p>
        <div className="flex justify-between gap-4">
          <button
            onClick={onCancel}
            className="w-full text-[10px] px-8 py-1 text-gray-600 hover:text-black border border-gray-500 hover:border-black rounded-full transition-colors duration-200"
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

export default DeletePermanentlyPopup;
