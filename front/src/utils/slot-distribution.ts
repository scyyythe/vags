import type { User } from "@/hooks/users/useUserQuery"
import type { Environment } from "../components/types"

export const distributeSlots = (
  selectedEnvironment: number | null,
  currentUser: User | undefined,
  environments: Environment[],
  exhibitType: string,
  collaborators: User[],
  setSelectedSlots: (slots: number[]) => void,
  setSelectedArtworks: (artworks: string[]) => void,
  setSlotArtworkMap: (map: Record<number, string>) => void,
  setSlotOwnerMap: (map: Record<number, string>) => void,
) => {
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
