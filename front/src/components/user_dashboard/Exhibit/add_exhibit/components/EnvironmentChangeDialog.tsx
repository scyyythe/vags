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

interface EnvironmentChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentSlots: number;
  newSlots: number;
  collaborators: any[];
  hasSubmittedArtworks: boolean;
}

const EnvironmentChangeDialog: React.FC<EnvironmentChangeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentSlots,
  newSlots,
  collaborators,
  hasSubmittedArtworks,
}) => {
  const isDowngrade = newSlots < currentSlots;
  const isUpgrade = newSlots > currentSlots;

  const getSlotDistribution = (slots: number, collaboratorCount: number) => {
    if (collaboratorCount === 0) {
      return `${slots} slots (solo)`;
    } else if (collaboratorCount === 1) {
      if (slots === 4) return "2-2 distribution";
      if (slots === 6) return "3-3 distribution";
      if (slots === 10) return "5-5 distribution";
    } else if (collaboratorCount === 2) {
      if (slots === 10) return "4-3-3 distribution";
    }
    return `${slots} slots`;
  };

  const canAccommodateCollaborators = (slots: number, collaboratorCount: number) => {
    if (collaboratorCount === 0) return true;
    if (collaboratorCount === 1) return slots >= 4;
    if (collaboratorCount === 2) return slots >= 10;
    return false;
  };

  const canChangeEnvironment = canAccommodateCollaborators(newSlots, collaborators.length);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm text-center">
            {isDowngrade ? "Environment Downgrade" : "Environment Change"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[11px] text-center space-y-2">
            <div>
              <strong>Current Environment:</strong> {currentSlots} slots
              <br />
              <span className="text-gray-600">{getSlotDistribution(currentSlots, collaborators.length)}</span>
            </div>

            <div>
              <strong>New Environment:</strong> {newSlots} slots
              <br />
              <span className="text-gray-600">{getSlotDistribution(newSlots, collaborators.length)}</span>
            </div>

            {hasSubmittedArtworks && (
              <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-[10px] text-amber-700 font-medium">
                  This exhibit already has submitted artworks. Changing environments will redistribute all slots.
                </p>
              </div>
            )}

            {!canChangeEnvironment && (
              <div className="p-2 bg-red-50 rounded-md border border-red-200">
                <p className="text-[10px] text-red-700 font-medium">
                  Cannot switch to {newSlots} slots environment.
                  <br />
                  Current collaborators ({collaborators.length}) exceed the capacity.
                </p>
              </div>
            )}

            {isDowngrade && hasSubmittedArtworks && !canChangeEnvironment && (
              <div className="p-2 bg-red-50 rounded-md border border-red-200">
                <p className="text-[10px] text-red-700 font-medium">
                  Cannot downgrade environment when artworks are already submitted.
                  <br />
                  Please remove some collaborators first.
                </p>
              </div>
            )}

            {isDowngrade && hasSubmittedArtworks && canChangeEnvironment && (
              <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-[10px] text-amber-700 font-medium">
                  Downgrading environment with submitted artworks.
                  <br />
                  Existing artworks will be preserved and redistributed.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="w-full flex justify-between px-4">
            <AlertDialogCancel className="text-[10px] h-7">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              disabled={!canChangeEnvironment}
              className="text-[10px] h-7 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!canChangeEnvironment ? "Cannot Change" : "Confirm Change"}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EnvironmentChangeDialog;
