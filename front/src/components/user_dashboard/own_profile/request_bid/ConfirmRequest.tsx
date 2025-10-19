import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
  DialogContent,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const ConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmationDialogProps) => {
  // Language and translation
  const { language } = useLanguage();
  const confirmPublishTitleText = useAutoTranslation("Are you sure you want to publish this auction request?", language);
  const cannotUndoText = useAutoTranslation("This action cannot be undone once the auction starts.", language);
  const noText = useAutoTranslation("No", language);
  const yesText = useAutoTranslation("Yes", language);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white max-w-sm w-full p-6 rounded-lg shadow-lg">
            <DialogTitle className="text-center text-[13px] mt-2 px-4">
              {confirmPublishTitleText}
            </DialogTitle>
            <DialogDescription className="text-center text-[10px] mt-1.5">
              {cannotUndoText}
            </DialogDescription>
            <div className="flex justify-between mt-4 gap-4">
              <button
                onClick={() => onOpenChange(false)}
                className="w-full border border-black rounded-full p-1 text-xs"
              >
                {noText}
              </button>
              <button
                onClick={onConfirm}
                className="w-full bg-red-800 hover:bg-red-700 text-white text-xs rounded-full p-1"
              >
                {yesText}
              </button>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
};

export default ConfirmationDialog;
