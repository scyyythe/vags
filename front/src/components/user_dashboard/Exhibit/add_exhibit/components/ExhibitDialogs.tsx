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
        <AlertDialogContent className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs text-center text-gray-900 dark:text-gray-100">{removeCollaboratorText}</AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-center text-gray-600 dark:text-gray-300">
              {areYouSureRemoveText}{" "}
              {collaboratorToRemove
                ? `${collaboratorToRemove.first_name || ""} ${collaboratorToRemove.last_name || ""}`.trim()
                : ""}{" "}
              {fromThisExhibitText}
              <br />
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {slotAssignmentsRedistributedText}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="w-full flex justify-between gap-4">
              <AlertDialogCancel className="w-full rounded-full text-[10px] h-7 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">{cancelText}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-700 w-full rounded-full hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white text-[10px] h-7"
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
        <AlertDialogContent className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm text-center text-gray-900 dark:text-gray-100">{sendInvitationsText}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-center text-gray-600 dark:text-gray-300">
              {sendInvitationsToText} {collaborators.length} {collaborators.length > 1 ? collaboratorsText : collaboratorText}? {theyWillBeNotifiedText}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="w-full flex justify-between gap-4">
              <AlertDialogCancel className="w-full rounded-full text-[10px] h-7 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">{cancelText}</AlertDialogCancel>
              <AlertDialogAction
                className="w-full bg-red-700 rounded-full hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white text-[10px] h-7"
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
