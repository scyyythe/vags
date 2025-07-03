import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import AddArtistDialog from "@/components/user_dashboard/Exhibit/add_exhibit/components/AddArtistDialog"
import Header from "@/components/user_dashboard/navbar/Header"

// Import new components
import BannerUpload from "./components/BannerUpload"
import EnvironmentSelector from "./components/EnvironmentSelector"
import ExhibitSlots from "./components/ExhibitSlots"
import ExhibitFormFields from "./components/ExhibitFormFields"
import ArtworkSelector from "./components/ArtworkSelector"
import ModeStatusDisplay from "./components/ModeStatusDisplay"
import CollaboratorNotice from "./components/CollaboratorNotice"
import ExhibitDialogs from "./components/ExhibitDialogs"
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks"
import { getLoggedInUserId } from "@/auth/decode"

import type { ViewMode } from "./components/types"
import useUserQuery from "@/hooks/users/useUserQuery"
import type { User } from "@/hooks/users/useUserQuery"

import { useCreateExhibit } from "@/hooks/mutate/exhibit/AddExhibit"

// Import extracted constants and data
import { slotColorSchemes, colorNames } from "@/components/constants/slot-color-schemes"
import { mockExhibitData } from "@/components/data/mock-exhibit-data"
import { environments } from "@/components/data/environments-data"

// Import extracted utilities
import {
  getSlotColor,
  getUserName,
  canInteractWithSlot,
  getCollaboratorSubmissionStatus,
} from "@/utils/exhibit-helpers"

// Import extracted handlers
import { createSubmitHandler } from "@/components/handlers/submit-handlers"

