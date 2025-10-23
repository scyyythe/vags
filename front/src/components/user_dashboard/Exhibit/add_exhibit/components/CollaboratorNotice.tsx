import React from "react";
import { ViewMode } from "../components/types";
import { User } from "@/hooks/users/useUserQuery";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
interface CollaboratorNoticeProps {
  viewMode: ViewMode;
  currentCollaborator: User | null;
  title: string;
}

const CollaboratorNotice: React.FC<CollaboratorNoticeProps> = ({ viewMode, currentCollaborator, title }) => {
  const { language } = useLanguage();

  // Translation hooks for all text content
  const invitedToCollaborateText = useAutoTranslation("you've been invited to collaborate!", language);
  const youAreInvitedText = useAutoTranslation("You are invited to contribute to", language);
  const untitledExhibitText = useAutoTranslation("Untitled Exhibit", language);
  const selectArtworkText = useAutoTranslation("Select your artwork for the slots assigned to you below.", language);

  // Translate the exhibit title
  const translatedTitle = useAutoTranslation(title || "Untitled Exhibit", language);

  if (viewMode !== "collaborator") return null;

  return (
    <div className="bg-[#9b87f5]/10 dark:bg-[#9b87f5]/20 border border-[#9b87f5] dark:border-[#9b87f5]/60 rounded-md p-4 mb-6">
      <h2 className="text-xs font-medium mb-2 text-gray-900 dark:text-gray-100">
        {currentCollaborator?.first_name}, {invitedToCollaborateText}
      </h2>
      <p className="text-[10px] text-gray-700 dark:text-gray-300">
        {youAreInvitedText} "{translatedTitle}". {selectArtworkText}
      </p>
    </div>
  );
};

export default CollaboratorNotice;
