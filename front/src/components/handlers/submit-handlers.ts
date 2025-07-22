import type React from "react"
import type { useNavigate } from "react-router-dom"
import { toast } from "sonner";
import type { useCreateExhibit } from "@/hooks/mutate/exhibit/AddExhibit"
import type { ExhibitPayload } from "@/hooks/mutate/exhibit/exhibit"
import { sendCollaboratorNotifications, showCollaboratorNotification } from "@/utils/notificationUtils"
import type { User } from "@/hooks/users/useUserQuery"

export const createSubmitHandler = (
  navigate: ReturnType<typeof useNavigate>,
  createExhibitMutation: ReturnType<typeof useCreateExhibit>,
  viewMode: string,
  exhibitType: string,
  collaborators: User[],
  // setShowNotificationDialog: (show: boolean) => void,
  // Form data
  title: string,
  artworkStyle: string,
  description: string,
  currentUserId: string | null,
  startDate: string,
  endDate: string,
  selectedEnvironment: number | null,
  selectedArtworks: string[],
  bannerFile: File | null,
  slotArtworkMap: Record<number, string>,
  slotOwnerMap: Record<number, string>,
) => {
  const completeExhibitSubmission = () => {
    const formattedExhibitType = exhibitType.toLowerCase() === "solo" ? "Solo" : "Collaborative"
    const payload: ExhibitPayload = {
      title,
      category: artworkStyle,
      description,
      owner: currentUserId?.toString() ?? "",
      exhibit_type: formattedExhibitType,
      start_time: startDate,
      end_time: endDate,
      chosen_env: selectedEnvironment?.toString() ?? "",
      artworks: selectedArtworks,
      collaborators: collaborators.map((user) => user.id),
      banner: bannerFile,
      slot_artwork_map: slotArtworkMap,
      slot_owner_map: slotOwnerMap,
    }


    createExhibitMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Exhibit Created", {
          description: "Your exhibit has been successfully created!",
          closeButton: true,
        });
        navigate("/exhibits");
      },
      onError: (error) => {
        toast.error("Failed to create exhibit", {
          description: error?.message || "Unknown error",
          closeButton: true,
        });
      },
    });
  }

  // const sendNotificationsToCollaborators = () => {
  //   const notificationsToSend = collaborators.map((collab) => ({
  //     collaboratorId: collab.id,
  //     collaboratorName: collab.first_name,
  //     exhibitId: Math.floor(Math.random() * 1000) + 1,
  //     exhibitTitle: title || "Untitled Exhibit",
  //   }))

  //   const count = sendCollaboratorNotifications(notificationsToSend)
  //   showCollaboratorNotification(count)

  //   setShowNotificationDialog(false)
  //   completeExhibitSubmission()
  // }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("📨 Submit triggered - ViewMode:", viewMode, "| ExhibitType:", exhibitType)

    if (viewMode === "review" || viewMode === "monitoring" || viewMode === "preview") {
      navigate("/exhibits")
      return
    }

    if (viewMode === "owner") {
      if (exhibitType === "collab" && collaborators.length > 0) {
        console.log("👥 Collaborative exhibit detected. Proceeding to submit.")
        // setShowNotificationDialog(true)
        completeExhibitSubmission()
        return
      }

      completeExhibitSubmission()
    } else if (viewMode === "collaborator") {
      toast.success("Selections Saved", {
        description: "Your artwork selections have been saved to the exhibit!",
        closeButton: true,
      });

      navigate("/exhibits")
    }
  }

  return {
    handleSubmit,
    completeExhibitSubmission,
    // sendNotificationsToCollaborators,
  }
}
