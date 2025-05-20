import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/components/ui/use-toast";
import AddArtistDialog from "@/components/user_dashboard/Exhibit/components/AddArtistDialog";
import { ART_STYLES } from "@/components/user_dashboard/Explore/create_post/ArtworkStyles";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { Avatar } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

// Artist type definition
type Artist = {
  id: number;
  name: string;
  avatar: string;
};

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

const AddExhibit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  
  // New state for view mode (owner or collaborator)
  const [viewMode, setViewMode] = useState<'owner' | 'collaborator'>('owner');
  const [currentCollaborator, setCurrentCollaborator] = useState<Artist | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  // Mock current user data
  const currentUser: Artist = {
    id: 100,
    name: "You",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
  };

  // Mock environments data with different slot capacities
  const environments = [
    { id: 1, image: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", slots: 4 },
    { id: 2, image: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", slots: 6 },
    { id: 3, image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", slots: 9 },
  ];

  // Mock artworks data
  const artworks = [
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

  // For demo purposes: toggle collaborator view
  useEffect(() => {
    // URL parameter to simulate collaborator view for demo purposes
    const urlParams = new URLSearchParams(window.location.search);
    const collaboratorId = urlParams.get('collaborator');
    
    if (collaboratorId) {
      const collab = collaborators.find(c => c.id === Number(collaboratorId));
      if (collab) {
        setViewMode('collaborator');
        setCurrentCollaborator(collab);
      }
    }
  }, [collaborators]);

  // Function to distribute slots among participants
  const distributeSlots = () => {
    if (!selectedEnvironment) return;
    
    const currentEnvironment = environments.find(env => env.id === selectedEnvironment);
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
    const participantIds = [currentUser.id, ...collaborators.map(c => c.id)];
    
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
    
    // For regular solo exhibits or owner submitting collab exhibit
    if (viewMode === 'owner') {
      // Check if this is a collaborative exhibit that needs to notify collaborators
      if (exhibitType === 'collab' && collaborators.length > 0) {
        // Show notification dialog
        setShowNotificationDialog(true);
        return;
      }
      
      // Otherwise, complete the submission directly
      completeExhibitSubmission();
    } else if (viewMode === 'collaborator') {
      // Save collaborator's artwork selections
      toast({
        title: "Selections Saved",
        description: "Your artwork selections have been saved to the exhibit!",
      });
      
      navigate("/exhibits");
    }
  };
  
  // Function to complete the exhibit submission
  const completeExhibitSubmission = () => {
    //  Form submission to create the exhibit
    console.log({
      title,
      category,
      exhibitType,
      startDate,
      endDate,
      description,
      selectedEnvironment,
      selectedArtworks,
      selectedSlots,
      slotArtworkMap,
      collaborators,
      bannerImage
    });
    
    toast({
      title: "Exhibit Created",
      description: "Your exhibit has been successfully created!",
    });
    
    // Navigate back to exhibits page after submission
    navigate("/exhibits");
  };

  // Function to send notifications to collaborators
  const sendNotificationsToCollaborators = () => {
    // Here you would handle sending notifications to collaborators
    console.log("Sending notifications to:", collaborators);
    
    toast({
      title: "Notifications Sent",
      description: `Invitations sent to ${collaborators.length} collaborator${collaborators.length > 1 ? 's' : ''}.`,
    });
    
    setShowNotificationDialog(false);
    completeExhibitSubmission();
  };

  const handleArtworkSelect = (artworkId: number) => {
    // Determine which user is currently making selections
    const currentUserId = viewMode === 'owner' ? currentUser.id : currentCollaborator?.id;
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
    setSlotArtworkMap(prev => ({
      ...prev,
      [availableSlot]: artworkId
    }));
    
    // Add the slot to selected slots if it's not already
    if (!selectedSlots.includes(availableSlot)) {
      setSelectedSlots(prev => [...prev, availableSlot]);
    }
    
    // Mark this artwork as selected
    setSelectedArtworks(prev => [...prev, artworkId]);
  };

  const handleSlotSelect = (slotId: number) => {
    // Determine which user is currently making selections
    const currentUserId = viewMode === 'owner' ? currentUser.id : currentCollaborator?.id;
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
        setSelectedArtworks(prev => prev.filter(id => id !== artworkId));
        delete newSlotArtworkMap[slotId];
        setSlotArtworkMap(newSlotArtworkMap);
      }
      
      setSelectedSlots(prev => prev.filter(id => id !== slotId));
    } else {
      setSelectedSlots(prev => [...prev, slotId]);
    }
  };

  // Handle clearing a slot
  const handleClearSlot = (slotId: number) => {
    // Determine which user is currently making selections
    const currentUserId = viewMode === 'owner' ? currentUser.id : currentCollaborator?.id;
    if (!currentUserId) return;
    
    // Ensure the user owns this slot
    if (slotOwnerMap[slotId] !== currentUserId) {
      return;
    }
    
    const artworkId = slotArtworkMap[slotId];
    if (artworkId) {
      // Remove the artwork from selected artworks
      setSelectedArtworks(prev => prev.filter(id => id !== artworkId));
      
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
    
    setCollaborators(prev => [...prev, artist]);
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
    setCollaborators(prev => prev.filter(c => c.id !== collaboratorToRemove.id));
    
    // Clear slot assignments and redistribute
    setIsRemoveCollaboratorDialogOpen(false);
    setCollaboratorToRemove(null);
    
    // Redistribute slots
    setTimeout(() => {
      distributeSlots();
    }, 0);
  };

  // Handle uploading a custom banner
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnvironmentChange = (envId: number) => {
    setSelectedEnvironment(envId);
    
    // Update the banner to show the selected environment image
    // Only change the banner if the user hasn't uploaded a custom one
    if (!bannerImage || bannerImage === environments.find(env => env.id === selectedEnvironment)?.image) {
      const env = environments.find(e => e.id === envId);
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

  // Get current environment details
  const currentEnvironment = selectedEnvironment 
    ? environments.find(env => env.id === selectedEnvironment)
    : null;

  // Generate array of slots based on current environment
  const availableSlots = currentEnvironment ? Array.from({ length: currentEnvironment.slots }, (_, i) => i + 1) : [];

  const getArtworkById = (id: number) => artworks.find(artwork => artwork.id === id);

  // Get color scheme index based on user ID
  const getColorSchemeIndex = (userId: number) => {
    if (userId === currentUser.id) return 0; // Owner
    
    const collaboratorIndex = collaborators.findIndex(c => c.id === userId);
    return collaboratorIndex + 1; // +1 because owner is index 0
  };

  // Get slot color based on owner - only for collaborative exhibits
  const getSlotColor = (slotId: number) => {
    // If solo exhibit, no color coding
    if (exhibitType === 'solo') return 'border-gray-200';
    
    const ownerId = slotOwnerMap[slotId];
    if (!ownerId) return slotColorSchemes[0]; // Default to owner color
    
    return slotColorSchemes[getColorSchemeIndex(ownerId)];
  };

  // Get user name by ID
  const getUserName = (userId: number) => {
    if (userId === currentUser.id) return "Your slot";
    const collaborator = collaborators.find(c => c.id === userId);
    return collaborator ? `${collaborator.name}'s slot` : "";
  };

  // Determine if the current user can interact with a slot
  const canInteractWithSlot = (slotId: number) => {
    const ownerId = slotOwnerMap[slotId];
    return viewMode === 'owner' 
      ? ownerId === currentUser.id 
      : ownerId === currentCollaborator?.id;
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
            
            {/* Collaborator View Notice - Only visible to collaborators */}
            {viewMode === 'collaborator' && (
            <div className="bg-[#9b87f5]/10 border border-[#9b87f5] rounded-md p-4 mb-6">
                <h2 className="text-xs font-medium mb-2">
                {currentCollaborator?.name}, you've been invited to collaborate!
                </h2>
                <p className="text-xs">
                You are invited to contribute to "{title || 'Untitled Exhibit'}". 
                Select your artwork for the slots assigned to you below.
                </p>
            </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column - Banner upload */}
                <div>
                <div 
                    className="w-full bg-gray-100 rounded-lg flex flex-col items-center justify-center h-64 mb-8 relative overflow-hidden"
                    style={{
                    backgroundImage: bannerImage ? `url(${bannerImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                    }}
                >
                    {!bannerImage ? (
                    <>
                        <div className="bg-white p-2 rounded-full inline-block mb-2">
                            <img
                            width="20"
                            height="20"
                            src="./pics/icons8-cloud-upload.gif"
                            alt="external-upload-network-and-cloud-computing-flatart-icons-solid-flatarticons"
                            />
                        </div>
                        <p className="text-xs text-gray-600">Add a banner</p>
                    </>
                    ) : (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white text-black border-white hover:bg-gray-100"
                            onClick={() => setBannerImage(null)}
                        >
                            Change banner
                        </Button>
                    </div>
                    )}

                    {/* Hidden file input for banner upload */}
                    <input 
                        type="file" 
                        id="banner-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleBannerUpload}
                        disabled={viewMode === 'collaborator'}
                    />
                    <label 
                        htmlFor="banner-upload" 
                        className={`absolute inset-0 ${viewMode === 'collaborator' ? '' : 'cursor-pointer'}`}
                        aria-label="Upload banner"
                    ></label>
                </div>
                
                <div className="space-y-6">
                    <div>
                    <h3 className="text-xs font-medium mb-4">Choose Virtual Environment</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {environments.map((env) => (
                            <div 
                                key={env.id}
                                onClick={() => viewMode === 'owner' && handleEnvironmentChange(env.id)}
                                className={`rounded-lg overflow-hidden ${viewMode === 'owner' ? 'cursor-pointer' : ''} border-2 ${
                                selectedEnvironment === env.id ? "border-gray-200" : "border-transparent"
                                } ${viewMode === 'collaborator' ? 'opacity-70' : ''}`}
                            >
                                <img 
                                    src={env.image} 
                                    alt={`Environment ${env.id}`} 
                                    className="w-full h-24 object-cover"
                                />
                                <div className="p-2 text-[10px] text-center">
                                    {env.slots} slots
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>

                    {/* Display available slots only if an environment is selected */}
                    {selectedEnvironment && (
                    <div>
                        <h3 className="text-xs font-medium mb-4">Available Slots</h3>
                        
                        {/* Color coding legend - only for collaborative exhibits */}
                        {exhibitType === 'collab' && (
                        <div className="mb-3 flex flex-wrap gap-3">
                            {/* Show color legend for current participants */}
                            <div className="flex items-center">
                            <div className={`w-3 h-3 mr-1 rounded-full ${slotColorSchemes[0].replace('border-', 'bg-').replace('/10', '')}`}></div>
                            <span className="text-[10px]">{colorNames[0]}</span>
                            </div>
                            
                            {collaborators.map((collab, index) => (
                            <div key={collab.id} className="flex items-center">
                                <div className={`w-4 h-4 mr-1 rounded-full ${slotColorSchemes[index + 1].replace('border-', 'bg-').replace('/10', '')}`}></div>
                                <span className="text-[10px]">{collab.name}'s slots</span>
                            </div>
                            ))}
                        </div>
                        )}
                        
                        <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((slotId) => {
                            const assignedArtworkId = slotArtworkMap[slotId];
                            const assignedArtwork = assignedArtworkId ? getArtworkById(assignedArtworkId) : null;
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
                    )}

                    
                </div>
                </div>
                
                {/* Right column - Form fields */}
                <div className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-[11px] font-medium mb-2">Exhibit Title</label>
                    <Input 
                        id="title" 
                        placeholder="Enter title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full focus:outline-none focus:ring-0 h-8"
                        readOnly={viewMode === 'collaborator'}
                        style={{ fontSize: "10px" }}
                    />
                </div>
                
                {viewMode === 'owner' && (
                    <div>
                        <span className="text-[11px] font-medium mb-2">Exhibit Type</span>
                        <ToggleGroup type="single" value={exhibitType} onValueChange={handleExhibitTypeChange} className="mt-1.5 gap-9">
                            <ToggleGroupItem value="solo" className="w-full text-[10px] border rounded-md h-8">Solo</ToggleGroupItem>
                            <ToggleGroupItem value="collab" className="w-full text-[10px] border rounded-md h-8">Collaborative</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="category" className="block text-[11px] font-medium mb-2">Category</label>
                    <div className="relative">
                            <select
                                id="style"
                                value={artworkStyle}
                                onChange={(e) => setArtworkStyle(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-18 text-[10px] cursor-pointer"
                            >
                                <option value="" disabled>
                                    Select artwork style
                                </option>
                                {ART_STYLES.map((style) => (
                                    <option key={style} value={style.toLowerCase()}>
                                        {style}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                    d="M4 6L8 10L12 6"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <label className="block text-[11px] font-medium mb-2">Duration</label>
                    <div className="flex items-center space-x-4">
                    <div className="w-full">
                        <div className="text-[10px] text-gray-500 mb-1">Start Date</div>
                        <Input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full h-8"
                            readOnly={viewMode === 'collaborator'}
                            style={{ fontSize: "10px" }}
                        />
                    </div>
                    
                    <div className="flex items-center relative top-2">-</div>
                    
                    <div className="w-full">
                        <div className="text-[10px] text-gray-500 mb-1">End Date</div>
                        <Input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full h-8"
                            readOnly={viewMode === 'collaborator'}
                            style={{ fontSize: "10px" }}
                        />
                    </div>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-[11px] font-medium mb-2">Description</label>
                    <Textarea 
                        id="description" 
                        placeholder="Add a description" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-20"
                        readOnly={viewMode === 'collaborator'}
                        style={{ fontSize: "10px" }}
                    />
                </div>

                {exhibitType === "collab" && viewMode === 'owner' && (
                    <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-[11px] font-medium">Add Artist(s)</label>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 h-5"
                            onClick={() => setIsAddArtistDialogOpen(true)}
                            disabled={collaborators.length >= 2}
                            style={{ fontSize: "10px" }}
                        >
                        <i className="bx bx-plus text-xs"></i> Add
                        </Button>
                    </div>
                    
                    {/* Display selected collaborators */}
                    {collaborators.length > 0 ? (
                        <div className="space-y-2">
                        {collaborators.map((artist, index) => (
                            <div 
                            key={artist.id} 
                            className={`flex items-center justify-between p-2 rounded-md ${
                                slotColorSchemes[index + 1].replace('border-', 'bg-')
                            }`}
                            >
                            <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                <img src={artist.avatar} alt={artist.name} className="rounded-full" />
                                </Avatar>
                                <span className="text-[10px]">{artist.name}</span>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 rounded-full"
                                onClick={() => handleRemoveCollaborator(artist)}
                            >
                                <i className='bx bx-x'></i>
                            </Button>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-[10px] text-muted-foreground py-2 p-4 text-center">
                        No collaborators added yet. Add up to 2 collaborators.
                        </div>
                    )}
                    </div>
                )}
                
                {/* Collaborator Selection Status - Only visible in collaborator view */}
                {viewMode === 'collaborator' && (
                    <div className="border rounded-md p-4 bg-gray-50">
                    <h3 className="text-sm font-medium mb-2">Your Artwork Selection</h3>
                    
                    {/* Count collaborator's assigned slots and selected artworks */}
                    {(() => {
                        const userSlots = Object.entries(slotOwnerMap)
                        .filter(([_, userId]) => userId === currentCollaborator?.id)
                        .map(([slotId]) => Number(slotId));
                        
                        const filledSlots = userSlots.filter(slotId => slotArtworkMap[slotId]);
                        
                        return (
                        <div className="flex items-center justify-between">
                            <span className="text-[10px]">
                            {filledSlots.length} of {userSlots.length} slots filled
                            </span>
                            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full text-[10px] bg-[#9b87f5]" 
                                style={{ 
                                width: `${userSlots.length > 0 ? (filledSlots.length / userSlots.length) * 100 : 0}%`
                                }}
                            ></div>
                            </div>
                        </div>
                        );
                    })()}
                    </div>
                )}
                </div>
            </div>
            
            {/* Artwork selection section - Only show if an environment is selected */}
            {selectedEnvironment && (
              <div>
                <h3 className="text-xs font-medium mb-4">
                  {viewMode === 'collaborator' ? `${currentCollaborator?.name}'s Artworks` : "Your Artworks"}
                </h3>
                
                {/* Scrollable container wrapper */}
                <div className="max-h-64 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {artworks.map((artwork) => {
                      const isSelected = selectedArtworks.includes(artwork.id);
                      return (
                        <Card 
                          key={artwork.id}
                          onClick={() => !isSelected && handleArtworkSelect(artwork.id)}
                          className={`cursor-pointer overflow-hidden ${
                            isSelected ? "opacity-40" : ""
                          }`}
                        >
                          <img 
                            src={artwork.image} 
                            alt={`Artwork ${artwork.id}`} 
                            className="w-full h-24 object-cover"
                          />
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
                <button 
                type="submit" 
                className="bg-red-700 hover:bg-red-600 text-white text-[10px] px-8 py-1.5 rounded-full"
                >
                {viewMode === 'collaborator' ? "Save Selections" : "Publish Exhibit"}
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

        {/* Confirm Remove Collaborator Dialog */}
        <AlertDialog 
            open={isRemoveCollaboratorDialogOpen} 
            onOpenChange={setIsRemoveCollaboratorDialogOpen}
        >
            <AlertDialogContent className="w-full max-w-sm rounded-lg">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-xs text-center">Remove Collaborator</AlertDialogTitle>
                <AlertDialogDescription className="text-[10px] text-center">
                Are you sure you want to remove {collaboratorToRemove?.name} from this exhibit?
                Their slot assignments will be redistributed.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <div className="w-full flex justify-between px-20">
                    <AlertDialogCancel className="text-[10px] h-7">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                    className="bg-red-700 hover:bg-red-600 text-white text-[10px] h-7"
                    onClick={confirmRemoveCollaborator}
                    >
                    Remove
                    </AlertDialogAction>
                </div>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
    );
};

export default AddExhibit;
