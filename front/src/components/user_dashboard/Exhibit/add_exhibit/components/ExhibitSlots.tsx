import React, { useState, useEffect } from "react";
import { Artist } from "../components/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import { User } from "@/hooks/users/useUserQuery";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { autoTranslate } from "@/utils/autoTranslate";
interface ExhibitSlotsProps {
  selectedEnvironment: number | null;
  environments: { id: number; image: string; slots: number }[];
  slotOwnerMap: Record<number, string>;
  slotArtworkMap: Record<number, string>;
  artworks: Artwork[];
  exhibitArtworks?: Artwork[];
  exhibitType: string;
  selectedSlots: number[];
  handleSlotSelect: (slotId: number) => void;
  handleClearSlot: (slotId: number) => void;
  canInteractWithSlot: (slotId: number) => boolean;
  getUserName: (userId: string) => string;
  getSlotColor: (slotId: number) => string;
  collaborators: User[];
  currentUser: User;
  colorNames: string[];
  slotColorSchemes: string[];
  mode?: "edit" | "create";
}

const ExhibitSlots: React.FC<ExhibitSlotsProps> = ({
  selectedEnvironment,
  environments,
  slotOwnerMap,
  slotArtworkMap,
  artworks,
  exhibitArtworks,
  exhibitType,
  selectedSlots,
  handleSlotSelect,
  handleClearSlot,
  canInteractWithSlot,
  getUserName,
  getSlotColor,
  collaborators,
  currentUser,
  colorNames,
  slotColorSchemes,
  mode,
}) => {
  const { language } = useLanguage();

  // State for translated color names
  const [translatedColorNames, setTranslatedColorNames] = useState<string[]>([...colorNames]);

  // Effect to translate color names when language changes
  useEffect(() => {
    const translateColorNames = async () => {
      try {
        const translated = await Promise.all(
          colorNames.map(async (colorName) => await autoTranslate(colorName, language.toLowerCase()))
        );
        setTranslatedColorNames(translated);
      } catch (error) {
        console.warn("Failed to translate color names:", error);
        setTranslatedColorNames([...colorNames]);
      }
    };

    if (language.toLowerCase() !== "en") {
      translateColorNames();
    } else {
      setTranslatedColorNames([...colorNames]);
    }
  }, [language, colorNames]);

  // Translation hooks for all text content
  const availableSlotsText = useAutoTranslation("Available Slots", language);
  const yourSlotsText = useAutoTranslation("Your slots", language);
  const slotsText = useAutoTranslation("slots", language);
  const removeText = useAutoTranslation("Remove", language);
  const slotsEvenlyDistributedText = useAutoTranslation("Slots are evenly distributed among collaborators", language);
  const selectSlotsText = useAutoTranslation("Select slots for your artwork placement", language);

  if (!selectedEnvironment) return null;

  const currentEnvironment = environments.find((env) => env.id === selectedEnvironment);
  if (!currentEnvironment) return null;

  const availableSlots = Array.from({ length: currentEnvironment.slots }, (_, i) => i + 1);

  // Helper function to safely convert border color to background color
  const getBgColorClass = (colorScheme: string | undefined) => {
    if (!colorScheme) return "bg-gray-200";

    try {
      return colorScheme.replace("border-", "bg-").replace("/10", "");
    } catch (error) {
      return "bg-gray-200";
    }
  };

  return (
    <div>
      <h3 className="text-xs font-medium mb-4 text-gray-900 dark:text-gray-100">{availableSlotsText}</h3>

      {/* Color coding legend - only for collaborative exhibits */}
      {exhibitType === "collab" && (
        <div className="mb-3 flex flex-wrap gap-3">
          {/* Show color legend for current participants */}
          <div className="flex items-center">
            <div className={`w-3 h-3 mr-1 rounded-full ${getBgColorClass(slotColorSchemes[0])}`}></div>
            <span className="text-[10px] text-gray-700 dark:text-gray-300">{translatedColorNames[0] || yourSlotsText}</span>
          </div>

          {collaborators.map((collab, index) => {
            // Make sure we don't access beyond the slotColorSchemes array
            const colorIndex = Math.min(index + 1, slotColorSchemes.length - 1);
            const colorScheme = slotColorSchemes[colorIndex] || slotColorSchemes[0];

            return (
              <div key={collab.id} className="flex items-center">
                <div className={`w-4 h-4 mr-1 rounded-full ${getBgColorClass(colorScheme)}`}></div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300">{`${collab.first_name} ${collab.last_name || ""}`.trim()}'s {slotsText}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {availableSlots.map((slotId) => {
          const assignedArtworkId = slotArtworkMap[slotId];
          const assignedArtwork = assignedArtworkId
            ? artworks.find((artwork) => String(artwork.id) === String(assignedArtworkId))
            : null;

          const slotColor = getSlotColor(slotId) || "border-gray-200";
          const slotOwner = slotOwnerMap?.[slotId] || currentUser.id;
          const userCanInteract = canInteractWithSlot(slotId);

          return (
            <div
              key={slotId}
              onClick={() => userCanInteract && handleSlotSelect(slotId)}
              className={`h-16 rounded-lg relative overflow-hidden border flex items-center justify-center ${
                userCanInteract ? "cursor-pointer" : ""
              } transition-colors ${
                selectedSlots.includes(slotId)
                  ? assignedArtwork
                    ? "border-primary"
                    : slotColor
                  : !userCanInteract
                  ? slotColor + " opacity-60"
                  : exhibitType === "solo"
                  ? "border-gray-200"
                  : slotColor
              }`}
            >
              {assignedArtwork ? (
                <>
                  <img
                    src={assignedArtwork.artworkImage}
                    alt={`Artwork ${assignedArtworkId}`}
                    className="w-full h-full object-cover"
                  />
                  {(mode === "edit" || mode === "create") && userCanInteract && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSlot(slotId);
                      }}
                    >
                      <span className="text-white text-[10px]">{removeText}</span>
                    </div>
                  )}
                </>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <span className="text-xs font-semibold">{slotId}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{getUserName(slotOwner || currentUser.id)}</span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-900 dark:text-gray-100">{getUserName(slotOwner || currentUser.id)}</p>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
        {exhibitType === "collab"
          ? slotsEvenlyDistributedText
          : selectSlotsText}
      </div>
    </div>
  );
};

export default ExhibitSlots;
