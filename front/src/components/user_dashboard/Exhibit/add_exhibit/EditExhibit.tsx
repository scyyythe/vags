import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddArtistDialog from "@/components/user_dashboard/Exhibit/add_exhibit/components/AddArtistDialog";
import Header from "@/components/user_dashboard/navbar/Header";
import { useUpdateExhibit } from "@/hooks/mutate/exhibit/useUpdateExhibit";
import BannerUpload from "./components/BannerUpload";
import EnvironmentSelector from "./components/EnvironmentSelector";
import ExhibitSlots from "./components/ExhibitSlots";
import ExhibitFormFields from "./components/ExhibitFormFields";
import ArtworkSelector from "./components/ArtworkSelector";
import ModeStatusDisplay from "./components/ModeStatusDisplay";
import CollaboratorNotice from "./components/CollaboratorNotice";
import ExhibitDialogs from "./components/ExhibitDialogs";
import EnvironmentChangeDialog from "./components/EnvironmentChangeDialog";
import CollaboratorEnvironmentDialog from "./components/CollaboratorEnvironmentDialog";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import { getLoggedInUserId } from "@/auth/decode";
import type { ViewMode } from "./components/types";
import useUserQuery from "@/hooks/users/useUserQuery";
import type { User } from "@/hooks/users/useUserQuery";
import { useCreateExhibit } from "@/hooks/mutate/exhibit/AddExhibit";
import { useQueryClient } from "@tanstack/react-query";
import { slotColorSchemes, colorNames } from "@/components/constants/slot-color-schemes";
import { mockExhibitData } from "@/components/data/mock-exhibit-data";
import { environments } from "@/components/data/environments-data";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import {
  getSlotColor,
  getUserName,
  canInteractWithSlot,
  getCollaboratorSubmissionStatus,
} from "@/utils/exhibit-helpers";
import { createSubmitHandler } from "@/components/handlers/submit-handlers";
import apiClient from "@/utils/apiClient";
import { useExhibitCardDetail } from "@/hooks/exhibit/useCardDetail";
const EditExhibit = () => {
  const navigate = useNavigate();
  const { id: exhibitId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode") || "";
  const updateExhibitMutation = useUpdateExhibit(exhibitId!);
  const queryClient = useQueryClient();
  const { data: exhibitData, isError } = useExhibitCardDetail(exhibitId);
  // --- States ---
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
  const [viewMode, setViewMode] = useState<ViewMode>("owner");
  const [currentCollaborator, setCurrentCollaborator] = useState<User | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showEnvironmentChangeDialog, setShowEnvironmentChangeDialog] = useState(false);
  const [pendingEnvironmentChange, setPendingEnvironmentChange] = useState<number | null>(null);
  const [showCollaboratorEnvironmentDialog, setShowCollaboratorEnvironmentDialog] = useState(false);
  const [pendingCollaboratorAddition, setPendingCollaboratorAddition] = useState<{
    artist: User;
    newEnvironmentId: number;
  } | null>(null);

  const [artworkFiles, setArtworkFiles] = useState<{ id: string; url: string; file?: File }[]>([]);

  const currentUserId = getLoggedInUserId();
  const { data: artworks = [] } = useArtworks(
    1,
    currentUserId ?? undefined,
    !!currentUserId,
    "created-by-me",
    "public",
    true
  );

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

  const createExhibitMutation = useCreateExhibit();

  // Function to distribute slots among participants
  const distributeSlots = (envId?: number, collabList?: User[], exhibitTypeParam?: string) => {
    const environmentId = envId || selectedEnvironment;
    const collaboratorList = collabList || collaborators;
    const currentExhibitType = exhibitTypeParam || exhibitType;

    if (!environmentId || !currentUser?.id) return;

    const currentEnvironment = environments.find((env) => env.id === environmentId);
    if (!currentEnvironment) return;

    const totalSlots = currentEnvironment.slots;

    // In edit mode, preserve existing artworks and only redistribute empty slots
    if (mode !== "edit") {
      setSelectedSlots([]);
      setSelectedArtworks([]);
      setSlotArtworkMap({});
    }

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

    // In edit mode, preserve existing artworks when redistributing slots
    if (mode === "edit") {
      // Create a mapping of existing artworks to their owners
      const existingArtworkOwners: Record<string, string> = {};
      Object.entries(slotArtworkMap).forEach(([slotId, artworkId]) => {
        const ownerId = slotOwnerMap[Number(slotId)];
        if (ownerId) {
          existingArtworkOwners[artworkId] = ownerId;
        }
      });

      // Create new slot artwork map preserving existing artworks
      const newSlotArtworkMap: Record<number, string> = {};
      const newSelectedSlots: number[] = [];
      const newSelectedArtworks: string[] = [];

      // First, assign existing artworks to their owners in the new distribution
      Object.entries(existingArtworkOwners).forEach(([artworkId, ownerId]) => {
        // Find an available slot for this owner
        const availableSlot = Object.entries(newSlotOwnerMap).find(
          ([slotId, slotOwnerId]) => slotOwnerId === ownerId && !newSlotArtworkMap[Number(slotId)]
        );

        if (availableSlot) {
          const slotId = Number(availableSlot[0]);
          newSlotArtworkMap[slotId] = artworkId;
          newSelectedSlots.push(slotId);
          newSelectedArtworks.push(artworkId);
        }
      });

      // Update the state with preserved artworks
      setSlotArtworkMap(newSlotArtworkMap);
      setSelectedSlots(newSelectedSlots);
      setSelectedArtworks(newSelectedArtworks);
    }

    setSlotOwnerMap(newSlotOwnerMap);
  };

  useEffect(() => {
    if (!exhibitData) return;
    // --- Basic exhibit info ---
    setTitle(exhibitData.title);
    setCategory(exhibitData.category);
    setExhibitType(exhibitData.isSolo ? "solo" : "collab");
    setStartDate(exhibitData.startDate?.split("T")[0] || "");
    setEndDate(exhibitData.endDate?.split("T")[0] || "");
    setDescription(exhibitData.description);
    setBannerImage(exhibitData.image);
    // Set artwork style - check both category and artworkStyle fields
    if (exhibitData.artworkStyle) {
      setArtworkStyle(exhibitData.artworkStyle);
    } else if (exhibitData.category) {
      setArtworkStyle(exhibitData.category);
    }

    // --- Populate collaborators if not solo ---
    if (!exhibitData.isSolo && exhibitData.collaborators?.length) {
      setCollaborators(
        exhibitData.collaborators.map((c: any) => ({
          id: c.id,
          first_name: c.name.split(" ")[0] || "",
          last_name: c.name.split(" ").slice(1).join(" ") || "",
          profile_picture: c.avatar || "",
        }))
      );
    } else {
      setCollaborators([]);
    }

    // --- Artworks & slots ---
    const mapFromBackend: Record<number, string> = exhibitData.slotArtworkMap || {};
    setSlotArtworkMap(mapFromBackend);
    setSelectedSlots(Object.keys(mapFromBackend).map(Number));
    setSelectedArtworks(Object.values(mapFromBackend));

    // --- Determine slot owners ---
    const totalSlots = Object.keys(mapFromBackend).length;
    const newSlotOwnerMap: Record<number, string> = {};

    if (exhibitData.isSolo && exhibitData.ownerId) {
      // Solo: all slots belong to owner
      Object.keys(mapFromBackend).forEach((slotId) => {
        newSlotOwnerMap[Number(slotId)] = exhibitData.ownerId!;
      });
    } else if (!exhibitData.isSolo) {
      // Collaborative: distribute slots among owner + collaborators
      const participants = [exhibitData.owner, ...(exhibitData.collaborators || [])];
      const totalParticipants = participants.length;
      const baseSlots = Math.floor(totalSlots / totalParticipants);
      let remaining = totalSlots % totalParticipants;
      let slotId = 1;

      for (const participant of participants) {
        let slotsForThisUser = baseSlots + (remaining > 0 ? 1 : 0);
        if (remaining > 0) remaining--;
        for (let j = 0; j < slotsForThisUser; j++) {
          if (slotId <= totalSlots) newSlotOwnerMap[slotId++] = participant.id.toString();
        }
      }
    }

    setSlotOwnerMap(newSlotOwnerMap);

    // --- Environment ---
    if (exhibitData.environmentId) {
      setSelectedEnvironment(exhibitData.environmentId);
    } else {
      const matchedEnv = environments.find((env) => env.slots === totalSlots);
      if (matchedEnv) setSelectedEnvironment(matchedEnv.id);
    }

    // --- Read-only mode ---
    setIsReadOnly(["review", "monitoring", "preview"].includes(mode));

    // --- Populate artwork files ---
    if (exhibitData.artworks && exhibitData.artworks.length > 0) {
      const artworksWithUrl = exhibitData.artworks.map((a: any) => ({
        id: a.id.toString(),
        url: Array.isArray(a.image_url) ? a.image_url[0] : a.image_url || a.file || a.image || "",
      }));
      setArtworkFiles(artworksWithUrl);
    }
  }, [exhibitData, mode]);

  const artworkFileObjects: Artwork[] = artworkFiles.map((a) => ({
    id: a.id.toString(),
    artworkImage: a.url,
    image_url: a.url, // alias if ExhibitSlots uses it
    title: "Untitled",
    artistName: currentUser?.first_name + " " + (currentUser?.last_name || ""),
    profile_picture: currentUser?.profile_picture || "",
    artist_id: currentUser?.id?.toString() || "",
    artistId: currentUser?.id?.toString() || "",
    artist: currentUser?.first_name || "Unknown",
    description: "",
    category: "",
    medium: "",
    size: "",
    status: "Draft",
    art_status: "Draft",
    price: 0,
    visibility: "Public",
    created_at: new Date().toISOString(),
    likes_count: 0,
    likesCount: 0,
    artistImage: currentUser?.profile_picture || "",
    style: "",
    datePosted: new Date().toLocaleDateString("en-US"),
    isShared: false,
    default_paypal_email: "",
  }));

  // Filter out artworks without valid images from artworkFileObjects
  const validArtworkFileObjects = artworkFileObjects.filter(
    (artwork) => artwork.artworkImage && artwork.artworkImage.trim() !== ""
  );

  // Put exhibit artworks first so they never get lost when `artworks` refetches
  const mergedArtworks: Artwork[] = [...validArtworkFileObjects, ...filteredArtworks];

  // Deduplicate and ensure all artworks have valid images
  const uniqueMergedArtworks: Artwork[] = mergedArtworks
    .filter((a, index, self) => index === self.findIndex((b) => b.id === a.id))
    .filter((artwork) => artwork.artworkImage && artwork.artworkImage.trim() !== "");

  // --- Redistribute slots if environment or collaborators change ---
  useEffect(() => {
    if (selectedEnvironment) {
      distributeSlots();
    }
  }, [selectedEnvironment, exhibitType, collaborators]);

  // --- Submit handler ---
  const submitHandlers = createSubmitHandler(
    navigate,
    updateExhibitMutation,
    viewMode,
    exhibitType,
    collaborators,
    undefined, // setShowNotificationDialog not needed for edit mode
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
    queryClient, // Add queryClient
    exhibitId, // Pass exhibit ID to detect edit mode
    bannerImage // Pass existing banner image for edit mode
  );

  // Handle adding a collaborator - ENHANCED LOGIC FOR EDIT MODE
  const handleAddCollaborator = (artist: User) => {
    // Check global maximum first (2 collaborators max)
    if (collaborators.length >= 2) {
      toast.error("Maximum collaborators reached", {
        description: "You can only have a maximum of 2 collaborators per exhibit.",
        closeButton: true,
      });
      return;
    }

    const newCollaborators = [...collaborators, artist];
    const newCollaboratorCount = newCollaborators.length;

    // Check if current environment can accommodate the new collaborator count
    const currentEnvironment = environments.find((env) => env.id === selectedEnvironment);
    let maxCollaboratorsForCurrentEnv = 0;

    if (currentEnvironment) {
      if (currentEnvironment.slots === 4) {
        maxCollaboratorsForCurrentEnv = 1; // 4 slots can handle 1 collaborator (2-2 distribution)
      } else if (currentEnvironment.slots === 6) {
        maxCollaboratorsForCurrentEnv = 1; // 6 slots can handle 1 collaborator (3-3 distribution)
      } else if (currentEnvironment.slots === 10) {
        maxCollaboratorsForCurrentEnv = 2; // 10 slots can handle 2 collaborators (4-3-3 distribution)
      }
    }

    // If current environment can't accommodate, find the next suitable environment
    let newEnvironmentId = selectedEnvironment;
    if (newCollaboratorCount > maxCollaboratorsForCurrentEnv) {
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
        // Store the pending collaborator addition and show dialog
        setPendingCollaboratorAddition({
          artist,
          newEnvironmentId,
        });
        setShowCollaboratorEnvironmentDialog(true);
        return; // Don't proceed yet, wait for dialog confirmation
      }
    }

    // Check final validation
    const finalEnvironment = environments.find((env) => env.id === (newEnvironmentId || selectedEnvironment));
    let finalMaxCollaborators = 0;

    if (finalEnvironment) {
      if (finalEnvironment.slots === 4) {
        finalMaxCollaborators = 1; // 4 slots can handle 1 collaborator (2-2 distribution)
      } else if (finalEnvironment.slots === 6) {
        finalMaxCollaborators = 1; // 6 slots can handle 1 collaborator (3-3 distribution)
      } else if (finalEnvironment.slots === 10) {
        finalMaxCollaborators = 2; // 10 slots can handle 2 collaborators (4-3-3 distribution)
      }
    }

    if (newCollaboratorCount > finalMaxCollaborators) {
      toast.error("Maximum collaborators exceeded", {
        description: `The ${
          finalEnvironment?.slots
        } slots environment only supports ${finalMaxCollaborators} collaborator${
          finalMaxCollaborators > 1 ? "s" : ""
        }. Cannot add more collaborators.`,
        closeButton: true,
      });
      return;
    }

    // Add the collaborator
    setCollaborators(newCollaborators);

    // Call distributeSlots with the updated environment and collaborator list
    distributeSlots(newEnvironmentId || selectedEnvironment, newCollaborators, exhibitType);

    // Show notification about exhibit status change
    toast.success("Collaborator Added", {
      description: "The exhibit status has been set to Pending. All collaborators will be notified about the changes.",
      duration: 5000,
      closeButton: true,
    });
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

  const isUploading = updateExhibitMutation.status === "pending";

  // Check if there are submitted artworks (for environment change validation)
  const hasSubmittedArtworks = Object.keys(slotArtworkMap).length > 0;

  // Handle environment change dialog
  const handleEnvironmentChangeConfirm = () => {
    if (pendingEnvironmentChange === null) return;

    const selectedEnv = environments.find((env) => env.id === pendingEnvironmentChange);
    if (!selectedEnv) return;

    // Check if current collaborators exceed the limit for the new environment
    let maxAllowedCollaborators = 0;
    if (selectedEnv.slots === 4) {
      maxAllowedCollaborators = 1; // 4 slots can handle 1 collaborator (2-2 distribution)
    } else if (selectedEnv.slots === 6) {
      maxAllowedCollaborators = 1; // 6 slots can handle 1 collaborator (3-3 distribution)
    } else if (selectedEnv.slots === 10) {
      maxAllowedCollaborators = 2; // 10 slots can handle 2 collaborators (4-3-3 distribution)
    }

    if (collaborators.length > maxAllowedCollaborators) {
      toast.error("Too many collaborators for this environment", {
        description: `This environment only supports ${maxAllowedCollaborators} collaborator${
          maxAllowedCollaborators > 1 ? "s" : ""
        }. Please remove some collaborators first.`,
        duration: 4000,
        closeButton: true,
      });
      setShowEnvironmentChangeDialog(false);
      setPendingEnvironmentChange(null);
      return;
    }

    // Check for downgrade with submitted artworks - but only if the new environment can't accommodate current collaborators
    const currentEnv = environments.find((env) => env.id === selectedEnvironment);
    const isDowngrade = currentEnv && selectedEnv.slots < currentEnv.slots;

    if (isDowngrade && hasSubmittedArtworks) {
      // Check if the new environment can still accommodate current collaborators
      let canAccommodateInNewEnv = false;
      if (selectedEnv.slots === 4 && collaborators.length <= 1) {
        canAccommodateInNewEnv = true; // 4 slots can handle 1 collaborator (2-2 distribution)
      } else if (selectedEnv.slots === 6 && collaborators.length <= 1) {
        canAccommodateInNewEnv = true; // 6 slots can handle 1 collaborator (3-3 distribution)
      } else if (selectedEnv.slots === 10 && collaborators.length <= 2) {
        canAccommodateInNewEnv = true; // 10 slots can handle 2 collaborators (4-3-3 distribution)
      }

      if (!canAccommodateInNewEnv) {
        toast.error("Cannot downgrade environment", {
          description:
            "Cannot switch to a smaller environment that cannot accommodate your current collaborators. Please remove some collaborators first.",
          duration: 4000,
          closeButton: true,
        });
        setShowEnvironmentChangeDialog(false);
        setPendingEnvironmentChange(null);
        return;
      }
    }

    // Proceed with environment change
    setSelectedEnvironment(pendingEnvironmentChange);
    setBannerFile(null);

    // Call distributeSlots immediately with new environment
    distributeSlots(pendingEnvironmentChange, collaborators, exhibitType);

    // Show notification about exhibit status change if there are collaborators
    if (collaborators.length > 0) {
      toast.success("Environment Changed", {
        description:
          "The exhibit status has been set to Pending. All collaborators will be notified about the changes.",
        duration: 5000,
        closeButton: true,
      });
    }

    // Close dialog and reset state
    setShowEnvironmentChangeDialog(false);
    setPendingEnvironmentChange(null);
  };

  const handleEnvironmentChangeCancel = () => {
    setShowEnvironmentChangeDialog(false);
    setPendingEnvironmentChange(null);
  };

  // Handle collaborator environment dialog
  const handleCollaboratorEnvironmentConfirm = () => {
    if (!pendingCollaboratorAddition) return;

    const { artist, newEnvironmentId } = pendingCollaboratorAddition;
    const newCollaborators = [...collaborators, artist];

    // Update environment
    setSelectedEnvironment(newEnvironmentId);

    // Add the collaborator
    setCollaborators(newCollaborators);

    // Call distributeSlots with the updated environment and collaborator list
    distributeSlots(newEnvironmentId, newCollaborators, exhibitType);

    // Close dialog and reset state
    setShowCollaboratorEnvironmentDialog(false);
    setPendingCollaboratorAddition(null);
  };

  const handleCollaboratorEnvironmentCancel = () => {
    setShowCollaboratorEnvironmentDialog(false);
    setPendingCollaboratorAddition(null);
  };

  // --- The rest of your component stays 100% intact ---
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-1 pt-20 max-w-6xl pb-4">
        {/* Back button */}
        <div className="mb-3">
          <button onClick={() => navigate(-1)} className="flex items-center text-xs font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            Go back
          </button>
        </div>

        <ModeStatusDisplay
          viewMode={viewMode}
          collaborators={collaborators}
          getCollaboratorSubmissionStatus={(collaboratorId: string) =>
            getCollaboratorSubmissionStatus(collaboratorId, slotOwnerMap, slotArtworkMap)
          }
        />

        <CollaboratorNotice viewMode={viewMode} currentCollaborator={currentCollaborator} title={title} />

        <form
          onSubmit={(e) => {
            console.log("📝 Form onSubmit triggered!");
            submitHandlers.handleSubmit(e);
          }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
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
                  handleEnvironmentChange={(envId) => {
                    const selectedEnv = environments.find((env) => env.id === envId);

                    if (!selectedEnv) return;

                    // Store the pending environment change and show dialog
                    setPendingEnvironmentChange(envId);
                    setShowEnvironmentChangeDialog(true);
                  }}
                  viewMode={viewMode}
                  isReadOnly={isReadOnly}
                  collaboratorCount={collaborators.length}
                />
                {selectedEnvironment && (
                  <ExhibitSlots
                    selectedEnvironment={selectedEnvironment}
                    environments={environments}
                    exhibitArtworks={exhibitData.artworks}
                    slotOwnerMap={slotOwnerMap}
                    slotArtworkMap={slotArtworkMap}
                    artworks={uniqueMergedArtworks}
                    exhibitType={exhibitType}
                    selectedSlots={selectedSlots}
                    handleSlotSelect={(slotId) => {
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
                    }}
                    handleClearSlot={(slotId) => {
                      const currentUserIdForSelection =
                        currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id);
                      if (!currentUserIdForSelection) return;

                      // Only allow clearing slots that belong to the current user
                      if (slotOwnerMap[slotId] !== currentUserIdForSelection.toString()) {
                        toast.error("Access denied", {
                          description: "You can only remove artworks from your own slots.",
                          closeButton: true,
                        });
                        return;
                      }

                      const artworkId = slotArtworkMap[slotId];
                      if (artworkId) {
                        setSelectedArtworks((prev) => prev.filter((id) => id !== artworkId));

                        const newSlotArtworkMap = { ...slotArtworkMap };
                        delete newSlotArtworkMap[slotId];
                        setSlotArtworkMap(newSlotArtworkMap);
                      }
                    }}
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
                    mode={exhibitData ? "edit" : "create"}
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
                            uniqueMergedArtworks
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

            {/* Right column */}
            <ExhibitFormFields
              title={title}
              setTitle={setTitle}
              category={category}
              setCategory={setCategory}
              artworkStyle={artworkStyle}
              setArtworkStyle={setArtworkStyle}
              exhibitType={exhibitType}
              handleExhibitTypeChange={(value) => {
                // Check if trying to change from solo to collaborative in edit mode
                if (exhibitData?.isSolo && value === "collab") {
                  toast.error("Cannot change exhibit type", {
                    description:
                      "Solo exhibits cannot be changed to collaborative exhibits. Please create a new exhibit for collaborative features.",
                    duration: 5000,
                    closeButton: true,
                  });
                  return;
                }

                setExhibitType(value);
                const newCollaborators = value === "solo" ? [] : collaborators;
                if (value === "solo") {
                  setCollaborators([]);
                }
                // Call distributeSlots immediately with new exhibit type
                distributeSlots(selectedEnvironment, newCollaborators, value);
              }}
              exhibitData={exhibitData}
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

          {selectedEnvironment && !isReadOnly && (
            <ArtworkSelector
              artworks={filteredArtworks}
              selectedArtworks={selectedArtworks}
              handleArtworkSelect={(artworkId: string) => {
                const currentUserIdForSelection =
                  currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id);
                if (!currentUserIdForSelection) return;

                const currentUserIdStr = currentUserIdForSelection.toString();

                // Filter slots owned by current user that don't have artwork assigned yet
                const availableUserSlots = Object.entries(slotOwnerMap)
                  .filter(
                    ([slotId, userId]) => userId.toString() === currentUserIdStr && !slotArtworkMap[Number(slotId)]
                  )
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
              }}
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

      <AddArtistDialog
        open={isAddArtistDialogOpen}
        onOpenChange={setIsAddArtistDialogOpen}
        onSelect={handleAddCollaborator}
        selectedArtists={collaborators}
      />

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

      <EnvironmentChangeDialog
        isOpen={showEnvironmentChangeDialog}
        onClose={handleEnvironmentChangeCancel}
        onConfirm={handleEnvironmentChangeConfirm}
        currentSlots={environments.find((env) => env.id === selectedEnvironment)?.slots || 0}
        newSlots={environments.find((env) => env.id === pendingEnvironmentChange)?.slots || 0}
        collaborators={collaborators}
        hasSubmittedArtworks={hasSubmittedArtworks}
      />

      <CollaboratorEnvironmentDialog
        isOpen={showCollaboratorEnvironmentDialog}
        onClose={handleCollaboratorEnvironmentCancel}
        onConfirm={handleCollaboratorEnvironmentConfirm}
        currentSlots={environments.find((env) => env.id === selectedEnvironment)?.slots || 0}
        newSlots={environments.find((env) => env.id === pendingCollaboratorAddition?.newEnvironmentId)?.slots || 0}
        collaboratorName={
          pendingCollaboratorAddition?.artist
            ? `${pendingCollaboratorAddition.artist.first_name} ${
                pendingCollaboratorAddition.artist.last_name || ""
              }`.trim()
            : ""
        }
        collaborators={collaborators}
        hasSubmittedArtworks={hasSubmittedArtworks}
      />
    </div>
  );
};

export default EditExhibit;
