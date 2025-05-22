import React from "react";
import { ViewMode, Artist, SubmissionStatus } from "../components/types";
import { Avatar } from "@/components/ui/avatar";
import { User } from "@/hooks/users/useUserQuery";
interface ModeStatusDisplayProps {
  viewMode: ViewMode;
  collaborators: User[];
  getCollaboratorSubmissionStatus: (id: string) => SubmissionStatus;
}

const ModeStatusDisplay: React.FC<ModeStatusDisplayProps> = ({
  viewMode,
  collaborators,
  getCollaboratorSubmissionStatus,
}) => {
  // Get the status message for the current mode
  const getModeStatusMessage = () => {
    if (viewMode === "review") {
      return "You are reviewing this collaborative exhibit before publishing.";
    }

    if (viewMode === "monitoring") {
      // Calculate overall progress
      const collaboratorStatuses = collaborators.map((c) => getCollaboratorSubmissionStatus(c.id));
      const totalSlots = collaboratorStatuses.reduce((sum, status) => sum + status.total, 0);
      const filledSlots = collaboratorStatuses.reduce((sum, status) => sum + status.filled, 0);
      const overallPercentage = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

      return `Monitoring progress: ${filledSlots}/${totalSlots} slots filled (${overallPercentage}% complete)`;
    }

    if (viewMode === "preview") {
      return "Preview of exhibit that is ready for publishing.";
    }

    return "";
  };

  if (!["review", "monitoring", "preview"].includes(viewMode)) {
    return null;
  }

  return (
    <div
      className={`rounded-md p-4 mb-6 ${
        viewMode === "review"
          ? "bg-amber-50 border border-amber-200"
          : viewMode === "monitoring"
          ? "bg-blue-50 border border-blue-200"
          : "bg-green-50 border border-green-200"
      }`}
    >
      <h2 className="text-sm font-medium mb-1">
        {viewMode === "review" ? "Review Mode" : viewMode === "monitoring" ? "Monitoring Mode" : "Preview Mode"}
      </h2>
      <p className="text-xs">{getModeStatusMessage()}</p>

      {/* Show collaborator status in monitoring mode */}
      {viewMode === "monitoring" && collaborators.length > 0 && (
        <div className="mt-3 space-y-2">
          <h3 className="text-xs font-medium">Collaborator Submissions:</h3>
          {collaborators.map((collaborator) => {
            const status = getCollaboratorSubmissionStatus(collaborator.id);
            return (
              <div key={collaborator.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <img src={collaborator.profile_picture} alt={collaborator.first_name} />
                  </Avatar>
                  <span className="text-xs">{collaborator.first_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px]">
                    <span>
                      {status.filled}/{status.total}
                    </span>
                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${status.percentage === 100 ? "bg-green-500" : "bg-amber-500"}`}
                        style={{ width: `${status.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModeStatusDisplay;
