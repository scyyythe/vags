import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface RestoreConfirmationProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  exhibitTitle?: string;
}

const RestoreConfirmation: React.FC<RestoreConfirmationProps> = ({ isOpen, onCancel, onConfirm, exhibitTitle }) => {
  // Language and translation
  const { language } = useLanguage();
  const restoreExhibitText = useAutoTranslation("Restore Exhibit", language);
  const areYouSureRestoreText = useAutoTranslation("Are you sure you want to restore", language);
  const thisExhibitText = useAutoTranslation("this exhibit", language);
  const madePublicAgainText = useAutoTranslation("? It will be made public again.", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const restoreText = useAutoTranslation("Restore", language);
  
  // Translate exhibit title if provided
  const translatedExhibitTitle = useAutoTranslation(exhibitTitle || "", language);

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-sm text-gray-900 dark:text-gray-100">{restoreExhibitText}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-[10px] text-gray-600 dark:text-gray-400">
            {areYouSureRestoreText} {exhibitTitle ? `"${translatedExhibitTitle}"` : thisExhibitText}{madePublicAgainText}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="w-full flex flex-row gap-6">
            <AlertDialogCancel className="h-[28px] w-full text-[9px] rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{cancelText}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 w-full h-[28px] text-[9px] rounded-full"
              onClick={onConfirm}
            >
              {restoreText}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RestoreConfirmation;
