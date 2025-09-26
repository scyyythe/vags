import React from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface ActionButtonsProps {
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  saveText?: string;
  cancelText?: string;
}

const ActionButtons = ({
  hasChanges,
  onSave,
  onReset,
  saveText = "Update Settings",
  cancelText = "Reset",
}: ActionButtonsProps) => {
  const { language: selectedLanguage } = useLanguage();

  // Auto-translated button texts
  const translatedSaveText = useAutoTranslation(saveText, selectedLanguage);
  const translatedCancelText = useAutoTranslation(cancelText, selectedLanguage);

  const handleSave = () => {
    onSave();
    toast.success(
      useAutoTranslation("Settings updated", selectedLanguage),
      {
        description: useAutoTranslation(
          "Your settings have been successfully updated.",
          selectedLanguage
        ),
        closeButton: true,
      }
    );
  };

  return (
    <div className="flex text-[10px] items-center justify-between mt-8">
      <button
        className="bg-red-800 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-full cursor-pointer"
        disabled={!hasChanges}
        onClick={handleSave}
      >
        {translatedSaveText}
      </button>
      <button
        className="bg-red-50 text-red-500 font-medium border-0 hover:bg-red-100 px-6 py-2 rounded-full cursor-pointer"
        disabled={!hasChanges}
        onClick={onReset}
      >
        {translatedCancelText}
      </button>
    </div>
  );
};

export default ActionButtons;
