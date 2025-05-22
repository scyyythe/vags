import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AddArtistDialog from "@/components/user_dashboard/Exhibit/add_exhibit/components/AddArtistDialog";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
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
import { useCreateExhibit } from "@/hooks/mutate/exhibit/AddExhibit";
// Import types
import { Artist, ViewMode, Environment, Artwork, SubmissionStatus } from "./components/types";
import { createExhibit, ExhibitPayload } from "@/hooks/mutate/exhibit/exhibit";
// Color schemes for slots by user
const slotColorSchemes = [
  "border-primary bg-primary/10", // Owner (primary color)
  "border-[#9b87f5] bg-[#9b87f5]/10", // First collaborator (purple)
  "border-[#7E69AB] bg-[#7E69AB]/10", // Second collaborator (darker purple)
];

// Color names for clearer visual distinction
const colorNames = [
  "Dark Blue (Your slots)", // Owner color name
  "Purple (First collaborator's slots)", // First collaborator color name
  "Dark Purple (Second collaborator's slots)", // Second collaborator color name
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
  const { mutate: createExhibit } = useCreateExhibit();

  // State variables
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [exhibitType, setExhibitType] = useState("solo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null);
  const [selectedArtworks, setSelectedArtworks] = useState<number[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [slotArtworkMap, setSlotArtworkMap] = useState<Record<number, number>>({});
  const [isAddArtistDialogOpen, setIsAddArtistDialogOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Artist[]>([]);
  const [slotOwnerMap, setSlotOwnerMap] = useState<Record<number, number>>({});
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [isRemoveCollaboratorDialogOpen, setIsRemoveCollaboratorDialogOpen] = useState(false);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<Artist | null>(null);
  const [artworkStyle, setArtworkStyle] = useState("");

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("owner");
  const [currentCollaborator, setCurrentCollaborator] = useState<Artist | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Mock current user data
  const currentUser: Artist = {
    id: 100,
    name: "You",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
  };

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
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      slots: 9,
    },
  ];

  // Mock artworks data
  const artworks: Artwork[] = [
    { id: 1, image: "https://i.pinimg.com/736x/b4/01/da/b401dab097ac7f9e2e5ad0e5bb168f77.jpg" },
    { id: 2, image: "https://i.pinimg.com/736x/6c/5b/49/6c5b490a1a86fd6b07c23599967486f6.jpg" },
    { id: 3, image: "https://i.pinimg.com/736x/3d/aa/f2/3daaf26aafb613c049ee637ba71cc95d.jpg" },
    { id: 4, image: "https://i.pinimg.com/736x/39/8d/54/398d54f3fbb37394b62882f30b058934.jpg" },
    { id: 5, image: "https://i.pinimg.com/736x/34/00/33/3400334676f49e098b82459a1ed8d8c0.jpg" },
    { id: 6, image: "https://i.pinimg.com/736x/42/b1/5d/42b15dc87e44a458a61c84f499799096.jpg" },
    { id: 7, image: "https://i.pinimg.com/736x/97/63/d2/9763d2e3d5005a316631330401ccc99e.jpg" },
    { id: 8, image: "https://i.pinimg.com/736x/0e/3f/e7/0e3fe7f3e1da1ac7baeab1947dfd08c3.jpg" },
    { id: 9, image: "https://i.pinimg.com/736x/b4/01/da/b401dab097ac7f9e2e5ad0e5bb168f77.jpg" },
    { id: 10, image: "https://i.pinimg.com/736x/6c/5b/49/6c5b490a1a86fd6b07c23599967486f6.jpg" },
    { id: 11, image: "https://i.pinimg.com/736x/3d/aa/f2/3daaf26aafb613c049ee637ba71cc95d.jpg" },
    { id: 12, image: "https://i.pinimg.com/736x/39/8d/54/398d54f3fbb37394b62882f30b058934.jpg" },
    { id: 13, image: "https://i.pinimg.com/736x/34/00/33/3400334676f49e098b82459a1ed8d8c0.jpg" },
    { id: 14, image: "https://i.pinimg.com/736x/42/b1/5d/42b15dc87e44a458a61c84f499799096.jpg" },
    { id: 15, image: "https://i.pinimg.com/736x/97/63/d2/9763d2e3d5005a316631330401ccc99e.jpg" },
    { id: 16, image: "https://i.pinimg.com/736x/0e/3f/e7/0e3fe7f3e1da1ac7baeab1947dfd08c3.jpg" },
  ];

  // Load exhibit data based on exhibitId and mode
  const completeExhibitSubmission = () => {
    const payload: ExhibitPayload = {
      title,
      description,
      category,
      artworkStyle,
      exhibitType,
      startDate,
      endDate,
      collaborators,
      environment: selectedEnvironment,
      artworks: selectedArtworks,
      bannerImage,
    };

    createExhibit(payload, {
      onSuccess: () => {
        navigate("/exhibits");
      },
    });
  };
  useEffect(() => {
    if (exhibitId && mockExhibitData[Number(exhibitId)]) {
      const exhibitData = mockExhibitData[Number(exhibitId)];

      // Set view mode
      if (mode === "review" || mode === "monitoring" || mode === "preview") {
        setViewMode(mode);
        setIsReadOnly(true);
      }

      // Populate form fields
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

      const selectedIds = Object.values(exhibitData.slotArtworkMap) as number[];
      setSelectedArtworks(selectedIds);

      const selectedSlotIds = Object.keys(exhibitData.slotArtworkMap).map(Number);
      setSelectedSlots(selectedSlotIds);
    }
  }, [exhibitId, mode]);

  // Separate effect to handle collaborator view detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const collaboratorId = urlParams.get("collaborator");

    if (collaboratorId) {
      const collab = collaborators.find((c) => c.id === Number(collaboratorId));
      if (collab) {
        setViewMode("collaborator");
        setCurrentCollaborator(collab);
      }
    }
  }, [collaborators]);

  // Function to distribute slots among participants
  const distributeSlots = () => {
    if (!selectedEnvironment) return;

    const currentEnvironment = environments.find((env) => env.id === selectedEnvironment);
    if (!currentEnvironment) return;

    const totalParticipants = 1 + collaborators.length; // Owner + collaborators
    const totalSlots = currentEnvironment.slots;

    // Reset slot assignments
    setSelectedSlots([]);
    setSlotArtworkMap({});
    setSelectedArtworks([]);

    const newSlotOwnerMap: Record<number, number> = {};

    // Calculate how many slots each participant gets
    const baseSlots = Math.floor(totalSlots / totalParticipants);
    let remainingSlots = totalSlots % totalParticipants;

    // Create an array of user IDs (owner first, then collaborators)
    const participantIds = [currentUser.id, ...collaborators.map((c) => c.id)];

    // Assign slots in sequential blocks for better visual grouping
    let slotIndex = 1;

    participantIds.forEach((userId) => {
      // Each participant gets baseSlots + 1 extra if there are remainingSlots
      const slotsForUser = baseSlots + (remainingSlots > 0 ? 1 : 0);

      // Assign a block of slots to this user
      for (let i = 0; i < slotsForUser; i++) {
        if (slotIndex <= totalSlots) {
          newSlotOwnerMap[slotIndex] = userId;
          slotIndex++;
        }
      }

      // Decrement remainingSlots if we allocated an extra slot
      if (remainingSlots > 0) remainingSlots--;
    });

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

  // Function to complete the exhibit submission

  // Function to send notifications to collaborators
  const sendNotificationsToCollaborators = () => {
    // Prepare notifications for all collaborators
    const notificationsToSend = collaborators.map((collab) => ({
      collaboratorId: collab.id,
      collaboratorName: collab.name,
      exhibitId: Math.floor(Math.random() * 1000) + 1, // In a real app, this would be the actual exhibit ID
      exhibitTitle: title || "Untitled Exhibit",
    }));

    // Send notifications using our utility function
    const count = sendCollaboratorNotifications(notificationsToSend);
    showCollaboratorNotification(count);

    setShowNotificationDialog(false);
    completeExhibitSubmission();
  };

  const handleArtworkSelect = (artworkId: number) => {
    // Determine which user is currently making selections
    const currentUserId = viewMode === "owner" ? currentUser.id : currentCollaborator?.id;
    if (!currentUserId) return;

    // Find slots assigned to current user that don't have artwork
    const availableUserSlots = Object.entries(slotOwnerMap)
      .filter(([slotId, userId]) => userId === currentUserId && !slotArtworkMap[Number(slotId)])
      .map(([slotId]) => Number(slotId));

    // Find the first available slot for the current user
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
    const currentUserId = viewMode === "owner" ? currentUser.id : currentCollaborator?.id;
    if (!currentUserId) return;

    // Check if this slot belongs to the current user
    if (slotOwnerMap[slotId] !== currentUserId) {
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
    const currentUserId = viewMode === "owner" ? currentUser.id : currentCollaborator?.id;
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
  const handleAddCollaborator = (artist: Artist) => {
    if (collaborators.length >= 2) {
      toast({
        title: "Maximum collaborators reached",
        description: "You can only add up to 2 collaborators.",
        variant: "destructive",
      });
      return;
    }

    setCollaborators((prev) => [...prev, artist]);
    distributeSlots();
  };

  // Handle removing a collaborator
  const handleRemoveCollaborator = (artist: Artist) => {
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
    setSelectedEnvironment(envId);

    // Update the banner to show the selected environment image
    // Only change the banner if the user hasn't uploaded a custom one
    if (!bannerImage || bannerImage === environments.find((env) => env.id === selectedEnvironment)?.image) {
      const env = environments.find((e) => e.id === envId);
      if (env) {
        setBannerImage(env.image);
      }
    }

    // Reset selections
    setSelectedSlots([]);
    setSlotArtworkMap({});
    setSelectedArtworks([]);

    // Distribute slots
    setTimeout(() => distributeSlots(), 0);
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
    // If solo exhibit, no color coding
    if (exhibitType === "solo") return "border-gray-200";

    const ownerId = slotOwnerMap[slotId];
    if (!ownerId) return slotColorSchemes[0]; // Default to owner color

    // Get color scheme index based on user ID
    const getColorSchemeIndex = (userId: number) => {
      if (userId === currentUser.id) return 0; // Owner

      const collaboratorIndex = collaborators.findIndex((c) => c.id === userId);
      return collaboratorIndex + 1; // +1 because owner is index 0
    };

    return slotColorSchemes[getColorSchemeIndex(ownerId)];
  };

  // Get user name by ID
  const getUserName = (userId: number) => {
    if (userId === currentUser.id) return "Your slot";
    const collaborator = collaborators.find((c) => c.id === userId);
    return collaborator ? `${collaborator.name}'s slot` : "";
  };

  // Determine if the current user can interact with a slot
  const canInteractWithSlot = (slotId: number): boolean => {
    if (isReadOnly) return false; // No interaction in read-only modes

    const ownerId = slotOwnerMap[slotId];
    return viewMode === "owner" ? ownerId === currentUser.id : ownerId === currentCollaborator?.id;
  };

  // Function to get collaborator submission status
  const getCollaboratorSubmissionStatus = (collaboratorId: number): SubmissionStatus => {
    // Get slots assigned to this collaborator
    const collaboratorSlots = Object.entries(slotOwnerMap)
      .filter(([_, userId]) => Number(userId) === collaboratorId)
      .map(([slotId]) => Number(slotId));

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
                />

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
