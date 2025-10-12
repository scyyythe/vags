import type React from "react";
import type { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { useCreateExhibit } from "@/hooks/mutate/exhibit/AddExhibit";
import type { ExhibitPayload } from "@/hooks/mutate/exhibit/exhibit";
import { sendCollaboratorNotifications, showCollaboratorNotification } from "@/utils/notificationUtils";
import type { User } from "@/hooks/users/useUserQuery";

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
  slotOwnerMap: Record<number, string>
) => {
  const completeExhibitSubmission = () => {
    const formattedExhibitType = exhibitType.toLowerCase() === "solo" ? "Solo" : "Collaborative";
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
    };

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
  };

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
    e.preventDefault();

    if (viewMode === "review" || viewMode === "monitoring" || viewMode === "preview") {
      navigate("/exhibits");
      return;
    }

    if (viewMode === "owner") {
      // Validate required fields before submission
      if (!bannerFile) {
        toast.error("Banner is required", {
          description: "Please upload a banner image for your exhibit.",
          closeButton: true,
        });
        return;
      }

      if (!title.trim()) {
        toast.error("Title is required", {
          description: "Please enter a title for your exhibit.",
          closeButton: true,
        });
        return;
      }

      if (title.trim().length < 3) {
        toast.error("Title too short", {
          description: "Title must be at least 3 characters long.",
          closeButton: true,
        });
        return;
      }

      if (title.trim().length > 100) {
        toast.error("Title too long", {
          description: "Title must be less than 100 characters.",
          closeButton: true,
        });
        return;
      }

      if (!artworkStyle.trim()) {
        toast.error("Artwork style is required", {
          description: "Please select an artwork style for your exhibit.",
          closeButton: true,
        });
        return;
      }

      if (!description.trim()) {
        toast.error("Description is required", {
          description: "Please enter a description for your exhibit.",
          closeButton: true,
        });
        return;
      }

      if (description.trim().length < 10) {
        toast.error("Description too short", {
          description: "Description must be at least 10 characters long.",
          closeButton: true,
        });
        return;
      }

      if (description.trim().length > 1000) {
        toast.error("Description too long", {
          description: "Description must be less than 1000 characters.",
          closeButton: true,
        });
        return;
      }

      if (!startDate) {
        toast.error("Start date is required", {
          description: "Please select a start date for your exhibit.",
          closeButton: true,
        });
        return;
      }

      if (!endDate) {
        toast.error("End date is required", {
          description: "Please select an end date for your exhibit.",
          closeButton: true,
        });
        return;
      }

      // Date validation
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (startDateObj < today) {
        toast.error("Invalid start date", {
          description: "Start date cannot be in the past.",
          closeButton: true,
        });
        return;
      }

      if (endDateObj < today) {
        toast.error("Invalid end date", {
          description: "End date cannot be in the past.",
          closeButton: true,
        });
        return;
      }

      if (endDateObj <= startDateObj) {
        toast.error("Invalid date range", {
          description: "End date must be after the start date.",
          closeButton: true,
        });
        return;
      }

      if (!selectedEnvironment) {
        toast.error("Environment is required", {
          description: "Please select a virtual environment for your exhibit.",
          closeButton: true,
        });
        return;
      }

      if (exhibitType === "collab" && collaborators.length > 0) {
        // setShowNotificationDialog(true)
        completeExhibitSubmission();
        return;
      }

      completeExhibitSubmission();
    } else if (viewMode === "collaborator") {
      toast.success("Selections Saved", {
        description: "Your artwork selections have been saved to the exhibit!",
        closeButton: true,
      });

      navigate("/exhibits");
    }
  };

  return {
    handleSubmit,
    completeExhibitSubmission,
    // sendNotificationsToCollaborators,
  };
};
