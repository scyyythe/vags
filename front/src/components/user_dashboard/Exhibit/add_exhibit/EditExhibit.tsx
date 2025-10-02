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
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import { getLoggedInUserId } from "@/auth/decode";
import type { ViewMode } from "./components/types";
import useUserQuery from "@/hooks/users/useUserQuery";
import type { User } from "@/hooks/users/useUserQuery";
import { useCreateExhibit } from "@/hooks/mutate/exhibit/AddExhibit";
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
  const { data: currentUser, isLoading } = useUserQuery(currentUserId ?? "");

  const createExhibitMutation = useCreateExhibit();

  const distributeSlots = () => {
    if (!selectedEnvironment || !currentUser?.id) return;

    if (mode === "edit") return;

    const currentEnvironment = environments.find((env) => env.id === selectedEnvironment);
    if (!currentEnvironment) return;
    const totalSlots = currentEnvironment.slots;

    setSelectedSlots([]);
    setSelectedArtworks([]);
    setSlotArtworkMap({});

    const newSlotOwnerMap: Record<number, string> = {};

    if (exhibitType === "solo") {
      for (let i = 1; i <= totalSlots; i++) newSlotOwnerMap[i] = currentUser.id.toString();
    } else {
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
          if (slotId <= totalSlots) newSlotOwnerMap[slotId++] = participant.id.toString();
        }
      }
    }

    setSlotOwnerMap(newSlotOwnerMap);
  };

  useEffect(() => {
    if (!exhibitData) return;
    console.log("Exhibit Data Loaded:", exhibitData);
    // --- Basic exhibit info ---
    setTitle(exhibitData.title);
    setCategory(exhibitData.category);
    setExhibitType(exhibitData.isSolo ? "solo" : "collab");
    setStartDate(exhibitData.startDate?.split("T")[0] || "");
    setEndDate(exhibitData.endDate?.split("T")[0] || "");
    setDescription(exhibitData.description);
    setBannerImage(exhibitData.image);
    if (exhibitData.category) setArtworkStyle(exhibitData.artworkStyle);

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

  // Put exhibit artworks first so they never get lost when `artworks` refetches
  const mergedArtworks: Artwork[] = [...artworkFileObjects, ...artworks];

  // Deduplicate
  const uniqueMergedArtworks: Artwork[] = mergedArtworks.filter(
    (a, index, self) => index === self.findIndex((b) => b.id === a.id)
  );

  // --- Redistribute slots if environment or collaborators change ---
  useEffect(() => {
    if (selectedEnvironment) distributeSlots();
  }, [selectedEnvironment, exhibitType, collaborators]);

  // --- Submit handler ---
  const submitHandlers = createSubmitHandler(
    navigate,
    updateExhibitMutation,
    viewMode,
    exhibitType,
    collaborators,
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
    slotOwnerMap
  );

  // --- Collaborator handlers ---
  const handleAddCollaborator = (artist: User) => {
    if (collaborators.length >= 5) {
      toast.error("Maximum collaborators reached", { closeButton: true });
      return;
    }
    setCollaborators((prev) => [...prev, artist]);
    setTimeout(distributeSlots, 0);
  };

  const handleRemoveCollaborator = (artist: User) => {
    setCollaboratorToRemove(artist);
    setIsRemoveCollaboratorDialogOpen(true);
  };

  const confirmRemoveCollaborator = () => {
    if (!collaboratorToRemove) return;
    setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorToRemove.id));
    setIsRemoveCollaboratorDialogOpen(false);
    setCollaboratorToRemove(null);
    setTimeout(distributeSlots, 0);
  };

  const isUploading = createExhibitMutation.status === "pending";

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

        <form onSubmit={submitHandlers.handleSubmit} className="space-y-8">
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
                  handleEnvironmentChange={(id) => {
                    setSelectedEnvironment(id);
                    setTimeout(distributeSlots, 0);
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
                    handleSlotSelect={(id) => {
                      const currentUserIdForSelection =
                        currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id);
                      if (!currentUserIdForSelection) return;

                      if (slotOwnerMap[id] !== currentUserIdForSelection.toString()) {
                        toast.error("Access denied", { closeButton: true });
                        return;
                      }

                      if (selectedSlots.includes(id)) {
                        const artworkId = slotArtworkMap[id];
                        if (artworkId) setSelectedArtworks((prev) => prev.filter((a) => a !== artworkId));
                        const newMap = { ...slotArtworkMap };
                        delete newMap[id];
                        setSlotArtworkMap(newMap);
                        setSelectedSlots((prev) => prev.filter((s) => s !== id));
                      } else {
                        setSelectedSlots((prev) => [...prev, id]);
                      }
                    }}
                    handleClearSlot={(id) => {
                      console.log("🔹 Attempting to clear slot:", id);
                      console.log("Current slotArtworkMap:", slotArtworkMap);
                      console.log("slotOwnerMap:", slotOwnerMap);
                      console.log("currentUser.id:", currentUser?.id);
                      console.log("currentCollaborator:", currentCollaborator);

                      const artworkId = slotArtworkMap[id];
                      if (!artworkId) {
                        console.log("❌ No artwork assigned to this slot");
                        return;
                      }

                      setSelectedArtworks((prev) => {
                        console.log("Before removing artwork:", prev);
                        const filtered = prev.filter((a) => a !== artworkId);
                        console.log("After removing artwork:", filtered);
                        return filtered;
                      });

                      setSlotArtworkMap((prev) => {
                        const newMap = { ...prev };
                        delete newMap[id];
                        console.log("Updated slotArtworkMap:", newMap);
                        return newMap;
                      });

                      setSelectedSlots((prev) => {
                        const filteredSlots = prev.filter((s) => s !== id);
                        console.log("Updated selectedSlots:", filteredSlots);
                        return filteredSlots;
                      });
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
                setExhibitType(value);
                if (value === "solo") setCollaborators([]);
                setTimeout(distributeSlots, 0);
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
              artworks={artworks}
              selectedArtworks={selectedArtworks}
              handleArtworkSelect={(artworkId: string) => {
                const currentUserIdForSelection =
                  currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id);
                if (!currentUserIdForSelection) return;

                const currentUserIdStr = currentUserIdForSelection.toString();
                const availableUserSlots = Object.entries(slotOwnerMap)
                  .filter(
                    ([slotId, userId]) => userId.toString() === currentUserIdStr && !slotArtworkMap[Number(slotId)]
                  )
                  .map(([slotId]) => Number(slotId));

                if (selectedArtworks.includes(artworkId)) {
                  toast.error("Artwork already selected", { closeButton: true });
                  return;
                }

                const availableSlot = availableUserSlots[0];
                if (!availableSlot) {
                  toast.error("No available slots", { closeButton: true });
                  return;
                }

                setSlotArtworkMap((prev) => ({ ...prev, [availableSlot]: artworkId }));
                if (!selectedSlots.includes(availableSlot)) setSelectedSlots((prev) => [...prev, availableSlot]);
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
        collaborators={collaborators}
      />
    </div>
  );
};

export default EditExhibit;
