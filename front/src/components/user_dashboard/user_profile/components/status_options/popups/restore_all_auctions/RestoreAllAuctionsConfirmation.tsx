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

interface RestoreAllAuctionsConfirmationProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const RestoreAllAuctionsConfirmation: React.FC<RestoreAllAuctionsConfirmationProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="w-full max-w-sm rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-sm">Restore All Auctions</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-[10px]">
            Are you sure you want to restore all deleted auctions? They will be made public again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="w-full flex flex-row gap-6">
            <AlertDialogCancel className="h-[28px] w-full text-[9px] rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 w-full h-[28px] text-[9px] rounded-full"
              onClick={onConfirm}
            >
              Restore All
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RestoreAllAuctionsConfirmation;
