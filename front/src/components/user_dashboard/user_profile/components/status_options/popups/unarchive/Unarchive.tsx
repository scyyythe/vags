import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface UnarchivePopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const UnarchivePopup: React.FC<UnarchivePopupProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  // Language and translation
  const { language } = useLanguage();
  const unarchiveAllText = useAutoTranslation("Unarchive all?", language);
  const allArtworksRestoredText = useAutoTranslation("All artworks will be restored.", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const unarchiveAllButtonText = useAutoTranslation("Unarchive All", language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 px-6 shadow-xl max-w-sm w-full text-center relative">
        <h2 className="text-xs text-black mb-2">{unarchiveAllText}</h2>
        <p className="text-[10px] text-gray-500 mb-6">
            {allArtworksRestoredText}</p>
        <div className="flex justify-between gap-4">
          <button
            onClick={onCancel}
            className="w-full text-[10px] px-8 py-1 text-gray-600 hover:text-black border border-gray-500 hover:border-black rounded-full transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-yellow-800 hover:bg-yellow-700 text-white text-[10px] px-8 py-1 rounded-full"
          >
            {unarchiveAllButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnarchivePopup;
