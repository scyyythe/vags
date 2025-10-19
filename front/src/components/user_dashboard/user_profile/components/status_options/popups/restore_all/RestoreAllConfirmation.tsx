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

interface RestoreAllConfirmationProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const RestoreAllConfirmation: React.FC<RestoreAllConfirmationProps> = ({ isOpen, onCancel, onConfirm }) => {
  // Language and translation
  const { language } = useLanguage();
  const restoreAllExhibitsText = useAutoTranslation("Restore All Exhibits", language);
  const restoreAllDescriptionText = useAutoTranslation("Are you sure you want to restore all deleted exhibits? They will be made public again.", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const restoreAllText = useAutoTranslation("Restore All", language);

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="w-full max-w-sm rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-sm">{restoreAllExhibitsText}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-[10px]">
            {restoreAllDescriptionText}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="w-full flex flex-row gap-6">
            <AlertDialogCancel className="h-[28px] w-full text-[9px] rounded-full">{cancelText}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 w-full h-[28px] text-[9px] rounded-full"
              onClick={onConfirm}
            >
              {restoreAllText}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RestoreAllConfirmation;
