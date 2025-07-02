import type { User } from "@/hooks/users/useUserQuery"
import type { SubmissionStatus } from "../components/types"
import { slotColorSchemes } from "./exhibit-constants"

export const getSlotColor = (
  slotId: number,
  exhibitType: string,
  slotOwnerMap: Record<number, string>,
  currentUser: User | undefined,
  collaborators: User[],
) => {
  if (exhibitType === "solo") return "border-gray-200"

  const ownerId = slotOwnerMap[slotId.toString()]
  if (!ownerId) return slotColorSchemes[0]

  const getColorSchemeIndex = (userId: string) => {
    if (userId === String(currentUser?.id)) return 0

    const collaboratorIndex = collaborators.findIndex((c) => String(c.id) === userId)

    return collaboratorIndex + 1
  }

  return slotColorSchemes[getColorSchemeIndex(ownerId)]
}

export const getUserName = (userId: string, currentUser: User | undefined, collaborators: User[]) => {
  if (userId === currentUser?.id?.toString()) return "Your slot"

  const collaborator = collaborators.find((c) => c.id.toString() === userId)
  return collaborator ? `${collaborator.first_name}'s slot` : ""
}

export const canInteractWithSlot = (
  slotId: number,
  isReadOnly: boolean,
  slotOwnerMap: Record<number, string>,
  viewMode: string,
  currentUser: User | undefined,
  currentCollaborator: User | null,
): boolean => {
  if (isReadOnly) return false

  const ownerId = slotOwnerMap[slotId]
  if (!ownerId) return false

  return viewMode === "owner"
    ? ownerId === currentUser?.id?.toString()
    : ownerId === currentCollaborator?.id?.toString()
}

export const getCollaboratorSubmissionStatus = (
  collaboratorId: string,
  slotOwnerMap: Record<number, string>,
  slotArtworkMap: Record<number, string>,
): SubmissionStatus => {
  const collaboratorSlots = Object.entries(slotOwnerMap)
    .filter(([_, userId]) => userId === collaboratorId)
    .map(([slotId]) => Number(slotId))

  const filledSlots = collaboratorSlots.filter((slotId) => slotArtworkMap[slotId])

  return {
    total: collaboratorSlots.length,
    filled: filledSlots.length,
    percentage: collaboratorSlots.length > 0 ? Math.round((filledSlots.length / collaboratorSlots.length) * 100) : 0,
  }
}
