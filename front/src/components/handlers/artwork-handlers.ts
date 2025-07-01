import { useToast } from "@/components/ui/use-toast"
import { getLoggedInUserId } from "@/auth/decode"
import type { User } from "@/hooks/users/useUserQuery"

export const createArtworkHandlers = (
  viewMode: string,
  currentUser: User | undefined,
  currentCollaborator: User | null,
  slotOwnerMap: Record<number, string>,
  slotArtworkMap: Record<number, string>,
  selectedArtworks: string[],
  selectedSlots: number[],
  setSlotArtworkMap: (fn: (prev: Record<number, string>) => Record<number, string>) => void,
  setSelectedSlots: (fn: (prev: number[]) => number[]) => void,
  setSelectedArtworks: (fn: (prev: string[]) => string[]) => void,
) => {
  const handleArtworkSelect = (artworkId: string) => {
    const currentUserId = getLoggedInUserId() ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id)
    if (!currentUserId) return

    const currentUserIdStr = currentUserId.toString()
    const { toast: toastHook } = useToast()

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

  const handleSlotSelect = (slotId: number) => {
    const { toast: toastHook } = useToast()
    const currentUserId = getLoggedInUserId() ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id)
    if (!currentUserId) return

    if (slotOwnerMap[slotId] !== currentUserId.toString()) {
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
        setSlotArtworkMap(() => newSlotArtworkMap)
      }

      setSelectedSlots((prev) => prev.filter((id) => id !== slotId))
    } else {
      setSelectedSlots((prev) => [...prev, slotId])
    }
  }

  // Handle clearing a slot
  const handleClearSlot = (slotId: number) => {
    const currentUserId = getLoggedInUserId() ?? (viewMode === "owner" ? currentUser?.id : currentCollaborator?.id)
    if (!currentUserId) return

    if (slotOwnerMap[slotId] !== currentUserId) {
      return
    }

    const artworkId = slotArtworkMap[slotId]
    if (artworkId) {
      setSelectedArtworks((prev) => prev.filter((id) => id !== artworkId))

      const newSlotArtworkMap = { ...slotArtworkMap }
      delete newSlotArtworkMap[slotId]
      setSlotArtworkMap(() => newSlotArtworkMap)
    }
  }

  return {
    handleArtworkSelect,
    handleSlotSelect,
    handleClearSlot,
  }
}
