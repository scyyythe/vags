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
  const { language } = useLanguage();

  // Translation hooks for all text content
  const environmentSwitchRequiredText = useAutoTranslation("Environment Switch Required", language);
  const addingCollaboratorText = useAutoTranslation("Adding Collaborator:", language);
  const requiresSwitchingText = useAutoTranslation("This requires switching environments.", language);
  const currentEnvironmentText = useAutoTranslation("Current Environment:", language);
  const newEnvironmentText = useAutoTranslation("New Environment:", language);
  const slotsText = useAutoTranslation("slots", language);
  const soloText = useAutoTranslation("solo", language);
  const distributionText = useAutoTranslation("distribution", language);
  const addingThisCollaboratorText = useAutoTranslation("Adding this collaborator requires switching to the", language);
  const slotsEnvironmentText = useAutoTranslation("slots environment. This will redistribute all slots among participants.", language);
  const existingArtworksPreservedText = useAutoTranslation("Existing artworks will be preserved and reassigned to their owners in the new distribution.", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const continueText = useAutoTranslation("Continue", language);

  const getSlotDistribution = (slots: number, collaboratorCount: number) => {
    if (collaboratorCount === 0) {
      return `${slots} ${slotsText} (${soloText})`;
    } else if (collaboratorCount === 1) {
      if (slots === 4) return `2-2 ${distributionText}`;
      if (slots === 6) return `3-3 ${distributionText}`;
      if (slots === 10) return `5-5 ${distributionText}`;
    } else if (collaboratorCount === 2) {
      if (slots === 10) return `4-3-3 ${distributionText}`;
    }
    return `${slots} ${slotsText}`;
  };

  const newCollaboratorCount = collaborators.length + 1; // +1 for the collaborator being added

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm text-center">{environmentSwitchRequiredText}</AlertDialogTitle>
          <AlertDialogDescription className="text-[11px] text-center space-y-2">
            <div>
              <strong>{addingCollaboratorText}</strong> {collaboratorName}
              <br />
              <span className="text-gray-600">{requiresSwitchingText}</span>
            </div>

            <div>
              <strong>{currentEnvironmentText}</strong> {currentSlots} {slotsText}
              <br />
              <span className="text-gray-600">{getSlotDistribution(currentSlots, collaborators.length)}</span>
            </div>

            <div>
              <strong>{newEnvironmentText}</strong> {newSlots} {slotsText}
              <br />
              <span className="text-gray-600">{getSlotDistribution(newSlots, newCollaboratorCount)}</span>
            </div>

            <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-[10px] text-blue-700 font-medium">
                {addingThisCollaboratorText} {newSlots} {slotsEnvironmentText}
              </p>
            </div>

            {hasSubmittedArtworks && (
              <div className="p-2 bg-green-50 rounded-md border border-green-200">
                <p className="text-[10px] text-green-700 font-medium">
                  {existingArtworksPreservedText}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="w-full flex justify-between px-4">
            <AlertDialogCancel className="text-[10px] h-7">{cancelText}</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} className="text-[10px] h-7">
              {continueText}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CollaboratorEnvironmentDialog;
