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
  setShowNotificationDialog: ((show: boolean) => void) | undefined,
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
  exhibitId?: string, // Add exhibit ID to detect edit mode
  bannerImage?: string | null // Add existing banner image for edit mode
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

  const sendNotificationsToCollaborators = () => {
    // Notifications are now handled by the backend when the exhibit is created
    // We just need to show a success message and complete the submission
    if (collaborators.length > 0) {
      toast.success("Invitations Sent", {
        description: `Invitations have been sent to ${collaborators.length} collaborator${
          collaborators.length > 1 ? "s" : ""
        }.`,
        closeButton: true,
      });
    }

    completeExhibitSubmission();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (viewMode === "review" || viewMode === "monitoring" || viewMode === "preview") {
      navigate("/exhibits");
      return;
    }

    if (viewMode === "owner") {
      // Validate required fields before submission
      // For edit mode, we need to ensure banner and artwork style are properly set
      if (!bannerFile && !exhibitId) {
        toast.error("Banner is required", {
          description: "Please upload a banner image for your exhibit.",
          closeButton: true,
        });
        return;
      }

      // For edit mode, check if we have banner data (either file or existing)
      if (exhibitId && !bannerFile && !bannerImage) {
        toast.error("Banner is required", {
          description: "Please ensure your exhibit has a banner image.",
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
        // Show notification dialog for collaborative exhibits
        // Note: setShowNotificationDialog is passed as parameter
        if (typeof setShowNotificationDialog === "function") {
          setShowNotificationDialog(true);
        } else {
          // Fallback: complete submission directly
          completeExhibitSubmission();
        }
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
    sendNotificationsToCollaborators,
  };
};
