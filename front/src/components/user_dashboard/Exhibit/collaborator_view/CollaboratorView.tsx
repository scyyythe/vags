import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import Header from "@/components/user_dashboard/navbar/Header";
import { useCollaboratorExhibitView } from "@/hooks/exhibit/useCollaboratorExhibitView";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import { getLoggedInUserId } from "@/auth/decode";
import { useSubmitContributions } from "@/hooks/exhibit/useSubmitContributions";
import { useUpdateContributions } from "@/hooks/exhibit/useUpdateContributions";
import CollaboratorViewSkeleton from "@/components/skeletons/exhibits/CollaboratorViewSkeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

// Color schemes for slots by user
const slotColorSchemes = [
  "border-primary bg-primary/10",
  "border-[#9b87f5] bg-[#9b87f5]/10",
  "border-[#7E69AB] bg-[#7E69AB]/10",
];

type Artist = {
  id: string;
  name: string;
  avatar: string;
};

type CollaboratorViewProps = {
  exhibitData?: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    environment: number;
    bannerImage: string;
    slotOwnerMap: Record<number, string>;
    slotArtworkMap: Record<number, string>;
    owner: Artist;
    collaborators: Artist[];
  };
};

const CollaboratorView = ({ exhibitData }: CollaboratorViewProps) => {
  const navigate = useNavigate();
  const { exhibitId } = useParams();
  const { data, isLoading, error } = useCollaboratorExhibitView(exhibitId);
  const userId = getLoggedInUserId();
  const {
    data: userArtworks,
    isLoading: artworksLoading,
    error: artworksError,
  } = useArtworks(1, userId || undefined, !!userId, "created-by-me", "public", true);

  const [loading, setLoading] = useState(true);
  const [exhibit, setExhibit] = useState<CollaboratorViewProps["exhibitData"]>();
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [slotArtworkMap, setSlotArtworkMap] = useState<Record<number, string>>({});
  const [currentCollaborator, setCurrentCollaborator] = useState<Artist | null>(null);
  const [hasUserSubmitted, setHasUserSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clearedSlots, setClearedSlots] = useState<Set<number>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const { mutate: submitContributions } = useSubmitContributions(exhibitId!);
  const { mutate: updateContributions } = useUpdateContributions(exhibitId!);
  const { language } = useLanguage();

  // Translation hooks for all text content
  const goBackText = useAutoTranslation("Go back", language);
  const exhibitCollaborationText = useAutoTranslation("Exhibit Collaboration", language);
  const alreadySubmittedText = useAutoTranslation("You have already submitted your contributions!", language);
  const canEditContributionsText = useAutoTranslation("You can still edit your artworks for", language);
  const viewOthersContributionsText = useAutoTranslation("You can view what other collaborators have contributed while waiting for the exhibit to be published.", language);
  const invitedToContributeText = useAutoTranslation("You are invited to contribute to", language);
  const selectArtworkText = useAutoTranslation("Please select your artwork for the slots assigned to you below.", language);
  const availableSlotsText = useAutoTranslation("Available Slots", language);
  const slotsText = useAutoTranslation("slots", language);
  const yourSelectionText = useAutoTranslation("Your selection", language);
  const removeText = useAutoTranslation("Remove", language);
  const slotText = useAutoTranslation("slot", language);
  const clickOnArtworkText = useAutoTranslation("Click on an artwork to assign it to this slot", language);
  const yourArtworkSelectionText = useAutoTranslation("Your Artwork Selection", language);
  const ofText = useAutoTranslation("of", language);
  const slotsFilledText = useAutoTranslation("slots filled", language);
  const preview3DText = useAutoTranslation("Preview in 3D View", language);
  const previewDescriptionText = useAutoTranslation("Opens your current selections in an interactive virtual gallery.", language);
  const yourArtworksText = useAutoTranslation("Your Artworks", language);
  const alreadySubmittedButtonText = useAutoTranslation("Already Submitted", language);
  const cannotEditSubmittedText = useAutoTranslation("You can no longer edit your artworks since they were already submitted", language);
  const saveSelectionsText = useAutoTranslation("Save Selections", language);
  const noAvailableSlotsText = useAutoTranslation("No available slots", language);
  const noAvailableSlotsDescText = useAutoTranslation("You don't have any available slots for more artwork.", language);
  const selectionsSavedText = useAutoTranslation("Selections Saved", language);
  const selectionsSavedDescText = useAutoTranslation("Your artwork selections have been saved to the exhibit!", language);
  const contributionsUpdatedText = useAutoTranslation("Contributions Updated", language);
  const contributionsUpdatedDescText = useAutoTranslation("Your artwork contributions have been updated successfully!", language);
  const editContributionsText = useAutoTranslation("Edit Contributions", language);
  const cancelEditText = useAutoTranslation("Cancel Edit", language);
  const updateSelectionsText = useAutoTranslation("Update Selections", language);
  const errorText = useAutoTranslation("Error", language);
  const failedToSubmitText = useAutoTranslation("Failed to submit contributions.", language);
  const failedToUpdateText = useAutoTranslation("Failed to update contributions.", language);
  const exhibitNotFoundText = useAutoTranslation("Exhibit not found", language);
  const unknownText = useAutoTranslation("Unknown", language);

  // Translate exhibit title and description (must be before conditional returns)
  const translatedTitle = useAutoTranslation(exhibit?.title || "", language);
  const translatedDescription = useAutoTranslation(exhibit?.description || "", language);

  // Filter artworks to show only Active and Public ones with valid images
  const artworks = (userArtworks || []).filter((artwork) => {
    const isActiveAndPublic = artwork.art_status === "Active" && artwork.visibility === "Public";
    
    const hasValidArtworkImage = artwork.artworkImage && 
      artwork.artworkImage !== "" && 
      artwork.artworkImage !== "h";
    
    const hasValidImageUrl = artwork.image_url && 
      (Array.isArray(artwork.image_url) 
        ? artwork.image_url.length > 0 && artwork.image_url[0] !== "" && artwork.image_url[0] !== "h"
        : artwork.image_url !== "" && artwork.image_url !== "h");

    return isActiveAndPublic && (hasValidArtworkImage || hasValidImageUrl);
  });

  const environments = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      slots: 4,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      slots: 6,
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      slots: 10,
    },
  ];

  const mockCollaborator: Artist = {
    id: "201",
    name: "Jai Anoba",
    avatar:
      "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
  };

  const mockExhibitData = {
    id: parseInt(exhibitId || "1"),
    title: "Urban Dreamscape",
    description: "A collaborative exhibit exploring the intersection of natural and urban landscapes",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    environment: 2,
    bannerImage:
      "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slotOwnerMap: {
      1: 100,
      2: 100,
      3: 201,
      4: 201,
      5: 202,
      6: 202,
    },
    slotArtworkMap: { 1: "1", 2: "2" },
    owner: {
      id: 100,
      name: "Jera Anderson",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    },
    collaborators: [
      mockCollaborator,
      {
        id: 202,
        name: "Angel Canete",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
    ],
  };
  useEffect(() => {
    if (!data || isEditing) return;

    const { slotOwnerMap, slotArtworkMap, owner, collaborators } = data;

    const transformedExhibit = {
      id: data.id,
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      environment: data.environment,
      bannerImage: data.bannerImage,

      slotOwnerMap: Object.fromEntries(Object.entries(slotOwnerMap).map(([k, v]) => [parseInt(k), v])),

      slotArtworkMap: Object.fromEntries(Object.entries(slotArtworkMap).map(([k, v]) => [parseInt(k), v])),

      owner: {
        id: owner.id,
        name: owner.name,
        avatar: owner.avatar,
      },

      collaborators: collaborators.map((collab) => ({
        id: collab.id,
        name: collab.name,
        avatar: collab.avatar,
      })),
    };

    setExhibit(transformedExhibit);
    setSlotArtworkMap(transformedExhibit.slotArtworkMap);
    setSelectedArtworks(Object.values(transformedExhibit.slotArtworkMap));

    const currentUser = transformedExhibit.collaborators.find((c) => String(c.id) === String(userId));

    setCurrentCollaborator(currentUser || null);

    // Check if current user has already submitted their contributions
    if (currentUser && data.slots) {
      const userSlots = Object.entries(transformedExhibit.slotOwnerMap)
        .filter(([_, ownerId]) => ownerId === currentUser.id)
        .map(([slotId]) => Number(slotId));

      const userSubmittedSlots = data.slots.filter(
        (slot: any) => userSlots.includes(slot.slot_number) && slot.contributor.id === currentUser.id
      );

      const hasSubmitted = userSubmittedSlots.length === userSlots.length && userSlots.length > 0;
      setHasUserSubmitted(hasSubmitted);
      
      // If user has submitted, populate the slotArtworkMap with their existing contributions
      if (hasSubmitted) {
        const existingContributions = {};
        userSubmittedSlots.forEach((slot: any) => {
          existingContributions[slot.slot_number] = slot.artwork.id;
        });
        setSlotArtworkMap(existingContributions);
        setSelectedArtworks(Object.values(existingContributions));
      }
    }

    setLoading(false);
  }, [data]);


  if (loading) {
    return <CollaboratorViewSkeleton />;
  }

  if (!exhibit) {
    return <div className="min-h-screen text-xs flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">{exhibitNotFoundText}</div>;
  }

  const currentEnvironment = environments.find((env) => env.id === exhibit.environment);
  const availableSlots = currentEnvironment ? Array.from({ length: currentEnvironment.slots }, (_, i) => i + 1) : [];

  const handleSlotSelect = (slotId: number) => {
    if (!currentCollaborator || (hasUserSubmitted && !isEditing)) return;
    if (exhibit.slotOwnerMap[slotId] !== currentCollaborator.id) return;
    
    setSelectedSlot(slotId);
  };

  const handleArtworkSelect = (artworkId: string) => {
    if (!currentCollaborator || (hasUserSubmitted && !isEditing)) return;

    // If no slot is selected, find the first available slot
    let targetSlot = selectedSlot;
    
    if (!targetSlot) {
      const availableUserSlots = Object.entries(exhibit.slotOwnerMap)
        .filter(([slotId, ownerId]) => String(ownerId) === String(currentCollaborator.id))
        .map(([slotId]) => Number(slotId));

      targetSlot = availableUserSlots.find(slotId => 
        !slotArtworkMap[slotId] || isEditing
      );
    }

    if (!targetSlot) {
      toast.error(noAvailableSlotsText, {
        description: noAvailableSlotsDescText,
        closeButton: true,
      });
      return;
    }

    // If replacing an existing artwork, remove it from selectedArtworks first
    if (isEditing && slotArtworkMap[targetSlot]) {
      setSelectedArtworks((prev) => prev.filter((id) => id !== slotArtworkMap[targetSlot]));
    }

    setSlotArtworkMap((prev) => ({
      ...prev,
      [targetSlot]: artworkId,
    }));

    setSelectedArtworks((prev) => [...prev, artworkId]);
    
    // Clear selected slot after assignment
    setSelectedSlot(null);
  };

  const handleClearSlot = (slotId: number) => {
    if (!currentCollaborator || (hasUserSubmitted && !isEditing)) return;

    if (exhibit.slotOwnerMap[slotId] !== currentCollaborator.id) {
      return;
    }

    // Check if there's an artwork in this slot (either from slotArtworkMap or from contributed slots)
    const artworkId = slotArtworkMap[slotId];
    const contributedSlot = data?.slots?.find((slot: any) => slot.slot_number === slotId);
    
    if (artworkId) {
      // Clear from local state
      setSelectedArtworks((prev) => prev.filter((id) => id !== artworkId));
      const newSlotArtworkMap = { ...slotArtworkMap };
      delete newSlotArtworkMap[slotId];
      setSlotArtworkMap(newSlotArtworkMap);
    } else if (contributedSlot?.artwork) {
      // Clear contributed artwork from local state
      setSelectedArtworks((prev) => prev.filter((id) => id !== contributedSlot.artwork.id));
      const newSlotArtworkMap = { ...slotArtworkMap };
      delete newSlotArtworkMap[slotId];
      setSlotArtworkMap(newSlotArtworkMap);
    }

    // Mark this slot as cleared
    setClearedSlots(prev => new Set([...prev, slotId]));
  };

  const handleSaveSelections = () => {
    if (!currentCollaborator) return;

    const payload = Object.entries(slotArtworkMap)
      .filter(([slotId, artworkId]) => {
        return exhibit.slotOwnerMap[parseInt(slotId)] === currentCollaborator.id;
      })
      .map(([slotId, artworkId]) => ({
        slot_number: parseInt(slotId),
        artwork: artworkId,
      }));

    if (isEditing) {
      // Update existing contributions
      updateContributions(payload, {
        onSuccess: () => {
          toast.success(contributionsUpdatedText, {
            description: contributionsUpdatedDescText,
            closeButton: true,
          });
          setIsEditing(false);
          setHasUserSubmitted(true);
          navigate("/exhibits");
        },
        onError: (err: any) => {
          toast.error(errorText, {
            description: err?.response?.data?.detail || failedToUpdateText,
            closeButton: true,
          });
        },
      });
    } else {
      // Create new contributions
      submitContributions(payload, {
        onSuccess: () => {
          toast.success(selectionsSavedText, {
            description: selectionsSavedDescText,
            closeButton: true,
          });
          navigate("/exhibits");
        },
        onError: (err: any) => {
          toast.error(errorText, {
            description: err?.response?.data?.detail || failedToSubmitText,
            closeButton: true,
          });
        },
      });
    }
  };

  const getColorSchemeIndex = (userId: string) => {
    if (userId === exhibit.owner.id) return 0;

    const collaboratorIndex = exhibit.collaborators.findIndex((c) => c.id === userId);
    return collaboratorIndex + 1;
  };

  const getSlotColor = (slotId: number) => {
    const ownerId = exhibit.slotOwnerMap[slotId];
    if (!ownerId) return slotColorSchemes[0];

    return slotColorSchemes[getColorSchemeIndex(ownerId)];
  };
  
  // Component to display user name with slot text (with translation)
  const UserSlotName = ({ userId }: { userId: string }) => {
    if (userId === exhibit.owner.id) {
      return (
        <>
          <TranslatedText text={exhibit.owner.name} />'s {slotText}
        </>
      );
    }
    const collaborator = exhibit.collaborators.find((c) => c.id === userId);
    return collaborator ? (
      <>
        <TranslatedText text={collaborator.name} />'s {slotText}
      </>
    ) : null;
  };

  const canInteractWithSlot = (slotId: number) => {
    const ownerId = exhibit.slotOwnerMap[slotId];
    return currentCollaborator ? ownerId === currentCollaborator.id : false;
  };

  const getUserSlotStats = () => {
    if (!currentCollaborator) return { total: 0, filled: 0 };

    const userSlots = Object.entries(exhibit.slotOwnerMap)
      .filter(([_, userId]) => userId === currentCollaborator.id)
      .map(([slotId]) => Number(slotId));

    const filledSlots = userSlots.filter((slotId) => slotArtworkMap[slotId]);

    return {
      total: userSlots.length,
      filled: filledSlots.length,
    };
  };

  const slotStats = getUserSlotStats();

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Header />
      <div className="container mx-auto pt-20 pb-4">
        <div className="mb-3">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
            <i className="bx bx-chevron-left text-xl mr-2"></i>{goBackText}
          </button>
        </div>

        {/* Collaborator View Notice */}
        <div className="mb-6">
          <h2 className="text-[13px] font-medium mb-1 text-gray-900 dark:text-gray-100">{exhibitCollaborationText}</h2>
          {hasUserSubmitted && !isEditing ? (
            <div className="space-y-2">
              <p className="text-[11px] text-green-600 dark:text-green-400 font-medium">✓ {alreadySubmittedText}</p>
              <p className="text-[11px] text-gray-700 dark:text-gray-300">
                {canEditContributionsText} "{translatedTitle}". {viewOthersContributionsText}
              </p>
            </div>
          ) : isEditing ? (
            <div className="space-y-2">
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">✏️ {editContributionsText}</p>
              <p className="text-[11px] text-gray-700 dark:text-gray-300">
                You can now modify your artwork selections for "{translatedTitle}".
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-gray-700 dark:text-gray-300">
              {invitedToContributeText} "{translatedTitle}". {selectArtworkText}
            </p>
          )}
        </div>

        <div className="space-y-8">
          {/* Banner Image */}
          <div
            className="w-full rounded-lg h-64 mb-4 relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${exhibit.bannerImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white">
              <h1 className="text-md font-bold mb-2">{translatedTitle}</h1>
              <p className="text-[11px]">
                {new Date(exhibit.startDate).toLocaleDateString()} - {new Date(exhibit.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Slots */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-medium mb-4 text-gray-900 dark:text-gray-100">{availableSlotsText}</h3>

                {/* Color coding legend */}
                <div className="mb-3 flex flex-wrap gap-3">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 mr-1 rounded-full ${slotColorSchemes[0]
                        .replace("border-", "bg-")
                        .replace("/10", "")}`}
                    ></div>
                    <span className="text-[10px] text-gray-700 dark:text-gray-300"><TranslatedText text={exhibit.owner.name} />'s {slotsText}</span>
                  </div>

                  {exhibit.collaborators.map((collab, index) => (
                    <div key={collab.id} className="flex items-center">
                      <div
                        className={`w-3 h-3 mr-1 rounded-full ${slotColorSchemes[index + 1]
                          .replace("border-", "bg-")
                          .replace("/10", "")}`}
                      ></div>
                      <span className="text-[10px] text-gray-700 dark:text-gray-300"><TranslatedText text={collab.name} />'s {slotsText}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    // Create a used artworks tracker to avoid showing the same artwork multiple times
                    const usedArtworks = new Set();

                    return availableSlots.map((slotId) => {
                      const slotColor = getSlotColor(slotId);
                      const slotOwner = exhibit.slotOwnerMap[slotId];
                      const userCanInteract = canInteractWithSlot(slotId);

                      // Find contributed artwork for this slot - ONLY use exact matches
                      let contributedSlot = data.slots?.find((slot: any) => slot.slot_number === slotId);

                      // Only use exact slot matches - don't try to assign artworks to different slots
                      if (contributedSlot) {
                        usedArtworks.add(contributedSlot.artwork?.id);
                      }

                      const assignedArtworkId = slotArtworkMap[slotId];
                      const assignedArtwork = assignedArtworkId
                        ? artworks.find((artwork) => artwork.id === String(assignedArtworkId))
                        : null;

                      // In editing mode, if slot is cleared locally, don't show contributed artwork
                      const isSlotCleared = isEditing && clearedSlots.has(slotId);

                      return (
                        <div
                          key={slotId}
                          onClick={() => userCanInteract && handleSlotSelect(slotId)}
                          className={`h-[93px] rounded-lg relative overflow-hidden border flex items-center justify-center transition-colors 
                          ${userCanInteract ? "cursor-pointer" : ""}
                          ${!userCanInteract ? slotColor + " opacity-75" : slotColor}
                          ${selectedSlot === slotId ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                        >
                          {contributedSlot?.artwork && !isSlotCleared ? (
                            // Show actual contributed artwork from backend (highest priority)
                            <>
                              <img
                                src={(() => {
                                  // Try artworkImage first, then image_url, with array handling
                                  const artwork = contributedSlot.artwork;
                                  if (
                                    artwork.artworkImage &&
                                    artwork.artworkImage !== "" &&
                                    artwork.artworkImage !== "h"
                                  ) {
                                    return artwork.artworkImage;
                                  }
                                  if (artwork.image_url) {
                                    return Array.isArray(artwork.image_url) ? artwork.image_url[0] : artwork.image_url;
                                  }
                                  return "";
                                })()}
                                alt={contributedSlot.artwork.title || "Artwork"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Try the alternative image source
                                  const target = e.target as HTMLImageElement;
                                  const artwork = contributedSlot.artwork;

                                  if (target.src === artwork.artworkImage && artwork.image_url) {
                                    // Try image_url if artworkImage failed
                                    target.src = Array.isArray(artwork.image_url)
                                      ? artwork.image_url[0]
                                      : artwork.image_url;
                                  } else if (
                                    (Array.isArray(artwork.image_url)
                                      ? artwork.image_url.some((url) => target.src.includes(url))
                                      : artwork.image_url && target.src.includes(artwork.image_url)) &&
                                    artwork.artworkImage &&
                                    artwork.artworkImage !== "h"
                                  ) {
                                    // Try artworkImage if image_url failed
                                    target.src = artwork.artworkImage;
                                  } else {
                                    // Hide image if both URLs fail
                                    e.currentTarget.style.display = "none";
                                  }
                                }}
                              />
                              <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded">
                                {slotId}
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[7px] px-1 py-0.5 rounded truncate max-w-[80%]">
                                {contributedSlot.contributor?.name ? <TranslatedText text={contributedSlot.contributor.name} /> : unknownText}
                              </div>
                              {/* Remove overlay for editing mode */}
                              {isEditing && userCanInteract && (
                                <div
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={() => handleClearSlot(slotId)}
                                >
                                  <span className="text-white text-[10px] font-medium">{removeText}</span>
                                </div>
                              )}
                            </>
                          ) : assignedArtwork ? (
                            // Show user's selected artwork (for slots they can interact with)
                            <>
                              <img
                                src={
                                  assignedArtwork.artworkImage ||
                                  (Array.isArray(assignedArtwork.image_url)
                                    ? assignedArtwork.image_url[0]
                                    : assignedArtwork.image_url)
                                }
                                alt={`Artwork ${assignedArtworkId}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const fallbackUrl = Array.isArray(assignedArtwork.image_url)
                                    ? assignedArtwork.image_url[0]
                                    : assignedArtwork.image_url;
                                  if (target.src !== fallbackUrl) {
                                    target.src = fallbackUrl || "";
                                  }
                                }}
                              />
                              <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded">
                                {slotId}
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[7px] px-1 py-0.5 rounded truncate max-w-[80%]">
                                {yourSelectionText}
                              </div>
                              {userCanInteract && (
                                <div
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={() => handleClearSlot(slotId)}
                                >
                                  <span className="text-white text-[10px]">{removeText}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            // Show empty slot
                            <Popover>
                              <PopoverTrigger asChild>
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                  <span className="text-xs font-semibold">{slotId}</span>
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400"><UserSlotName userId={slotOwner} /></span>
                                  {selectedSlot === slotId && (
                                    <span className="text-[8px] text-blue-600 font-medium mt-1">Selected</span>
                                  )}
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                                <p className="text-[10px] text-gray-900 dark:text-gray-100"><UserSlotName userId={slotOwner} /></p>
                                {userCanInteract && (
                                  <p className="text-[9px] text-blue-600 dark:text-blue-400 mt-1">
                                    {selectedSlot === slotId ? "Click on an artwork to assign it to this slot" : "Click to select this slot, then click an artwork"}
                                  </p>
                                )}
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Collaborator progress status */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-[11px] font-medium mb-2 text-gray-900 dark:text-gray-100">{yourArtworkSelectionText}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-700 dark:text-gray-300">
                    {slotStats.filled} {ofText} {slotStats.total} {slotsFilledText}
                  </span>
                  <div className="w-24 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9b87f5]"
                      style={{
                        width: `${slotStats.total > 0 ? (slotStats.filled / slotStats.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              {/* Preview Button */}
              <div className="mt-7">
                <button
                  type="button"
                  className="bg-gray-900 dark:bg-gray-700 text-white text-[10px] px-5 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600"
                  onClick={() => {
                    navigate("/gallery3d-preview");
                  }}
                >
                  {preview3DText}
                </button>
                <p className="text-[10px] text-muted-foreground dark:text-gray-400 mt-2">
                  {previewDescriptionText}
                </p>
              </div>
            </div>

            {/* Right Column - Artworks */}
            <div>
              <h3 className="text-xs font-medium mb-4 text-gray-900 dark:text-gray-100">{yourArtworksText}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
                {artworks.map((artwork) => {
                  const isSelected = selectedArtworks.includes(String(artwork.id));
                  return (
                    <Card
                      key={artwork.id}
                      onClick={() => !isSelected && (!hasUserSubmitted || isEditing) && handleArtworkSelect(String(artwork.id))}
                      className={`overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 ${
                        hasUserSubmitted && !isEditing
                          ? "cursor-not-allowed opacity-60"
                          : isSelected
                          ? "opacity-40 cursor-pointer"
                          : selectedSlot
                          ? "cursor-pointer ring-2 ring-green-500 ring-offset-2"
                          : "cursor-pointer"
                      }`}
                    >
                      <img
                        src={artwork.artworkImage || (Array.isArray(artwork.image_url) ? artwork.image_url[0] : artwork.image_url) || ""}
                        alt={`Artwork ${artwork.id}`}
                        className="w-full h-[96px] object-cover"
                        onError={(e) => {
                          // Fallback to image_url if artworkImage fails
                          const target = e.target as HTMLImageElement;
                          const fallbackUrl = Array.isArray(artwork.image_url) ? artwork.image_url[0] : artwork.image_url;
                          if (fallbackUrl && target.src !== fallbackUrl) {
                            target.src = fallbackUrl;
                          }
                        }}
                      />
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end mt-8">
            {hasUserSubmitted && !isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setClearedSlots(new Set()); // Reset cleared slots when starting edit
                    setSelectedSlot(null); // Reset selected slot
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-[10px] px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {editContributionsText}
                </button>
                <div className="flex flex-col items-end">
                  <button
                    disabled
                    className="bg-gray-400 dark:bg-gray-600 text-white text-[10px] px-8 py-1.5 rounded-full cursor-not-allowed"
                  >
                    {alreadySubmittedButtonText}
                  </button>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                    {cannotEditSubmittedText}
                  </p>
                </div>
              </div>
            ) : isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setClearedSlots(new Set()); // Reset cleared slots when canceling edit
                    setSelectedSlot(null); // Reset selected slot
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-[10px] px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {cancelEditText}
                </button>
                <button
                  onClick={handleSaveSelections}
                  className="bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-600 text-white text-[10px] px-8 py-1.5 rounded-full"
                >
                  {updateSelectionsText}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSaveSelections}
                className="bg-red-700 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-500 text-white text-[10px] px-8 py-1.5 rounded-full"
              >
                {saveSelectionsText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorView;
