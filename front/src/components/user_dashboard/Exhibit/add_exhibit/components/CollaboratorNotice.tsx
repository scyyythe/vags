import React from "react";
import { ViewMode } from "../components/types";

interface CollaboratorNoticeProps {
  viewMode: ViewMode;
  currentCollaborator: { name: string } | null;
  title: string;
}

const CollaboratorNotice: React.FC<CollaboratorNoticeProps> = ({
  viewMode,
  currentCollaborator,
  title
}) => {
  if (viewMode !== 'collaborator') return null;

  return (
    <div className="bg-[#9b87f5]/10 border border-[#9b87f5] rounded-md p-4 mb-6">
      <h2 className="text-xs font-medium mb-2">
        {currentCollaborator?.name}, you've been invited to collaborate!
      </h2>
      <p className="text-xs">
        You are invited to contribute to "{title || 'Untitled Exhibit'}". 
        Select your artwork for the slots assigned to you below.
      </p>
    </div>
  );
};

export default CollaboratorNotice;
