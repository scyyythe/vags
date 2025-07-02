import { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"
import { getLoggedInUserId } from "@/auth/decode"
import type { User } from "@/hooks/users/useUserQuery"
import type { ViewMode, Environment } from "@/components/types"

export const useAddExhibitState = (
  mockExhibitData: Record<number, any>,
  environments: Environment[],
  currentUser: User | undefined,
) => {
  const { exhibitId } = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const mode = queryParams.get("mode") || ""

  // Form state
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [exhibitType, setExhibitType] = useState("solo")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [artworkStyle, setArtworkStyle] = useState("")

  // Environment and artwork state
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null)
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([])
  const [selectedSlots, setSelectedSlots] = useState<number[]>([])
  const [slotArtworkMap, setSlotArtworkMap] = useState<Record<number, string>>({})

  // Banner state
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  // Collaborator state
  const [collaborators, setCollaborators] = useState<User[]>([])
  const [slotOwnerMap, setSlotOwnerMap] = useState<Record<number, string>>({})

  // Dialog state
  const [isAddArtistDialogOpen, setIsAddArtistDialogOpen] = useState(false)
  const [isRemoveCollaboratorDialogOpen, setIsRemoveCollaboratorDialogOpen] = useState(false)
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<User | null>(null)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("owner")
  const [currentCollaborator, setCurrentCollaborator] = useState<User | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)

  const currentUserId = getLoggedInUserId()

  // Load exhibit data effect
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
  }, [exhibitId, mode, collaborators, mockExhibitData])

  // Distribute slots effect
  useEffect(() => {
    if (selectedEnvironment) {
      distributeSlots()
    }
  }, [selectedEnvironment, exhibitType, collaborators])

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
      for (let i = 1; i <= totalSlots; i++) {
        newSlotOwnerMap[i] = currentUser.id.toString()
      }
    } else {
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

  return {
    // Form state
    title,
    setTitle,
    category,
    setCategory,
    exhibitType,
    setExhibitType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    description,
    setDescription,
    artworkStyle,
    setArtworkStyle,

    // Environment and artwork state
    selectedEnvironment,
    setSelectedEnvironment,
    selectedArtworks,
    setSelectedArtworks,
    selectedSlots,
    setSelectedSlots,
    slotArtworkMap,
    setSlotArtworkMap,

    // Banner state
    bannerImage,
    setBannerImage,
    bannerFile,
    setBannerFile,

    // Collaborator state
    collaborators,
    setCollaborators,
    slotOwnerMap,
    setSlotOwnerMap,

    // Dialog state
    isAddArtistDialogOpen,
    setIsAddArtistDialogOpen,
    isRemoveCollaboratorDialogOpen,
    setIsRemoveCollaboratorDialogOpen,
    collaboratorToRemove,
    setCollaboratorToRemove,
    showNotificationDialog,
    setShowNotificationDialog,

    // View mode state
    viewMode,
    setViewMode,
    currentCollaborator,
    setCurrentCollaborator,
    isReadOnly,
    setIsReadOnly,

    // Functions
    distributeSlots,
    currentUserId,
  }
}
