import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface EmptyTrashProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const EmptyTrash: React.FC<EmptyTrashProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  // Language and translation
  const { language } = useLanguage();
  const emptyTrashTitleText = useAutoTranslation("Empty trash?", language);
  const emptyTrashDescText = useAutoTranslation("All artworks in Trash will be permanently deleted.", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const emptyTrashButtonText = useAutoTranslation("Empty Trash", language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 px-6 shadow-xl max-w-sm w-full text-center relative">
        <h2 className="text-xs text-black mb-2">{emptyTrashTitleText}</h2>
        <p className="text-[10px] text-gray-500 mb-6">
          {emptyTrashDescText}</p>
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
            {emptyTrashButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyTrash;
