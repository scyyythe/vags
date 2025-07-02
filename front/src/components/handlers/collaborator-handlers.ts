import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/hooks/users/useUserQuery"

export const createCollaboratorHandlers = (
  collaborators: User[],
  setCollaborators: (fn: (prev: User[]) => User[]) => void,
  setCollaboratorToRemove: (user: User | null) => void,
  setIsRemoveCollaboratorDialogOpen: (open: boolean) => void,
  distributeSlots: () => void,
) => {
  // Handle adding a collaborator
  const handleAddCollaborator = (artist: User) => {
    const { toast: toastHook } = useToast()
    if (collaborators.length >= 5) {
      toastHook({
        title: "Maximum collaborators reached",
        description: "You can only add up to 5 collaborators.",
        variant: "destructive",
      })
      return
    }

    setCollaborators((prev) => [...prev, artist])
    distributeSlots()
  }

  // Handle removing a collaborator
  const handleRemoveCollaborator = (artist: User) => {
    setCollaboratorToRemove(artist)
    setIsRemoveCollaboratorDialogOpen(true)
  }

  const confirmRemoveCollaborator = (collaboratorToRemove: User | null) => {
    if (!collaboratorToRemove) return

    setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorToRemove.id))

    setIsRemoveCollaboratorDialogOpen(false)
    setCollaboratorToRemove(null)

    setTimeout(() => {
      distributeSlots()
    }, 0)
  }

  return {
    handleAddCollaborator,
    handleRemoveCollaborator,
    confirmRemoveCollaborator,
  }
}
