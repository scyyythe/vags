import { useToast } from "@/components/ui/use-toast"
import type { Environment } from "@/components/types"

export const createEnvironmentHandlers = (
  environments: Environment[],
  collaborators: any[],
  setSelectedEnvironment: (id: number) => void,
  setBannerImage: (image: string) => void,
  setBannerFile: (file: File | null) => void,
  distributeSlots: () => void,
  setExhibitType: (type: string) => void,
  setCollaborators: (collaborators: any[]) => void,
) => {
  // Handle environment change
  const handleEnvironmentChange = (envId: number) => {
    const selectedEnv = environments.find((env) => env.id === envId)
    const totalParticipants = collaborators.length + 1
    const { toast: toastHook } = useToast()

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
    setBannerImage(selectedEnv.image)
    setBannerFile(null)
    distributeSlots()
  }

  // Handle exhibit type change
  const handleExhibitTypeChange = (value: string) => {
    if (value) {
      setExhibitType(value)

      if (value === "solo") {
        setCollaborators([])
        distributeSlots()
      }
    }
  }

  return {
    handleEnvironmentChange,
    handleExhibitTypeChange,
  }
}
