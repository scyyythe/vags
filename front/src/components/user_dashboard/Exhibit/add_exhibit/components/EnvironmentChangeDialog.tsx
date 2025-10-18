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
  const { language } = useLanguage();

  // Translation hooks for all text content
  const environmentDowngradeText = useAutoTranslation("Environment Downgrade", language);
  const environmentChangeText = useAutoTranslation("Environment Change", language);
  const currentEnvironmentText = useAutoTranslation("Current Environment:", language);
  const newEnvironmentText = useAutoTranslation("New Environment:", language);
  const slotsText = useAutoTranslation("slots", language);
  const soloText = useAutoTranslation("solo", language);
  const distributionText = useAutoTranslation("distribution", language);
  const hasSubmittedArtworksText = useAutoTranslation("This exhibit already has submitted artworks. Changing environments will redistribute all slots.", language);
  const cannotSwitchText = useAutoTranslation("Cannot switch to", language);
  const slotsEnvironmentText = useAutoTranslation("slots environment.", language);
  const currentCollaboratorsText = useAutoTranslation("Current collaborators", language);
  const exceedCapacityText = useAutoTranslation("exceed the capacity.", language);
  const cannotDowngradeText = useAutoTranslation("Cannot downgrade environment when artworks are already submitted.", language);
  const pleaseRemoveCollaboratorsText = useAutoTranslation("Please remove some collaborators first.", language);
  const downgradingEnvironmentText = useAutoTranslation("Downgrading environment with submitted artworks.", language);
  const existingArtworksPreservedText = useAutoTranslation("Existing artworks will be preserved and redistributed.", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const cannotChangeText = useAutoTranslation("Cannot Change", language);
  const confirmChangeText = useAutoTranslation("Confirm Change", language);

  const isDowngrade = newSlots < currentSlots;
  const isUpgrade = newSlots > currentSlots;

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
            {isDowngrade ? environmentDowngradeText : environmentChangeText}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[11px] text-center space-y-2">
            <div>
              <strong>{currentEnvironmentText}</strong> {currentSlots} {slotsText}
              <br />
              <span className="text-gray-600">{getSlotDistribution(currentSlots, collaborators.length)}</span>
            </div>

            <div>
              <strong>{newEnvironmentText}</strong> {newSlots} {slotsText}
              <br />
              <span className="text-gray-600">{getSlotDistribution(newSlots, collaborators.length)}</span>
            </div>

            {hasSubmittedArtworks && (
              <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-[10px] text-amber-700 font-medium">
                  {hasSubmittedArtworksText}
                </p>
              </div>
            )}

            {!canChangeEnvironment && (
              <div className="p-2 bg-red-50 rounded-md border border-red-200">
                <p className="text-[10px] text-red-700 font-medium">
                  {cannotSwitchText} {newSlots} {slotsEnvironmentText}
                  <br />
                  {currentCollaboratorsText} ({collaborators.length}) {exceedCapacityText}
                </p>
              </div>
            )}

            {isDowngrade && hasSubmittedArtworks && !canChangeEnvironment && (
              <div className="p-2 bg-red-50 rounded-md border border-red-200">
                <p className="text-[10px] text-red-700 font-medium">
                  {cannotDowngradeText}
                  <br />
                  {pleaseRemoveCollaboratorsText}
                </p>
              </div>
            )}

            {isDowngrade && hasSubmittedArtworks && canChangeEnvironment && (
              <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-[10px] text-amber-700 font-medium">
                  {downgradingEnvironmentText}
                  <br />
                  {existingArtworksPreservedText}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="w-full flex justify-between px-4">
            <AlertDialogCancel className="text-[10px] h-7">{cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              disabled={!canChangeEnvironment}
              className="text-[10px] h-7 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!canChangeEnvironment ? cannotChangeText : confirmChangeText}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EnvironmentChangeDialog;
