import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AddArtistDialog from "@/components/user_dashboard/Exhibit/add_exhibit/components/AddArtistDialog";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import Gallery3D from "@/components/gallery/Gallery3D";
import { sendCollaboratorNotifications, showCollaboratorNotification } from "@/utils/notificationUtils";

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

import { Artist, ViewMode, Environment, Artwork, SubmissionStatus } from "./components/types";
import useUserQuery from "@/hooks/users/useUserQuery";
import { User } from "@/hooks/users/useUserQuery";

import { useCreateExhibit } from "@/hooks/mutate/exhibit/AddExhibit";
import { ExhibitPayload } from "@/hooks/mutate/exhibit/exhibit";
import { ToastT } from "sonner";

// Color schemes for slots by user
const slotColorSchemes = [
  "border-primary bg-primary/10",
  "border-[#9b87f5] bg-[#9b87f5]/10", 
  "border-[#7E69AB] bg-[#7E69AB]/10",
];

// Color names for clearer visual distinction
const colorNames = [
  "Dark Blue (Your slots)", 
  "Purple (First collaborator's slots)",
  "Dark Purple (Second collaborator's slots)",
];

// Mock data for demo populated exhibits
const mockExhibitData: Record<number, any> = {
  1: {
    title: "Urban Dreamscape",
    category: "Urban",
    artworkStyle: "Abstract",
    exhibitType: "collab",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    description: "A collaborative exploration of urban environments through an abstract lens.",
    selectedEnvironment: 2,
    bannerImage:
      "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",

    collaborators: [
      {
        id: 201,
        name: "Jane Artist",
        avatar:
          "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 202,
        name: "Sam Creator",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
    ],
    slotOwnerMap: {
      1: 100,
      2: 100, // Owner slots
      3: 201,
      4: 201, // First collaborator slots
      5: 202,
      6: 202, // Second collaborator slots
    },
    slotArtworkMap: {
      1: 1,
      2: 2, // Owner already placed artwork

      3: 3, // First collaborator placed one artwork
      // Second collaborator has not placed any artwork yet
    },
    status: "monitoring", // Can be "monitoring", "review", or "preview"
  },
  2: {
    title: "Nature's Symphony",
    category: "Nature",
    artworkStyle: "Impressionistic",
    exhibitType: "collab",
    startDate: "2025-07-15",
    endDate: "2025-08-01",
    description: "A celebration of natural beauty through impressionistic artworks.",
    selectedEnvironment: 1,
    bannerImage:
      "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",

    collaborators: [
      {
        id: 201,
        name: "Jane Artist",
        avatar:
          "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 203,
        name: "Alex Painter",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
    ],
    slotOwnerMap: {
      1: 100,
      2: 201,
      3: 201,
      4: 203,
    },
    slotArtworkMap: {
      1: 5,
      2: 6,
      3: 7,
    },
    status: "pending",
  },
  3: {
    title: "Abstract Visions",
    category: "Abstract",
    artworkStyle: "Modern",
    exhibitType: "collab",
    startDate: "2025-08-10",
    endDate: "2025-08-25",
    description: "Exploring modern abstract art through collaborative vision.",
    selectedEnvironment: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",

    collaborators: [
      {
        id: 202,
        name: "Sam Creator",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 203,
        name: "Alex Painter",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
    ],
    slotOwnerMap: {
      1: 100,
      2: 100,
      3: 100,
      4: 202,
      5: 202,
      6: 202,
      7: 203,
      8: 203,
      9: 203,
    },
    slotArtworkMap: {
      1: 8,
      2: 9,
      3: 10,
      4: 11,
      5: 12,
      6: 13,
      7: 14,
      8: 15,
      9: 16,
    },
    status: "ready",
  },
  4: {
    title: "Digital Renaissance",
    category: "Digital Art",
    artworkStyle: "Contemporary",
    exhibitType: "collab",
    startDate: "2025-09-01",
    endDate: "2025-09-15",
    description: "Rediscovering classical themes through digital mediums.",
    selectedEnvironment: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",

    collaborators: [
      {
        id: 201,
        name: "Jane Artist",
        avatar:
          "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 202,
        name: "Sam Creator",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 203,
        name: "Alex Painter",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
    ],
    slotOwnerMap: {
      1: 100,
      2: 100,
      3: 100,
      4: 201,
      5: 201,
      6: 202,
      7: 202,
      8: 203,
      9: 203,
    },
    slotArtworkMap: {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
    },
    status: "monitoring",
  },
};

const AddExhibit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const { data: currentUser, isLoading } = useUserQuery(currentUserId ?? "");
  useEffect(() => {
    console.log("Fetched artworks:", artworks);
  }, [artworks]);

  // Mock environments data with different slot capacities
  const environments: Environment[] = [
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
        '../../pics/slots-10.PNG',
      slots: 10,
    },
  ];

  // Load exhibit data based on exhibitId and mode
  useEffect(() => {
    if (exhibitId && mockExhibitData[Number(exhibitId)]) {
      const exhibitData = mockExhibitData[Number(exhibitId)];

      // Set view mode based on URL parameter
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

  // Function to distribute slots among participants
  const distributeSlots = () => {
    if (!selectedEnvironment || !currentUser?.id) return;

    const currentEnvironment = environments.find((env) => env.id === selectedEnvironment);
    if (!currentEnvironment) return;

    const totalSlots = currentEnvironment.slots;

    // Reset all related slot selections
    setSelectedSlots([]);
    setSelectedArtworks([]);
    setSlotArtworkMap({});

    const newSlotOwnerMap: Record<number, string> = {};

    if (exhibitType === "solo") {
      for (let i = 1; i <= totalSlots; i++) {
        newSlotOwnerMap[i] = currentUser.id.toString();
      }
    } else {
      // FIX: Include all collaborators, no slicing
      const participants = [currentUser, ...collaborators];
      const totalParticipants = participants.length;

      const baseSlots = Math.floor(totalSlots / totalParticipants);
      let remaining = totalSlots % totalParticipants;

      let slotId = 1;
      for (const participant of participants) {
        let slotsForThisUser = baseSlots;
        if (remaining > 0) {
          slotsForThisUser += 1;
          remaining--;
        }

        for (let j = 0; j < slotsForThisUser; j++) {
          if (slotId <= totalSlots) {
            newSlotOwnerMap[slotId] = participant.id.toString();
            slotId++;
          }
        }
      }
    }

    setSlotOwnerMap(newSlotOwnerMap);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (viewMode === "review" || viewMode === "monitoring" || viewMode === "preview") {
      // For review, monitoring, or preview mode - just return to exhibits page
      navigate("/exhibits");
      return;
    }

    // For regular solo exhibits or owner submitting collab exhibit
    if (viewMode === "owner") {
      // Check if this is a collaborative exhibit that needs to notify collaborators
      if (exhibitType === "collab" && collaborators.length > 0) {
        setShowNotificationDialog(true);
        return;
      }

      completeExhibitSubmission();
    } else if (viewMode === "collaborator") {
      toast({
        title: "Selections Saved",
        description: "Your artwork selections have been saved to the exhibit!",
      });

      navigate("/exhibits");
    }
  };
  const createExhibitMutation = useCreateExhibit();
  const completeExhibitSubmission = () => {
    const payload: ExhibitPayload = {
      title,
      category: artworkStyle,
      description,
      owner: currentUserId?.toString() ?? "",
      exhibit_type: exhibitType.charAt(0).toUpperCase() + exhibitType.slice(1),
      start_time: startDate,
      end_time: endDate,
      chosen_env: selectedEnvironment?.toString() ?? "",
      artworks: selectedArtworks,
      collaborators: collaborators.map((user) => user.id),
      banner: bannerFile,
      slot_artwork_map: slotArtworkMap,
      slot_owner_map: slotOwnerMap
    };

    console.log("Submitting payload:", payload);
    console.log("Is bannerImage a File?", payload.banner instanceof File);

    createExhibitMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Exhibit Created",
          description: "Your exhibit has been successfully created!",
        });
        navigate("/exhibits");
      },
      onError: (error) => {
        toast({
          title: "Failed to create exhibit",
          description: error?.message || "Unknown error",
          variant: "destructive",
        });
      },
    });
  };

  // Function to send notifications to collaborators
  const sendNotificationsToCollaborators = () => {
    // Prepare notifications for all collaborators
    const notificationsToSend = collaborators.map((collab) => ({
      collaboratorId: collab.id,
      collaboratorName: collab.first_name,
      exhibitId: Math.floor(Math.random() * 1000) + 1, // In a real app, this would be the actual exhibit ID
      exhibitTitle: title || "Untitled Exhibit",
    }));

    // Send notifications using our utility function
    const count = sendCollaboratorNotifications(notificationsToSend);
    showCollaboratorNotification(count);

    setShowNotificationDialog(false);
    completeExhibitSubmission();
  };

  const handleArtworkSelect = (artworkId: string) => {
    const currentUserId = getLoggedInUserId() ?? (viewMode === "owner" ? currentUser.id : currentCollaborator?.id);
    if (!currentUserId) return;

    const currentUserIdStr = currentUserId.toString();

    // Filter slots owned by current user that don't have artwork assigned yet
    const availableUserSlots = Object.entries(slotOwnerMap)
      .filter(([slotId, userId]) => userId.toString() === currentUserIdStr && !slotArtworkMap[Number(slotId)])
      .map(([slotId]) => Number(slotId));

    // Don't allow selecting same artwork twice
    if (selectedArtworks.includes(artworkId)) {
      toast({
        title: "Artwork already selected",
        description: "This artwork has already been assigned to a slot.",
        variant: "destructive",
      });
      return;
    }

    const availableSlot = availableUserSlots[0];

    if (!availableSlot) {
      toast({
        title: "No available slots",
        description: "You don't have any available slots for more artwork.",
        variant: "destructive",
      });
      return;
    }

    // Assign artwork to the slot
    setSlotArtworkMap((prev) => ({
      ...prev,
      [availableSlot]: artworkId,
    }));

    // Add the slot to selected slots if it's not already
    if (!selectedSlots.includes(availableSlot)) {
      setSelectedSlots((prev) => [...prev, availableSlot]);
    }

    // Mark this artwork as selected
    setSelectedArtworks((prev) => [...prev, artworkId]);
  };

  const handleSlotSelect = (slotId: number) => {
    // Determine which user is currently making selections
    const currentUserId = getLoggedInUserId() ?? (viewMode === "owner" ? currentUser.id : currentCollaborator?.id);
    if (!currentUserId) return;

    if (slotOwnerMap[slotId] !== currentUserId.toString()) {
      toast({
        title: "Access denied",
        description: "This slot is assigned to another participant.",
        variant: "destructive",
      });

      return;
    }

    // If slot is already selected, toggle it off
    if (selectedSlots.includes(slotId)) {
      // Remove the artwork assignment for this slot
      const newSlotArtworkMap = { ...slotArtworkMap };
      const artworkId = newSlotArtworkMap[slotId];

      // Remove the artwork from selected artworks if it was in this slot
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

  // Handle clearing a slot
  const handleClearSlot = (slotId: number) => {
    // Determine which user is currently making selections
    const currentUserId = getLoggedInUserId() ?? (viewMode === "owner" ? currentUser.id : currentCollaborator?.id);
    if (!currentUserId) return;

    // Ensure the user owns this slot
    if (slotOwnerMap[slotId] !== currentUserId) {
      return;
    }

    const artworkId = slotArtworkMap[slotId];
    if (artworkId) {
      // Remove the artwork from selected artworks
      setSelectedArtworks((prev) => prev.filter((id) => id !== artworkId));

      // Remove the slot-artwork mapping
      const newSlotArtworkMap = { ...slotArtworkMap };
      delete newSlotArtworkMap[slotId];
      setSlotArtworkMap(newSlotArtworkMap);
    }
  };

  // Handle adding a collaborator
  const handleAddCollaborator = (artist: User) => {
    if (collaborators.length >= 5) {
      toast({
        title: "Maximum collaborators reached",
        description: "You can only add up to 5 collaborators.",
        variant: "destructive",
      });
      return;
    }

    setCollaborators((prev) => [...prev, artist]);
    distributeSlots();
  };

  // Handle removing a collaborator
  const handleRemoveCollaborator = (artist: User) => {
    setCollaboratorToRemove(artist);
    setIsRemoveCollaboratorDialogOpen(true);
  };

  const confirmRemoveCollaborator = () => {
    if (!collaboratorToRemove) return;

    // Remove collaborator
    setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorToRemove.id));

    // Clear slot assignments and redistribute
    setIsRemoveCollaboratorDialogOpen(false);
    setCollaboratorToRemove(null);

    // Redistribute slots
    setTimeout(() => {
      distributeSlots();
    }, 0);
  };

  // Handle environment change
  const handleEnvironmentChange = (envId: number) => {
    const selectedEnv = environments.find(env => env.id === envId);
    const totalParticipants = collaborators.length + 1;

    if (selectedEnv && selectedEnv.slots < totalParticipants) {
      toast({
        title: "Not enough slots to assign for all collaborators and the owner.",
        description: "Please select a virtual environment with more available slots.",
        className: "text-red-600",
        duration: 4000,
      });
      return;
    }

    setSelectedEnvironment(envId);
    distributeSlots();
  };

  // Handle exhibit type change
  const handleExhibitTypeChange = (value: string) => {
    if (value) {
      setExhibitType(value);

      // If changing to solo, remove all collaborators
      if (value === "solo") {
        setCollaborators([]);
        distributeSlots();
      }
    }
  };

  // Get slot color based on owner - only for collaborative exhibits
  const getSlotColor = (slotId: number) => {
    if (exhibitType === "solo") return "border-gray-200";

    const ownerId = slotOwnerMap[slotId.toString()];
    if (!ownerId) return slotColorSchemes[0];

    const getColorSchemeIndex = (userId: string) => {
      if (userId === String(currentUser.id)) return 0; // convert currentUser.id to string here

      const collaboratorIndex = collaborators.findIndex((c) => String(c.id) === userId);

      return collaboratorIndex + 1;
    };

    return slotColorSchemes[getColorSchemeIndex(ownerId)];
  };

  // Get user name by ID
  const getUserName = (userId: string) => {
    if (userId === currentUser.id.toString()) return "Your slot";

    const collaborator = collaborators.find((c) => c.id.toString() === userId);
    return collaborator ? `${collaborator.first_name}'s slot` : "";
  };

  // Determine if the current user can interact with a slot
  const canInteractWithSlot = (slotId: number): boolean => {
    if (isReadOnly) return false;

    const ownerId = slotOwnerMap[slotId];
    if (!ownerId) return false;

    return viewMode === "owner"
      ? ownerId === currentUser.id.toString()
      : ownerId === currentCollaborator?.id?.toString();
  };

  // Function to get collaborator submission status
  const getCollaboratorSubmissionStatus = (collaboratorId: string): SubmissionStatus => {
    // Get slots assigned to this collaborator
    const collaboratorSlots = Object.entries(slotOwnerMap)
      .filter(([_, userId]) => userId === collaboratorId) // Compare as strings
      .map(([slotId]) => Number(slotId)); // Convert slotId to number if needed

    // Count filled slots
    const filledSlots = collaboratorSlots.filter((slotId) => slotArtworkMap[slotId]);

    return {
      total: collaboratorSlots.length,
      filled: filledSlots.length,
      percentage: collaboratorSlots.length > 0 ? Math.round((filledSlots.length / collaboratorSlots.length) * 100) : 0,
    };
  };

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
          getCollaboratorSubmissionStatus={getCollaboratorSubmissionStatus}
        />

        {/* Collaborator View Notice */}
        <CollaboratorNotice viewMode={viewMode} currentCollaborator={currentCollaborator} title={title} />

        <form onSubmit={handleSubmit} className="space-y-8">
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

                {selectedEnvironment === 3 && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold mb-4">Interactive Virtual Gallery</p>
                    <div className="w-full h-[600px] relative rounded-lg overflow-hidden border">
                      <Gallery3D
                        slotArtworkMap={slotArtworkMap}
                        artworks={artworks.map((a) => ({
                          id: a.id.toString(),
                          image_url: a.image_url || a.image_url || "", 
                          title: a.title || "Untitled",
                          artist: a.artist || "Unknown"
                        }))}
                      />

                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      This 3D environment contains <strong>10 slots</strong>. Click to enter, use <code>WASD</code> + mouse to move.
                    </p>
                  </div>
                )}

                {/* Display available slots only if an environment is selected */}
                {selectedEnvironment && (
                  <ExhibitSlots
                    selectedEnvironment={selectedEnvironment}
                    environments={environments}
                    slotOwnerMap={slotOwnerMap}
                    slotArtworkMap={slotArtworkMap}
                    artworks={artworks}
                    exhibitType={exhibitType}
                    selectedSlots={selectedSlots}
                    handleSlotSelect={handleSlotSelect}
                    handleClearSlot={handleClearSlot}
                    canInteractWithSlot={canInteractWithSlot}
                    getUserName={getUserName}
                    getSlotColor={getSlotColor}
                    collaborators={collaborators}
                    currentUser={currentUser}
                    colorNames={colorNames}
                    slotColorSchemes={slotColorSchemes}
                  />
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
              handleExhibitTypeChange={handleExhibitTypeChange}
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
              getCollaboratorSubmissionStatus={getCollaboratorSubmissionStatus}
              currentCollaborator={currentCollaborator}
            />
          </div>

          {/* Artwork selection section - Only show if an environment is selected */}
          {selectedEnvironment && !isReadOnly && (
            <ArtworkSelector
              artworks={artworks}
              selectedArtworks={selectedArtworks}
              handleArtworkSelect={handleArtworkSelect}
              currentCollaborator={currentCollaborator}
              viewMode={viewMode}
            />
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-red-700 hover:bg-red-600 text-white text-[10px] px-8 py-1.5 rounded-full"
            >
              {viewMode === "collaborator"
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
        sendNotificationsToCollaborators={sendNotificationsToCollaborators}
        collaborators={collaborators}
      />
    </div>
  );
};

export default AddExhibit;
