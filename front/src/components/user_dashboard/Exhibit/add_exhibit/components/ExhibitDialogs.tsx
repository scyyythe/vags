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

interface ExhibitDialogsProps {
  isRemoveCollaboratorDialogOpen: boolean;
  setIsRemoveCollaboratorDialogOpen: (open: boolean) => void;
  collaboratorToRemove: Artist | null;
  confirmRemoveCollaborator: () => void;
  showNotificationDialog: boolean;
  setShowNotificationDialog: (open: boolean) => void;
  sendNotificationsToCollaborators: () => void;
  collaborators: Artist[];
}

const ExhibitDialogs: React.FC<ExhibitDialogsProps> = ({
  isRemoveCollaboratorDialogOpen,
  setIsRemoveCollaboratorDialogOpen,
  collaboratorToRemove,
  confirmRemoveCollaborator,
  showNotificationDialog,
  setShowNotificationDialog,
  sendNotificationsToCollaborators,
  collaborators
}) => {
  return (
    <>
      {/* Confirm Remove Collaborator Dialog */}
      <AlertDialog 
        open={isRemoveCollaboratorDialogOpen} 
        onOpenChange={setIsRemoveCollaboratorDialogOpen}
      >
        <AlertDialogContent className="w-full max-w-sm rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs text-center">Remove Collaborator</AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-center">
              Are you sure you want to remove {collaboratorToRemove?.name} from this exhibit?
              Their slot assignments will be redistributed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="w-full flex justify-between px-20">
              <AlertDialogCancel className="text-[10px] h-7">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-700 hover:bg-red-600 text-white text-[10px] h-7"
                onClick={confirmRemoveCollaborator}
              >
                Remove
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Notifications Dialog */}
      <AlertDialog 
        open={showNotificationDialog} 
        onOpenChange={setShowNotificationDialog}
      >
        <AlertDialogContent className="w-full max-w-sm rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm text-center">Send Invitations</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-center">
              Send invitations to {collaborators.length} collaborator{collaborators.length > 1 ? 's' : ''}? 
              They will be notified to select their artwork for their assigned slots.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="w-full flex justify-between px-20">
              <AlertDialogCancel className="text-[10px] h-7">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-700 hover:bg-red-600 text-white text-[10px] h-7"
                onClick={sendNotificationsToCollaborators}
              >
                Send
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExhibitDialogs;
