import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/user_dashboard/navbar/Header";

// Color schemes for slots by user
const slotColorSchemes = [
  "border-primary bg-primary/10", // Owner (primary color)
  "border-[#9b87f5] bg-[#9b87f5]/10", // First collaborator (purple)
  "border-[#7E69AB] bg-[#7E69AB]/10", // Second collaborator (darker purple)
];

type Artist = {
  id: number;
  name: string;
  avatar: string;
};

type CollaboratorViewProps = {
  exhibitData?: {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    environment: number;
    bannerImage: string;
    slotOwnerMap: Record<number, number>;
    slotArtworkMap: Record<number, number>;
    owner: Artist;
    collaborators: Artist[];
  };
};

const CollaboratorView = ({ exhibitData }: CollaboratorViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { exhibitId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [exhibit, setExhibit] = useState<CollaboratorViewProps["exhibitData"]>();
  const [selectedArtworks, setSelectedArtworks] = useState<number[]>([]);
  const [slotArtworkMap, setSlotArtworkMap] = useState<Record<number, number>>({});
  const [currentCollaborator, setCurrentCollaborator] = useState<Artist | null>(null);
  
  // Mock environments data
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
  ];

  // Mock current user (collaborator) data - in a real app this would come from auth context
  const mockCollaborator: Artist = {
    id: 201,
    name: "Jai Anoba",
    avatar: "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
  };

  // Mock exhibit data - in a real app this would be fetched from API
  const mockExhibitData = {
    id: parseInt(exhibitId || "1"),
    title: "Urban Dreamscape",
    description: "A collaborative exhibit exploring the intersection of natural and urban landscapes",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    environment: 2,
    bannerImage: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slotOwnerMap: {
      1: 100, 2: 100, 3: 201, 4: 201, 5: 202, 6: 202
    },
    slotArtworkMap: { 1: 1, 2: 2 }, // Owner has already placed some artwork
    owner: {
      id: 100,
      name: "Jera Anderson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
    },
    collaborators: [
      mockCollaborator,
      {
        id: 202,
        name: "Angel Canete",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
      }
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      const data = exhibitData || mockExhibitData;
      setExhibit(data);
      setSlotArtworkMap(data.slotArtworkMap);
      
      const currentUser = data.collaborators.find(c => c.id === mockCollaborator.id);
      setCurrentCollaborator(currentUser || null);
      
      const selectedIds = Object.values(data.slotArtworkMap);
      setSelectedArtworks(selectedIds);
      
      setLoading(false);
    }, 600);
  }, [exhibitData, exhibitId]);

  if (loading) {
    return <div className="min-h-screen text-xs flex items-center justify-center">Loading exhibit data...</div>;
  }

  if (!exhibit) {
    return <div className="min-h-screen text-xs flex items-center justify-center">Exhibit not found</div>;
  }

  const currentEnvironment = environments.find(env => env.id === exhibit.environment);
  const availableSlots = currentEnvironment ? Array.from({ length: currentEnvironment.slots }, (_, i) => i + 1) : [];

  const handleArtworkSelect = (artworkId: number) => {
    if (!currentCollaborator) return;
    
    const availableUserSlots = Object.entries(exhibit.slotOwnerMap)
      .filter(([slotId, userId]) => userId === currentCollaborator.id && !slotArtworkMap[Number(slotId)])
      .map(([slotId]) => Number(slotId));
    
    const availableSlot = availableUserSlots[0];
    
    if (!availableSlot) {
      toast({
        title: "No available slots",
        description: "You don't have any available slots for more artwork.",
        variant: "destructive",
      });
      return;
    }
    
    setSlotArtworkMap(prev => ({
      ...prev,
      [availableSlot]: artworkId
    }));
    
    setSelectedArtworks(prev => [...prev, artworkId]);
  };

  const handleClearSlot = (slotId: number) => {
    if (!currentCollaborator) return;
    
    if (exhibit.slotOwnerMap[slotId] !== currentCollaborator.id) {
      return;
    }
    
    const artworkId = slotArtworkMap[slotId];
    if (artworkId) {
      setSelectedArtworks(prev => prev.filter(id => id !== artworkId));
      
      const newSlotArtworkMap = { ...slotArtworkMap };
      delete newSlotArtworkMap[slotId];
      setSlotArtworkMap(newSlotArtworkMap);
    }
  };

  const handleSaveSelections = () => {
    
    toast({
      title: "Selections Saved",
      description: "Your artwork selections have been saved to the exhibit!",
    });
    
    navigate("/exhibits");
  };

  const getColorSchemeIndex = (userId: number) => {
    if (userId === exhibit.owner.id) return 0; // Owner
    
    const collaboratorIndex = exhibit.collaborators.findIndex(c => c.id === userId);
    return collaboratorIndex + 1; // +1 because owner is index 0
  };

  const getSlotColor = (slotId: number) => {
    const ownerId = exhibit.slotOwnerMap[slotId];
    if (!ownerId) return slotColorSchemes[0]; 
    
    return slotColorSchemes[getColorSchemeIndex(ownerId)];
  };

  const getUserName = (userId: number) => {
    if (userId === exhibit.owner.id) return `${exhibit.owner.name}'s slot`;
    const collaborator = exhibit.collaborators.find(c => c.id === userId);
    return collaborator ? `${collaborator.name}'s slot` : "";
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
    
    const filledSlots = userSlots.filter(slotId => slotArtworkMap[slotId]);
    
    return {
      total: userSlots.length,
      filled: filledSlots.length
    };
  };

  const slotStats = getUserSlotStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-20 max-w-6xl pb-4">
        <div className="mb-3">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>Go back
          </button>
        </div>
        
        {/* Collaborator View Notice */}
        <div className=" mb-6">
          <h2 className="text-[11px] font-medium mb-1">
            Exhibit Collaboration
          </h2>
          <p className="text-[9px]">
            You are invited to contribute to "{exhibit.title}". 
            Please select your artwork for the slots assigned to you below.
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Banner Image */}
          <div 
            className="w-full rounded-lg h-64 mb-4 relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${exhibit.bannerImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white">
              <h1 className="text-lg font-bold mb-2">{exhibit.title}</h1>
              <p className="text-xs">
                {new Date(exhibit.startDate).toLocaleDateString()} - {new Date(exhibit.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Slots */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-medium mb-4">Available Slots</h3>
                
                {/* Color coding legend */}
                <div className="mb-3 flex flex-wrap gap-3">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 mr-1 rounded-full ${slotColorSchemes[0].replace('border-', 'bg-').replace('/10', '')}`}></div>
                    <span className="text-[10px]">{exhibit.owner.name}'s slots</span>
                  </div>
                  
                  {exhibit.collaborators.map((collab, index) => (
                    <div key={collab.id} className="flex items-center">
                      <div className={`w-3 h-3 mr-1 rounded-full ${slotColorSchemes[index + 1].replace('border-', 'bg-').replace('/10', '')}`}></div>
                      <span className="text-[10px]">{collab.name}'s slots</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((slotId) => {
                    const assignedArtworkId = slotArtworkMap[slotId];
                    const assignedArtwork = assignedArtworkId ? artworks.find(artwork => artwork.id === assignedArtworkId) : null;
                    const slotColor = getSlotColor(slotId);
                    const slotOwner = exhibit.slotOwnerMap[slotId];
                    const userCanInteract = canInteractWithSlot(slotId);
                    
                    return (
                      <div 
                        key={slotId}
                        className={`h-[93px] rounded-lg relative overflow-hidden border flex items-center justify-center transition-colors 
                          ${userCanInteract ? 'cursor-pointer' : ''}
                          ${!userCanInteract ? slotColor + " opacity-75" : slotColor}`
                        }
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
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => handleClearSlot(slotId)}
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
                                  {getUserName(slotOwner)}
                                </span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                              <p className="text-[10px]">{getUserName(slotOwner)}</p>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Collaborator progress status */}
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="text-[11px] font-medium mb-2">Your Artwork Selection</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]">
                    {slotStats.filled} of {slotStats.total} slots filled
                  </span>
                  <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#9b87f5]" 
                      style={{ 
                        width: `${slotStats.total > 0 ? (slotStats.filled / slotStats.total) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Artworks */}
            <div>
              <h3 className="text-xs font-medium mb-4">Your Artworks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
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
                        className="w-full h-[96px] object-cover"
                      />
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end mt-8">
            <button 
              onClick={handleSaveSelections}
              className="bg-red-700 hover:bg-red-600 text-white text-[10px] px-8 py-1.5 rounded-full"
            >
              Save Selections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorView;
