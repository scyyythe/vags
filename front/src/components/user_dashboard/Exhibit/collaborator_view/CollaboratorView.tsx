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
  const { mutate: submitContributions } = useSubmitContributions(exhibitId!);

  const artworks = userArtworks || [];

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
    if (!data) return;

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

    // Debug: Log the slot distribution
    console.log("🔍 CollaboratorView - Slot Owner Map:", transformedExhibit.slotOwnerMap);
    console.log("🔍 CollaboratorView - Backend Slots Data:", data.slots);
    console.log(
      "🔍 CollaboratorView - Expected slots for Gil (owner):",
      Object.entries(transformedExhibit.slotOwnerMap)
        .filter(([slot, ownerId]) => ownerId === transformedExhibit.owner.id)
        .map(([slot, ownerId]) => slot)
    );

    setExhibit(transformedExhibit);
    setSlotArtworkMap(transformedExhibit.slotArtworkMap);
    setSelectedArtworks(Object.values(transformedExhibit.slotArtworkMap));

    const currentUser = transformedExhibit.collaborators.find((c) => String(c.id) === String(userId));

    setCurrentCollaborator(currentUser || null);
    setLoading(false);
  }, [data]);

  if (loading) {
    return <div className="min-h-screen text-xs flex items-center justify-center">Loading exhibit data...</div>;
  }

  if (!exhibit) {
    return <div className="min-h-screen text-xs flex items-center justify-center">Exhibit not found</div>;
  }

  const currentEnvironment = environments.find((env) => env.id === exhibit.environment);
  const availableSlots = currentEnvironment ? Array.from({ length: currentEnvironment.slots }, (_, i) => i + 1) : [];

  const handleArtworkSelect = (artworkId: string) => {
    if (!currentCollaborator) return;

    const availableUserSlots = Object.entries(exhibit.slotOwnerMap)
      .filter(
        ([slotId, ownerId]) => String(ownerId) === String(currentCollaborator.id) && !slotArtworkMap[Number(slotId)]
      )
      .map(([slotId]) => Number(slotId));

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

    setSelectedArtworks((prev) => [...prev, artworkId]);
  };

  const handleClearSlot = (slotId: number) => {
    if (!currentCollaborator) return;

    if (exhibit.slotOwnerMap[slotId] !== currentCollaborator.id) {
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

    submitContributions(payload, {
      onSuccess: () => {
        toast.success("Selections Saved", {
          description: "Your artwork selections have been saved to the exhibit!",
          closeButton: true,
        });
        navigate("/exhibits");
      },
      onError: (err: any) => {
        toast.error("Error", {
          description: err?.response?.data?.detail || "Failed to submit contributions.",
          closeButton: true,
        });
      },
    });
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
  const getUserName = (userId: string) => {
    if (userId === exhibit.owner.id) return `${exhibit.owner.name}'s slot`;
    const collaborator = exhibit.collaborators.find((c) => c.id === userId);
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

    const filledSlots = userSlots.filter((slotId) => slotArtworkMap[slotId]);

    return {
      total: userSlots.length,
      filled: filledSlots.length,
    };
  };

  const slotStats = getUserSlotStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-20 pb-4">
        <div className="mb-3">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-xl mr-2"></i>Go back
          </button>
        </div>

        {/* Collaborator View Notice */}
        <div className=" mb-6">
          <h2 className="text-[13px] font-medium mb-1">Exhibit Collaboration</h2>
          <p className="text-[11px]">
            You are invited to contribute to "{exhibit.title}". Please select your artwork for the slots assigned to you
            below.
          </p>
        </div>

        <div className="space-y-8">
          {/* Banner Image */}
          <div
            className="w-full rounded-lg h-64 mb-4 relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${exhibit.bannerImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white">
              <h1 className="text-md font-bold mb-2">{exhibit.title}</h1>
              <p className="text-[11px]">
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
                    <div
                      className={`w-3 h-3 mr-1 rounded-full ${slotColorSchemes[0]
                        .replace("border-", "bg-")
                        .replace("/10", "")}`}
                    ></div>
                    <span className="text-[10px]">{exhibit.owner.name}'s slots</span>
                  </div>

                  {exhibit.collaborators.map((collab, index) => (
                    <div key={collab.id} className="flex items-center">
                      <div
                        className={`w-3 h-3 mr-1 rounded-full ${slotColorSchemes[index + 1]
                          .replace("border-", "bg-")
                          .replace("/10", "")}`}
                      ></div>
                      <span className="text-[10px]">{collab.name}'s slots</span>
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

                      return (
                        <div
                          key={slotId}
                          className={`h-[93px] rounded-lg relative overflow-hidden border flex items-center justify-center transition-colors 
                          ${userCanInteract ? "cursor-pointer" : ""}
                          ${!userCanInteract ? slotColor + " opacity-75" : slotColor}`}
                        >
                          {contributedSlot?.artwork?.image_url ? (
                            // Show actual contributed artwork from backend (highest priority)
                            <>
                              <img
                                src={
                                  Array.isArray(contributedSlot.artwork.image_url)
                                    ? contributedSlot.artwork.image_url[0]
                                    : contributedSlot.artwork.image_url
                                }
                                alt={contributedSlot.artwork.title || "Artwork"}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded">
                                {slotId}
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[7px] px-1 py-0.5 rounded truncate max-w-[80%]">
                                {contributedSlot.contributor?.name || "Unknown"}
                              </div>
                            </>
                          ) : assignedArtwork ? (
                            // Show user's selected artwork (for slots they can interact with)
                            <>
                              <img
                                src={assignedArtwork.artworkImage || assignedArtwork.image_url}
                                alt={`Artwork ${assignedArtworkId}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded">
                                {slotId}
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[7px] px-1 py-0.5 rounded truncate max-w-[80%]">
                                Your selection
                              </div>
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
                            // Show empty slot
                            <Popover>
                              <PopoverTrigger asChild>
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                  <span className="text-xs font-semibold">{slotId}</span>
                                  <span className="text-[10px] text-gray-500">{getUserName(slotOwner)}</span>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2">
                                <p className="text-[10px]">{getUserName(slotOwner)}</p>
                                {userCanInteract && (
                                  <p className="text-[9px] text-blue-600 mt-1">
                                    Click on an artwork to assign it to this slot
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
                  className="bg-gray-900 text-white text-[10px] px-5 py-2 rounded-full hover:bg-gray-800"
                  onClick={() => {
                    navigate("/gallery3d-preview");
                  }}
                >
                  Preview in 3D View
                </button>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Opens your current selections in an interactive virtual gallery.
                </p>
              </div>
            </div>

            {/* Right Column - Artworks */}
            <div>
              <h3 className="text-xs font-medium mb-4">Your Artworks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
                {artworks.map((artwork) => {
                  const isSelected = selectedArtworks.includes(String(artwork.id));
                  return (
                    <Card
                      key={artwork.id}
                      onClick={() => !isSelected && handleArtworkSelect(String(artwork.id))}
                      className={`cursor-pointer overflow-hidden ${isSelected ? "opacity-40" : ""}`}
                    >
                      <img
                        src={artwork.artworkImage}
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
