import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddArtistDialog from "@/components/user_dashboard/Exhibit/add_exhibit/components/AddArtistDialog";
import Header from "@/components/user_dashboard/navbar/Header";

// Import new components
import BannerUpload from "./components/BannerUpload";
import EnvironmentSelector from "./components/EnvironmentSelector";
import ExhibitSlots from "./components/ExhibitSlots";
import ExhibitFormFields from "./components/ExhibitFormFields";
import ArtworkSelector from "./components/ArtworkSelector";
import ModeStatusDisplay from "./components/ModeStatusDisplay";
import CollaboratorNotice from "./components/CollaboratorNotice";
import ExhibitDialogs from "./components/ExhibitDialogs";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import { getLoggedInUserId } from "@/auth/decode";

import type { ViewMode } from "./components/types";
import useUserQuery from "@/hooks/users/useUserQuery";
import type { User } from "@/hooks/users/useUserQuery";

import { useCreateExhibit } from "@/hooks/mutate/exhibit/AddExhibit";

// Import extracted constants and data
import { slotColorSchemes, colorNames } from "@/components/constants/slot-color-schemes";
import { mockExhibitData } from "@/components/data/mock-exhibit-data";
import { environments } from "@/components/data/environments-data";

// Import extracted utilities
import {
  getSlotColor,
  getUserName,
  canInteractWithSlot,
  getCollaboratorSubmissionStatus,
} from "@/utils/exhibit-helpers";

// Import extracted handlers
import { createSubmitHandler } from "@/components/handlers/submit-handlers";

