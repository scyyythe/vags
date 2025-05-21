import React from "react";
import { Artwork, Artist } from "../components/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ExhibitSlotsProps {
  selectedEnvironment: number | null;
  environments: { id: number; image: string; slots: number }[];
  slotOwnerMap: Record<number, number>;
  slotArtworkMap: Record<number, number>;
  artworks: Artwork[];
  exhibitType: string;
  selectedSlots: number[];
  handleSlotSelect: (slotId: number) => void;
  handleClearSlot: (slotId: number) => void;
  canInteractWithSlot: (slotId: number) => boolean; 
  getUserName: (userId: number) => string;
  getSlotColor: (slotId: number) => string;
  collaborators: Artist[];
  currentUser: Artist;
  colorNames: string[];
  slotColorSchemes: string[];
}

const ExhibitSlots: React.FC<ExhibitSlotsProps> = ({
  selectedEnvironment,
  environments,
  slotOwnerMap,
  slotArtworkMap,
  artworks,
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
  slotColorSchemes
}) => {
  if (!selectedEnvironment) return null;

  const currentEnvironment = environments.find(env => env.id === selectedEnvironment);
  if (!currentEnvironment) return null;
  
  const availableSlots = Array.from({ length: currentEnvironment.slots }, (_, i) => i + 1);

  // Helper function to safely convert border color to background color
  const getBgColorClass = (colorScheme: string | undefined) => {
    if (!colorScheme) return "bg-gray-200"; 
    
    try {
      return colorScheme.replace('border-', 'bg-').replace('/10', '');
    } catch (error) {
      return "bg-gray-200"; 
    }
  };

  return (
    <div>
      <h3 className="text-xs font-medium mb-4">Available Slots</h3>
      
      {/* Color coding legend - only for collaborative exhibits */}
      {exhibitType === 'collab' && (
        <div className="mb-3 flex flex-wrap gap-3">
          {/* Show color legend for current participants */}
          <div className="flex items-center">
            <div className={`w-3 h-3 mr-1 rounded-full ${getBgColorClass(slotColorSchemes[0])}`}></div>
            <span className="text-[10px]">{colorNames[0] || 'Your slots'}</span>
          </div>
          
          {collaborators.map((collab, index) => {
            // Make sure we don't access beyond the slotColorSchemes array
            const colorIndex = Math.min(index + 1, slotColorSchemes.length - 1);
            const colorScheme = slotColorSchemes[colorIndex] || slotColorSchemes[0];
            
            return (
              <div key={collab.id} className="flex items-center">
                <div className={`w-4 h-4 mr-1 rounded-full ${getBgColorClass(colorScheme)}`}></div>
                <span className="text-[10px]">{collab.name}'s slots</span>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-3">
        {availableSlots.map((slotId) => {
          const assignedArtworkId = slotArtworkMap[slotId];
          const assignedArtwork = assignedArtworkId ? artworks.find(artwork => artwork.id === assignedArtworkId) : null;
          const slotColor = getSlotColor(slotId);
          const slotOwner = slotOwnerMap[slotId];
          const userCanInteract = canInteractWithSlot(slotId);
          
          return (
            <div 
              key={slotId}
              onClick={() => userCanInteract && handleSlotSelect(slotId)}
              className={`h-16 rounded-lg relative overflow-hidden border flex items-center justify-center ${
                userCanInteract ? 'cursor-pointer' : ''
              } transition-colors ${
                selectedSlots.includes(slotId) 
                  ? assignedArtwork 
                    ? "border-primary" 
                    : slotColor
                  : !userCanInteract 
                    ? slotColor + " opacity-60"
                    : exhibitType === 'solo' ? 'border-gray-200' : slotColor
              }`}
            >
              {assignedArtwork ? (
                <>
                  <img 
                    src={assignedArtwork.image}
                    alt={`Artwork ${assignedArtworkId}`}
                    className="w-full h-full object-cover"
                  />
                  {userCanInteract && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSlot(slotId);
                      }}
                    >
                      <span className="text-white text-[10px]">Remove</span>
                    </div>
                  )}
                </>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <span className="text-xs font-semibold">{slotId}</span>
                      <span className="text-[10px] text-gray-500">
                        {getUserName(slotOwner || currentUser.id)}
                      </span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <p className="text-xs">{getUserName(slotOwner || currentUser.id)}</p>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] text-gray-500">
        {exhibitType === "collab" ? 
          "Slots are evenly distributed among collaborators" : 
          "Select slots for your artwork placement"}
      </div>
    </div>
  );
};

export default ExhibitSlots;
