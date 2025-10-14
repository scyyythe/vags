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

interface CollaboratorEnvironmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentSlots: number;
  newSlots: number;
  collaboratorName: string;
  collaborators: any[];
  hasSubmittedArtworks: boolean;
}

const CollaboratorEnvironmentDialog: React.FC<CollaboratorEnvironmentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentSlots,
  newSlots,
  collaboratorName,
  collaborators,
  hasSubmittedArtworks,
}) => {
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

  const newCollaboratorCount = collaborators.length + 1; // +1 for the collaborator being added

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm text-center">Environment Switch Required</AlertDialogTitle>
          <AlertDialogDescription className="text-[11px] text-center space-y-2">
            <div>
              <strong>Adding Collaborator:</strong> {collaboratorName}
              <br />
              <span className="text-gray-600">This requires switching environments.</span>
            </div>

            <div>
              <strong>Current Environment:</strong> {currentSlots} slots
              <br />
              <span className="text-gray-600">{getSlotDistribution(currentSlots, collaborators.length)}</span>
            </div>

            <div>
              <strong>New Environment:</strong> {newSlots} slots
              <br />
              <span className="text-gray-600">{getSlotDistribution(newSlots, newCollaboratorCount)}</span>
            </div>

            <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-[10px] text-blue-700 font-medium">
                Adding this collaborator requires switching to the {newSlots} slots environment. This will redistribute
                all slots among participants.
              </p>
            </div>

            {hasSubmittedArtworks && (
              <div className="p-2 bg-green-50 rounded-md border border-green-200">
                <p className="text-[10px] text-green-700 font-medium">
                  Existing artworks will be preserved and reassigned to their owners in the new distribution.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="w-full flex justify-between px-4">
            <AlertDialogCancel className="text-[10px] h-7">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} className="text-[10px] h-7">
              Continue
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CollaboratorEnvironmentDialog;
