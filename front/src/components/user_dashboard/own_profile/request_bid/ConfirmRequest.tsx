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
        <DialogTitle className="text-center">
          Are you sure you want to publish this auction request?
        </DialogTitle>
        <DialogDescription className="text-center">
          This action cannot be undone once the auction starts.
        </DialogDescription>
        <DialogFooter className="flex justify-center space-x-4">
          <Button
            onClick={onConfirm}
            className="bg-red-700 hover:bg-red-800 text-white w-24"
          >
            Yes
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-24"
          >
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
