import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface UnblockConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
  isLoading?: boolean;
}

const UnblockConfirmationModal: React.FC<UnblockConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username,
  isLoading = false,
}) => {
  const { language: selectedLanguage } = useLanguage();
  
  const confirmUnblockLabel = useAutoTranslation("Are you sure you want to unblock this user?", selectedLanguage);
  const unblockLabel = useAutoTranslation("Unblock", selectedLanguage);
  const cancelLabel = useAutoTranslation("Cancel", selectedLanguage);
  const unblockingLabel = useAutoTranslation("Unblocking...", selectedLanguage);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {confirmUnblockLabel}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-xs text-gray-600 mb-2">
            {username} will be able to message you, view your profile, and interact with your posts again.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs px-4 py-2"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-800 hover:bg-red-700 text-white text-xs px-4 py-2"
          >
            {isLoading ? unblockingLabel : unblockLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnblockConfirmationModal;