const AddExhibit = () => {
  const navigate = useNavigate()
  const { toast: toastHook } = useToast()
  const { exhibitId } = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const mode = queryParams.get("mode") || ""

  // State variables
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [exhibitType, setExhibitType] = useState("solo")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null)
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([])
  const [selectedSlots, setSelectedSlots] = useState<number[]>([])
  const [slotArtworkMap, setSlotArtworkMap] = useState<Record<number, string>>({})
  const [isAddArtistDialogOpen, setIsAddArtistDialogOpen] = useState(false)
  const [collaborators, setCollaborators] = useState<User[]>([])
  const [slotOwnerMap, setSlotOwnerMap] = useState<Record<number, string>>({})

  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  const [isRemoveCollaboratorDialogOpen, setIsRemoveCollaboratorDialogOpen] = useState(false)
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<User | null>(null)
  const [artworkStyle, setArtworkStyle] = useState("")

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("owner")
  const [currentCollaborator, setCurrentCollaborator] = useState<User | null>(null)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const currentUserId = getLoggedInUserId()
  const { data: artworks = [] } = useArtworks(
    1,
    currentUserId ?? undefined,
    !!currentUserId,
    "created-by-me",
    "public",
    true,
  )
  const { data: currentUser, isLoading } = useUserQuery(currentUserId ?? "")

  useEffect(() => {
    console.log("Fetched artworks:", artworks)
  }, [artworks])

  // Function to distribute slots among participants
  const distributeSlots = () => {
    if (!selectedEnvironment || !currentUser?.id) return

    const currentEnvironment = environments.find((env) => env.id === selectedEnvironment)
    if (!currentEnvironment) return

    const totalSlots = currentEnvironment.slots

    // Reset all related slot selections
    setSelectedSlots([])
    setSelectedArtworks([])
    setSlotArtworkMap({})

    const newSlotOwnerMap: Record<number, string> = {}

    if (exhibitType === "solo") {
      // Solo exhibit: curator gets all slots
      for (let i = 1; i <= totalSlots; i++) {
        newSlotOwnerMap[i] = currentUser.id.toString()
      }
    } else {
      // Collaborative exhibit: fair distribution
      const participants = [currentUser, ...collaborators]
      const totalParticipants = participants.length

      const baseSlots = Math.floor(totalSlots / totalParticipants)
      let remaining = totalSlots % totalParticipants

      let slotId = 1

      for (const participant of participants) {
        let slotsForThisUser = baseSlots
        if (remaining > 0) {
          slotsForThisUser += 1
          remaining--
        }

        for (let j = 0; j < slotsForThisUser; j++) {
          if (slotId <= totalSlots) {
            newSlotOwnerMap[slotId] = participant.id.toString()
            slotId++
          }
        }
      }
    }

    setSlotOwnerMap(newSlotOwnerMap)
  }

  // Handle artwork selection - ORIGINAL LOGIC
  const handleArtworkSelect = (artworkId: string) => {
    const currentUserIdForSelection =
      currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id)
    if (!currentUserIdForSelection) return

    const currentUserIdStr = currentUserIdForSelection.toString()

    // Filter slots owned by current user that don't have artwork assigned yet
    const availableUserSlots = Object.entries(slotOwnerMap)
      .filter(([slotId, userId]) => userId.toString() === currentUserIdStr && !slotArtworkMap[Number(slotId)])
      .map(([slotId]) => Number(slotId))

    if (selectedArtworks.includes(artworkId)) {
      toastHook({
        title: "Artwork already selected",
        description: "This artwork has already been assigned to a slot.",
        variant: "destructive",
      })
      return
    }

    const availableSlot = availableUserSlots[0]

    if (!availableSlot) {
      toastHook({
        title: "No available slots",
        description: "You don't have any available slots for more artwork.",
        variant: "destructive",
      })
      return
    }

    setSlotArtworkMap((prev) => ({
      ...prev,
      [availableSlot]: artworkId,
    }))

    if (!selectedSlots.includes(availableSlot)) {
      setSelectedSlots((prev) => [...prev, availableSlot])
    }

    setSelectedArtworks((prev) => [...prev, artworkId])
  }

  // Handle slot selection - ORIGINAL LOGIC
  const handleSlotSelect = (slotId: number) => {
    const currentUserIdForSelection =
      currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id)
    if (!currentUserIdForSelection) return

    if (slotOwnerMap[slotId] !== currentUserIdForSelection.toString()) {
      toastHook({
        title: "Access denied",
        description: "This slot is assigned to another participant.",
        variant: "destructive",
      })
      return
    }

    // If slot is already selected, toggle it off
    if (selectedSlots.includes(slotId)) {
      const newSlotArtworkMap = { ...slotArtworkMap }
      const artworkId = newSlotArtworkMap[slotId]

      if (artworkId) {
        setSelectedArtworks((prev) => prev.filter((id) => id !== artworkId))
        delete newSlotArtworkMap[slotId]
        setSlotArtworkMap(newSlotArtworkMap)
      }

      setSelectedSlots((prev) => prev.filter((id) => id !== slotId))
    } else {
      setSelectedSlots((prev) => [...prev, slotId])
    }
  }

  // Handle clearing a slot - ORIGINAL LOGIC
  const handleClearSlot = (slotId: number) => {
    const currentUserIdForSelection =
      currentUserId ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id)
    if (!currentUserIdForSelection) return

    if (slotOwnerMap[slotId] !== currentUserIdForSelection.toString()) {
      return
    }

    const artworkId = slotArtworkMap[slotId]
    if (artworkId) {
      setSelectedArtworks((prev) => prev.filter((id) => id !== artworkId))

      const newSlotArtworkMap = { ...slotArtworkMap }
      delete newSlotArtworkMap[slotId]
      setSlotArtworkMap(newSlotArtworkMap)
    }
  }

  // Handle environment change - ORIGINAL LOGIC
  const handleEnvironmentChange = (envId: number) => {
    const selectedEnv = environments.find((env) => env.id === envId)
    const totalParticipants = collaborators.length + 1

    if (!selectedEnv) return

    if (selectedEnv.slots < totalParticipants) {
      toastHook({
        title: "Not enough slots to assign for all collaborators and the owner.",
        description: "Please select a virtual environment with more available slots.",
        className: "text-red-600",
        duration: 4000,
      })
      return
    }

    setSelectedEnvironment(envId)
    // setBannerImage(selectedEnv.image)
    setBannerFile(null)

    // Call distributeSlots after state is set
    setTimeout(() => {
      distributeSlots()
    }, 0)
  }

  // Load exhibit data based on exhibitId and mode
  useEffect(() => {
    if (exhibitId && mockExhibitData[Number(exhibitId)]) {
      const exhibitData = mockExhibitData[Number(exhibitId)]

      if (mode === "review") {
        setViewMode("review")
        setIsReadOnly(true)
      } else if (mode === "monitoring") {
        setViewMode("monitoring")
        setIsReadOnly(true)
      } else if (mode === "preview") {
        setViewMode("preview")
        setIsReadOnly(true)
      }

      // Populate form with exhibit data
      setTitle(exhibitData.title)
      setCategory(exhibitData.category)
      setArtworkStyle(exhibitData.artworkStyle.toLowerCase())
      setExhibitType(exhibitData.exhibitType)
      setStartDate(exhibitData.startDate)
      setEndDate(exhibitData.endDate)
      setDescription(exhibitData.description)
      setSelectedEnvironment(exhibitData.selectedEnvironment)
      setBannerImage(exhibitData.bannerImage)
      setCollaborators(exhibitData.collaborators)
      setSlotOwnerMap(exhibitData.slotOwnerMap)
      setSlotArtworkMap(exhibitData.slotArtworkMap)

      // Mark selected artworks
      const selectedIds = Object.values(exhibitData.slotArtworkMap) as string[]
      setSelectedArtworks(selectedIds)

      // Mark selected slots
      const selectedSlotIds = Object.keys(exhibitData.slotArtworkMap).map(Number)
      setSelectedSlots(selectedSlotIds)
    } else {
      // For demo purposes: toggle collaborator view
      const urlParams = new URLSearchParams(window.location.search)
      const collaboratorId = urlParams.get("collaborator")

      if (collaboratorId) {
        const collab = collaborators.find((c) => c.id.toString() === collaboratorId)

        if (collab) {
          setViewMode("collaborator")
          setCurrentCollaborator(collab)
        }
      }
    }
  }, [exhibitId, mode, collaborators])

  useEffect(() => {
    if (selectedEnvironment) {
      distributeSlots()
    }
  }, [selectedEnvironment, exhibitType, collaborators])

  const createExhibitMutation = useCreateExhibit()

  // Create handlers
  const submitHandlers = createSubmitHandler(
    navigate,
    toastHook,
    createExhibitMutation,
    viewMode,
    exhibitType,
    collaborators,
    // setShowNotificationDialog,
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
  )

  // Handle adding a collaborator - ORIGINAL LOGIC
  const handleAddCollaborator = (artist: User) => {
    if (collaborators.length >= 5) {
      toastHook({
        title: "Maximum collaborators reached",
        description: "You can only add up to 5 collaborators.",
        variant: "destructive",
      })
      return
    }

    setCollaborators((prev) => [...prev, artist])

    // Call distributeSlots after adding collaborator
    setTimeout(() => {
      distributeSlots()
    }, 0)
  }

  // Handle removing a collaborator - ORIGINAL LOGIC
  const handleRemoveCollaborator = (artist: User) => {
    setCollaboratorToRemove(artist)
    setIsRemoveCollaboratorDialogOpen(true)
  }

  const confirmRemoveCollaborator = () => {
    if (!collaboratorToRemove) return

    setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorToRemove.id))

    setIsRemoveCollaboratorDialogOpen(false)
    setCollaboratorToRemove(null)

    setTimeout(() => {
      distributeSlots()
    }, 0)
  }

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
                    artworks={artworks}
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
                        const encodedSlotMap = encodeURIComponent(JSON.stringify(slotArtworkMap))
                        const encodedArtworks = encodeURIComponent(
                          JSON.stringify(
                            artworks
                              .filter((a) => selectedArtworks.includes(a.id.toString()))
                              .map((a) => ({
                                id: a.id.toString(),
                                image_url: a.image_url,
                                title: a.title || "Untitled",
                                artist: a.artist || "Unknown",
                              })),
                          ),
                        )

                        navigate(`/gallery3d-preview?slotMap=${encodedSlotMap}&artworks=${encodedArtworks}`)
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
                setExhibitType(value)
                if (value === "solo") {
                  setCollaborators([])
                }
                // Call distributeSlots after state updates
                setTimeout(() => {
                  distributeSlots()
                }, 0)
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
        // showNotificationDialog={showNotificationDialog}
        // setShowNotificationDialog={setShowNotificationDialog}
        // sendNotificationsToCollaborators={submitHandlers.sendNotificationsToCollaborators}
        collaborators={collaborators}
      />
    </div>
  )
}

export default AddExhibit
