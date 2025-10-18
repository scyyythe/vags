import React from "react";
import { Artist } from "../components/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "@/hooks/users/useUserQuery";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
interface ExhibitDialogsProps {
  isRemoveCollaboratorDialogOpen: boolean;
  setIsRemoveCollaboratorDialogOpen: (open: boolean) => void;
  collaboratorToRemove: User | null;
  confirmRemoveCollaborator: () => void;
  showNotificationDialog: boolean;
  setShowNotificationDialog: (open: boolean) => void;
  sendNotificationsToCollaborators: () => void;
  collaborators: User[];
}

const ExhibitDialogs: React.FC<ExhibitDialogsProps> = ({
  isRemoveCollaboratorDialogOpen,
  setIsRemoveCollaboratorDialogOpen,
  collaboratorToRemove,
  confirmRemoveCollaborator,
  showNotificationDialog,
  setShowNotificationDialog,
  sendNotificationsToCollaborators,
  collaborators,
}) => {
  const { language } = useLanguage();

  // Translation hooks for all text content
  const removeCollaboratorText = useAutoTranslation("Remove Collaborator", language);
  const areYouSureRemoveText = useAutoTranslation("Are you sure you want to remove", language);
  const fromThisExhibitText = useAutoTranslation("from this exhibit?", language);
  const slotAssignmentsRedistributedText = useAutoTranslation("Their slot assignments will be redistributed among remaining participants.", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const removeText = useAutoTranslation("Remove", language);
  const sendInvitationsText = useAutoTranslation("Send Invitations", language);
  const sendInvitationsToText = useAutoTranslation("Send invitations to", language);
  const collaboratorText = useAutoTranslation("collaborator", language);
  const collaboratorsText = useAutoTranslation("collaborators", language);
  const theyWillBeNotifiedText = useAutoTranslation("They will be notified to select their artwork for their assigned slots.", language);
  const sendText = useAutoTranslation("Send", language);

  return (
    <>
      {/* Confirm Remove Collaborator Dialog */}
      <AlertDialog open={isRemoveCollaboratorDialogOpen} onOpenChange={setIsRemoveCollaboratorDialogOpen}>
        <AlertDialogContent className="w-full max-w-sm rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs text-center">{removeCollaboratorText}</AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-center">
              {areYouSureRemoveText}{" "}
              {collaboratorToRemove
                ? `${collaboratorToRemove.first_name || ""} ${collaboratorToRemove.last_name || ""}`.trim()
                : ""}{" "}
              {fromThisExhibitText}
              <br />
              <span className="text-amber-600 font-medium">
                {slotAssignmentsRedistributedText}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="w-full flex justify-between gap-4">
              <AlertDialogCancel className="w-full rounded-full text-[10px] h-7">{cancelText}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-700 w-full rounded-full hover:bg-red-600 text-white text-[10px] h-7"
                onClick={confirmRemoveCollaborator}
              >
                {removeText}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Notifications Dialog */}
      <AlertDialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <AlertDialogContent className="w-full max-w-sm rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm text-center">{sendInvitationsText}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-center">
              {sendInvitationsToText} {collaborators.length} {collaborators.length > 1 ? collaboratorsText : collaboratorText}? {theyWillBeNotifiedText}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="w-full flex justify-between px-20">
              <AlertDialogCancel className="text-[10px] h-7">{cancelText}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-700 hover:bg-red-600 text-white text-[10px] h-7"
                onClick={sendNotificationsToCollaborators}
              >
                {sendText}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExhibitDialogs;
