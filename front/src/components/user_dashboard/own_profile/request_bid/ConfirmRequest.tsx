import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="text-center text-sm mt-4 px-4">
          Are you sure you want to publish this auction request?
        </DialogTitle>
        <DialogDescription className="text-center text-[10px]">
          This action cannot be undone once the auction starts.
        </DialogDescription>
        <div className="flex justify-center space-x-6">
          <button
            onClick={onConfirm}
            className="bg-red-800 hover:bg-red-700 text-white w-24 text-xs rounded-full p-1"
          >
            Yes
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="w-24 border border-black rounded-full p-1 text-xs"
          >
            No
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