const AddExhibit = () => {
  const navigate = useNavigate();
  const { exhibitId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode") || "";

  // State variables
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [exhibitType, setExhibitType] = useState("solo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null);
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [slotArtworkMap, setSlotArtworkMap] = useState<Record<number, string>>({});
  const [isAddArtistDialogOpen, setIsAddArtistDialogOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [slotOwnerMap, setSlotOwnerMap] = useState<Record<number, string>>({});

  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [isRemoveCollaboratorDialogOpen, setIsRemoveCollaboratorDialogOpen] = useState(false);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<User | null>(null);
  const [artworkStyle, setArtworkStyle] = useState("");

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("owner");
  const [currentCollaborator, setCurrentCollaborator] = useState<User | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const currentUserId = getLoggedInUserId();

  const { data: artworks = [] } = useArtworks(
    1,
    currentUserId ?? undefined,
    !!currentUserId,
    "created-by-me",
    "public",
    true
  );

  // Additional filtering to ensure only Active and Public artworks with valid images
  const filteredArtworks = artworks.filter((artwork) => {
    // Use artworkImage as primary, fallback to image_url if artworkImage is invalid
    const primaryImage =
      artwork.artworkImage && artwork.artworkImage.trim() !== "" && artwork.artworkImage !== "h"
        ? artwork.artworkImage
        : artwork.image_url;

    return (
      artwork.art_status === "Active" &&
      artwork.visibility === "Public" &&
      primaryImage &&
      primaryImage.trim() !== "" &&
      primaryImage !== "h"
    );
  });
  const { data: currentUser, isLoading } = useUserQuery(currentUserId ?? "");

  // Function to distribute slots among participants
  const distributeSlots = (envId?: number, collabList?: User[], exhibitTypeParam?: string) => {
    const environmentId = envId || selectedEnvironment;
    const collaboratorList = collabList || collaborators;
    const currentExhibitType = exhibitTypeParam || exhibitType;

    if (!environmentId || !currentUser?.id) return;

    const currentEnvironment = environments.find((env) => env.id === environmentId);
    if (!currentEnvironment) return;

    const totalSlots = currentEnvironment.slots;

    // Reset all related slot selections
    setSelectedSlots([]);
    setSelectedArtworks([]);
    setSlotArtworkMap({});

    const newSlotOwnerMap: Record<number, string> = {};

    if (currentExhibitType === "solo") {
      // Solo exhibit: curator gets all slots
      for (let i = 1; i <= totalSlots; i++) {
        newSlotOwnerMap[i] = currentUser.id.toString();
      }
    } else {
      // Collaborative exhibit: specific distribution rules
      const participants = [currentUser, ...collaboratorList];

      // Apply specific distribution rules based on slot count and collaborator count
      if (totalSlots === 4) {
        // 4 slots: Owner gets 2, Collaborator gets 2
        newSlotOwnerMap[1] = currentUser.id.toString();
        newSlotOwnerMap[2] = currentUser.id.toString();
        if (collaboratorList.length > 0) {
          newSlotOwnerMap[3] = collaboratorList[0].id.toString();
          newSlotOwnerMap[4] = collaboratorList[0].id.toString();
        }
      } else if (totalSlots === 6) {
        // 6 slots: Distribute based on collaborator count
        if (collaboratorList.length === 1) {
          // 1 collaborator: 3-3 distribution
          newSlotOwnerMap[1] = currentUser.id.toString();
          newSlotOwnerMap[2] = currentUser.id.toString();
          newSlotOwnerMap[3] = currentUser.id.toString();
          newSlotOwnerMap[4] = collaboratorList[0].id.toString();
          newSlotOwnerMap[5] = collaboratorList[0].id.toString();
          newSlotOwnerMap[6] = collaboratorList[0].id.toString();
        } else if (collaboratorList.length === 2) {
          // 2 collaborators: 2-2-2 distribution
          newSlotOwnerMap[1] = currentUser.id.toString();
          newSlotOwnerMap[2] = currentUser.id.toString();
          newSlotOwnerMap[3] = collaboratorList[0].id.toString();
          newSlotOwnerMap[4] = collaboratorList[0].id.toString();
          newSlotOwnerMap[5] = collaboratorList[1].id.toString();
          newSlotOwnerMap[6] = collaboratorList[1].id.toString();
        }
      } else if (totalSlots === 10) {
        // 10 slots: Distribute based on collaborator count
        if (collaboratorList.length === 1) {
          // 1 collaborator: 5-5 distribution
          newSlotOwnerMap[1] = currentUser.id.toString();
          newSlotOwnerMap[2] = currentUser.id.toString();
          newSlotOwnerMap[3] = currentUser.id.toString();
          newSlotOwnerMap[4] = currentUser.id.toString();
          newSlotOwnerMap[5] = currentUser.id.toString();
          newSlotOwnerMap[6] = collaboratorList[0].id.toString();
          newSlotOwnerMap[7] = collaboratorList[0].id.toString();
          newSlotOwnerMap[8] = collaboratorList[0].id.toString();
          newSlotOwnerMap[9] = collaboratorList[0].id.toString();
          newSlotOwnerMap[10] = collaboratorList[0].id.toString();
        } else if (collaboratorList.length === 2) {
          // 2 collaborators: 4-3-3 distribution (owner priority)
          newSlotOwnerMap[1] = currentUser.id.toString();
          newSlotOwnerMap[2] = currentUser.id.toString();
          newSlotOwnerMap[3] = currentUser.id.toString();
          newSlotOwnerMap[4] = currentUser.id.toString();
          newSlotOwnerMap[5] = collaboratorList[0].id.toString();
          newSlotOwnerMap[6] = collaboratorList[0].id.toString();
          newSlotOwnerMap[7] = collaboratorList[0].id.toString();
          newSlotOwnerMap[8] = collaboratorList[1].id.toString();
          newSlotOwnerMap[9] = collaboratorList[1].id.toString();
          newSlotOwnerMap[10] = collaboratorList[1].id.toString();
        }
      }
    }

    setSlotOwnerMap(newSlotOwnerMap);
  };

  // Handle artwork selection - ORIGINAL LOGIC
  const handleArtworkSelect = (artworkId: string) => {
    const currentUserIdForSelection =
      currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id);
    if (!currentUserIdForSelection) return;

    const currentUserIdStr = currentUserIdForSelection.toString();

    // Filter slots owned by current user that don't have artwork assigned yet
    const availableUserSlots = Object.entries(slotOwnerMap)
      .filter(([slotId, userId]) => userId.toString() === currentUserIdStr && !slotArtworkMap[Number(slotId)])
      .map(([slotId]) => Number(slotId));

    if (selectedArtworks.includes(artworkId)) {
      toast.error("Artwork already selected", {
        description: "This artwork has already been assigned to a slot.",
        closeButton: true,
      });
      return;
    }

    const availableSlot = availableUserSlots[0];

    if (!availableSlot) {
      toast.error("No available slots", {
        description: "You don't have any available slots for more artwork.",
        closeButton: true,
      });
      return;
    }

    setSlotArtworkMap((prev) => ({
      ...prev,
      [availableSlot]: artworkId,
    }));

    if (!selectedSlots.includes(availableSlot)) {
      setSelectedSlots((prev) => [...prev, availableSlot]);
    }

    setSelectedArtworks((prev) => [...prev, artworkId]);
  };

  // Handle slot selection - ORIGINAL LOGIC
  const handleSlotSelect = (slotId: number) => {
    const currentUserIdForSelection =
      currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id);
    if (!currentUserIdForSelection) return;

    if (slotOwnerMap[slotId] !== currentUserIdForSelection.toString()) {
      toast.error("Access denied", {
        description: "This slot is assigned to another participant.",
        closeButton: true,
      });
      return;
    }

    // If slot is already selected, toggle it off
    if (selectedSlots.includes(slotId)) {
      const newSlotArtworkMap = { ...slotArtworkMap };
      const artworkId = newSlotArtworkMap[slotId];

      if (artworkId) {
        setSelectedArtworks((prev) => prev.filter((id) => id !== artworkId));
        delete newSlotArtworkMap[slotId];
        setSlotArtworkMap(newSlotArtworkMap);
      }

      setSelectedSlots((prev) => prev.filter((id) => id !== slotId));
    } else {
      setSelectedSlots((prev) => [...prev, slotId]);
    }
  };

  // Handle clearing a slot - ORIGINAL LOGIC
  const handleClearSlot = (slotId: number) => {
    const currentUserIdForSelection =
      currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id);
    if (!currentUserIdForSelection) return;

    if (slotOwnerMap[slotId] !== currentUserIdForSelection.toString()) {
      return;
    }

    const artworkId = slotArtworkMap[slotId];
    if (artworkId) {
      setSelectedArtworks((prev) => prev.filter((id) => id !== artworkId));

      const newSlotArtworkMap = { ...slotArtworkMap };
      delete newSlotArtworkMap[slotId];
      setSlotArtworkMap(newSlotArtworkMap);
    }
  };

  // Handle environment change - ORIGINAL LOGIC
  const handleEnvironmentChange = (envId: number) => {
    const selectedEnv = environments.find((env) => env.id === envId);

    if (!selectedEnv) return;

    // Check if current collaborators exceed the limit for the new environment
    let maxAllowedCollaborators = 0;
    if (selectedEnv.slots === 4) {
      maxAllowedCollaborators = 1;
    } else if (selectedEnv.slots === 6) {
      maxAllowedCollaborators = 2;
    } else if (selectedEnv.slots === 10) {
      maxAllowedCollaborators = 2;
    }

    if (collaborators.length > maxAllowedCollaborators) {
      toast.error("Too many collaborators for this environment", {
        description: `This environment only supports ${maxAllowedCollaborators} collaborator${
          maxAllowedCollaborators > 1 ? "s" : ""
        }. Please remove some collaborators first.`,
        duration: 4000,
        closeButton: true,
      });
      return;
    }

    setSelectedEnvironment(envId);
    // setBannerImage(selectedEnv.image)
    setBannerFile(null);

    // Call distributeSlots immediately with new environment
    distributeSlots(envId, collaborators, exhibitType);
  };

  // Load exhibit data based on exhibitId and mode
  useEffect(() => {
    if (exhibitId && mockExhibitData[Number(exhibitId)]) {
      const exhibitData = mockExhibitData[Number(exhibitId)];

      if (mode === "review") {
        setViewMode("review");
        setIsReadOnly(true);
      } else if (mode === "monitoring") {
        setViewMode("monitoring");
        setIsReadOnly(true);
      } else if (mode === "preview") {
        setViewMode("preview");
        setIsReadOnly(true);
      }

      // Populate form with exhibit data
      setTitle(exhibitData.title);
      setCategory(exhibitData.category);
      setArtworkStyle(exhibitData.artworkStyle.toLowerCase());
      setExhibitType(exhibitData.exhibitType);
      setStartDate(exhibitData.startDate);
      setEndDate(exhibitData.endDate);
      setDescription(exhibitData.description);
      setSelectedEnvironment(exhibitData.selectedEnvironment);
      setBannerImage(exhibitData.bannerImage);
      setCollaborators(exhibitData.collaborators);
      setSlotOwnerMap(exhibitData.slotOwnerMap);
      setSlotArtworkMap(exhibitData.slotArtworkMap);

      // Mark selected artworks
      const selectedIds = Object.values(exhibitData.slotArtworkMap) as string[];
      setSelectedArtworks(selectedIds);

      // Mark selected slots
      const selectedSlotIds = Object.keys(exhibitData.slotArtworkMap).map(Number);
      setSelectedSlots(selectedSlotIds);
    } else {
      // For demo purposes: toggle collaborator view
      const urlParams = new URLSearchParams(window.location.search);
      const collaboratorId = urlParams.get("collaborator");

      if (collaboratorId) {
        const collab = collaborators.find((c) => c.id.toString() === collaboratorId);

        if (collab) {
          setViewMode("collaborator");
          setCurrentCollaborator(collab);
        }
      }
    }
  }, [exhibitId, mode, collaborators]);

  useEffect(() => {
    if (selectedEnvironment) {
      distributeSlots();
    }
  }, [selectedEnvironment, exhibitType, collaborators]);

  const createExhibitMutation = useCreateExhibit();

  // Create handlers
  const submitHandlers = createSubmitHandler(
    navigate,
    createExhibitMutation,
    viewMode,
    exhibitType,
    collaborators,
    setShowNotificationDialog,
    title,
    artworkStyle,
    description,
    currentUserId,
    startDate,
    endDate,
    selectedEnvironment,
    selectedArtworks,
    bannerFile,
    slotArtworkMap,
    slotOwnerMap,
    undefined, // No exhibit ID for new exhibits
    null // No existing banner image for new exhibits
  );

  // Handle adding a collaborator - ORIGINAL LOGIC
  const handleAddCollaborator = (artist: User) => {
    // Check global maximum first (2 collaborators max)
    if (collaborators.length >= 2) {
      toast.error("Maximum collaborators reached", {
        description: "You can only have a maximum of 2 collaborators per exhibit.",
        closeButton: true,
      });
      return;
    }

    // Get maximum collaborators allowed based on environment
    const currentEnvironment = environments.find((env) => env.id === selectedEnvironment);
    let maxCollaborators = 0;

    if (currentEnvironment) {
      if (currentEnvironment.slots === 4) {
        maxCollaborators = 1; // 4 slots can handle 1 collaborator (2-2 distribution)
      } else if (currentEnvironment.slots === 6) {
        maxCollaborators = 1; // 6 slots can handle 1 collaborator (3-3 distribution)
      } else if (currentEnvironment.slots === 10) {
        maxCollaborators = 2; // 10 slots can handle 2 collaborators (4-3-3 distribution)
      }
    }

    const newCollaborators = [...collaborators, artist];
    const newCollaboratorCount = newCollaborators.length;

    // Check if current environment can accommodate the new collaborator count
    let newEnvironmentId = selectedEnvironment;
    if (newCollaboratorCount > maxCollaborators) {
      if (newCollaboratorCount === 1) {
        // Adding 1st collaborator - check if current environment can handle 2 participants
        if (currentEnvironment?.slots === 4) {
          // 4 slots can handle 2 participants (2-2 distribution), no need to switch
          newEnvironmentId = selectedEnvironment;
        }
      } else if (newCollaboratorCount === 2) {
        // Adding 2nd collaborator - need environment that supports 3 participants
        if (currentEnvironment?.slots === 4) {
          // Switch from 4 slots to 6 slots (4 slots can't handle 3 participants)
          newEnvironmentId = environments.find((env) => env.slots === 6)?.id || selectedEnvironment;
        } else if (currentEnvironment?.slots === 6) {
          // Switch from 6 slots to 10 slots (need more slots for 3 participants)
          newEnvironmentId = environments.find((env) => env.slots === 10)?.id || selectedEnvironment;
        }
      }

      // Show confirmation dialog for environment change
      if (newEnvironmentId !== selectedEnvironment) {
        const newEnv = environments.find((env) => env.id === newEnvironmentId);
        const confirmChange = window.confirm(
          `Adding this collaborator requires switching to the ${newEnv?.slots} slots environment. This will redistribute all slots among participants. Continue?`
        );

        if (!confirmChange) {
          return;
        }

        // Update environment
        setSelectedEnvironment(newEnvironmentId);
      }
    }

    // Add the collaborator
    setCollaborators(newCollaborators);

    // Call distributeSlots with the updated environment and collaborator list
    distributeSlots(newEnvironmentId || selectedEnvironment, newCollaborators, exhibitType);
  };

  // Handle removing a collaborator - ORIGINAL LOGIC
  const handleRemoveCollaborator = (artist: User) => {
    setCollaboratorToRemove(artist);
    setIsRemoveCollaboratorDialogOpen(true);
  };

  const confirmRemoveCollaborator = () => {
    if (!collaboratorToRemove) return;

    const newCollaborators = collaborators.filter((c) => c.id !== collaboratorToRemove.id);
    setCollaborators(newCollaborators);

    setIsRemoveCollaboratorDialogOpen(false);
    setCollaboratorToRemove(null);

    // Call distributeSlots immediately with updated collaborator list
    distributeSlots(selectedEnvironment, newCollaborators, exhibitType);
  };
  const isUploading = createExhibitMutation.status === "pending";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-1 pt-20 max-w-6xl pb-4">
        <div className="mb-3">
          <button onClick={() => navigate(-1)} className="flex items-center text-xs font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            Go back
          </button>
        </div>

        {/* Special mode notice bar */}
        <ModeStatusDisplay
          viewMode={viewMode}
          collaborators={collaborators}
          getCollaboratorSubmissionStatus={(collaboratorId: string) =>
            getCollaboratorSubmissionStatus(collaboratorId, slotOwnerMap, slotArtworkMap)
          }
        />

        {/* Collaborator View Notice */}
        <CollaboratorNotice viewMode={viewMode} currentCollaborator={currentCollaborator} title={title} />

        <form onSubmit={submitHandlers.handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Banner upload and environment */}
            <div>
              <BannerUpload
                bannerImage={bannerImage}
                setBannerImage={setBannerImage}
                setBannerFile={setBannerFile}
                isReadOnly={isReadOnly}
                viewMode={viewMode}
              />

              <div className="space-y-6">
                <EnvironmentSelector
                  environments={environments}
                  selectedEnvironment={selectedEnvironment}
                  handleEnvironmentChange={handleEnvironmentChange}
                  viewMode={viewMode}
                  isReadOnly={isReadOnly}
                  collaboratorCount={collaborators.length}
                />

                {/* Display available slots only if an environment is selected */}
                {selectedEnvironment && (
                  <ExhibitSlots
                    selectedEnvironment={selectedEnvironment}
                    environments={environments}
                    slotOwnerMap={slotOwnerMap}
                    slotArtworkMap={slotArtworkMap}
                    artworks={filteredArtworks}
                    exhibitType={exhibitType}
                    selectedSlots={selectedSlots}
                    handleSlotSelect={handleSlotSelect}
                    handleClearSlot={handleClearSlot}
                    canInteractWithSlot={(slotId: number) =>
                      canInteractWithSlot(slotId, isReadOnly, slotOwnerMap, viewMode, currentUser, currentCollaborator)
                    }
                    getUserName={(userId: string) => getUserName(userId, currentUser, collaborators)}
                    getSlotColor={(slotId: number) =>
                      getSlotColor(slotId, exhibitType, slotOwnerMap, currentUser, collaborators)
                    }
                    collaborators={collaborators}
                    currentUser={currentUser}
                    colorNames={colorNames}
                    slotColorSchemes={slotColorSchemes}
                  />
                )}

                {/* PREVIEW BUTTON */}
                {selectedEnvironment === 3 && !isReadOnly && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      className="bg-gray-900 text-white text-xs px-4 py-1.5 rounded-full hover:bg-gray-800"
                      onClick={() => {
                        const encodedSlotMap = encodeURIComponent(JSON.stringify(slotArtworkMap));
                        const encodedArtworks = encodeURIComponent(
                          JSON.stringify(
                            artworks
                              .filter((a) => selectedArtworks.includes(a.id.toString()))
                              .map((a) => ({
                                id: a.id.toString(),
                                image_url: a.image_url,
                                title: a.title || "Untitled",
                                artist: a.artist || "Unknown",
                              }))
                          )
                        );

                        navigate(`/gallery3d-preview?slotMap=${encodedSlotMap}&artworks=${encodedArtworks}`);
                      }}
                    >
                      Preview in 3D View
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Opens your current selections in an interactive virtual gallery.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Form fields */}
            <ExhibitFormFields
              title={title}
              setTitle={setTitle}
              category={category}
              setCategory={setCategory}
              artworkStyle={artworkStyle}
              setArtworkStyle={setArtworkStyle}
              exhibitType={exhibitType}
              handleExhibitTypeChange={(value) => {
                setExhibitType(value);
                const newCollaborators = value === "solo" ? [] : collaborators;
                if (value === "solo") {
                  setCollaborators([]);
                }
                // Call distributeSlots immediately with new exhibit type
                distributeSlots(selectedEnvironment, newCollaborators, value);
              }}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              description={description}
              setDescription={setDescription}
              collaborators={collaborators}
              viewMode={viewMode}
              isReadOnly={isReadOnly}
              onAddCollaborator={() => setIsAddArtistDialogOpen(true)}
              onRemoveCollaborator={handleRemoveCollaborator}
              getCollaboratorSubmissionStatus={(collaboratorId: string) =>
                getCollaboratorSubmissionStatus(collaboratorId, slotOwnerMap, slotArtworkMap)
              }
              currentCollaborator={currentCollaborator}
            />
          </div>

          {/* Artwork selection section - Only show if an environment is selected */}
          {selectedEnvironment && !isReadOnly && (
            <ArtworkSelector
              artworks={filteredArtworks}
              selectedArtworks={selectedArtworks}
              handleArtworkSelect={handleArtworkSelect}
              currentCollaborator={currentCollaborator}
              viewMode={viewMode}
            />
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="bg-red-700 hover:bg-red-600 text-white text-[10px] px-8 py-1.5 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploading
                ? "Submitting..."
                : viewMode === "collaborator"
                ? "Save Selections"
                : viewMode === "review" || viewMode === "monitoring" || viewMode === "preview"
                ? "Back to Exhibits"
                : "Publish Exhibit"}
            </button>
          </div>
        </form>
      </div>

      {/* Add Artist Dialog */}
      <AddArtistDialog
        open={isAddArtistDialogOpen}
        onOpenChange={setIsAddArtistDialogOpen}
        onSelect={handleAddCollaborator}
        selectedArtists={collaborators}
      />

      {/* Exhibit Dialogs */}
      <ExhibitDialogs
        isRemoveCollaboratorDialogOpen={isRemoveCollaboratorDialogOpen}
        setIsRemoveCollaboratorDialogOpen={setIsRemoveCollaboratorDialogOpen}
        collaboratorToRemove={collaboratorToRemove}
        confirmRemoveCollaborator={confirmRemoveCollaborator}
        showNotificationDialog={showNotificationDialog}
        setShowNotificationDialog={setShowNotificationDialog}
        sendNotificationsToCollaborators={submitHandlers.sendNotificationsToCollaborators}
        collaborators={collaborators}
      />
    </div>
  );
};

export default AddExhibit;
