import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ViewMode, Artist, SubmissionStatus } from "../components/types";
import { ART_STYLES } from "@/components/user_dashboard/Explore/create_post/ArtworkStyles";
import { User } from "@/hooks/users/useUserQuery";
interface ExhibitFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  category: string;
  setCategory: (category: string) => void;
  artworkStyle: string;
  setArtworkStyle: (style: string) => void;
  exhibitType: string;
  handleExhibitTypeChange: (value: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  description: string;
  setDescription: (description: string) => void;
  collaborators: User[];
  viewMode: ViewMode;
  isReadOnly: boolean;
  onAddCollaborator: () => void;
  onRemoveCollaborator: (artist: User) => void;
  getCollaboratorSubmissionStatus: (id: string) => SubmissionStatus;
  currentCollaborator: User | null;
  exhibitData?: any;
}

const ExhibitFormFields: React.FC<ExhibitFormFieldsProps> = ({
  title,
  setTitle,
  category,
  setCategory,
  artworkStyle,
  setArtworkStyle,
  exhibitType,
  handleExhibitTypeChange,
  startDate,
  setStartDate,
  endDate,
  exhibitData,
  setEndDate,
  description,
  setDescription,
  collaborators,
  viewMode,
  isReadOnly,
  onAddCollaborator,
  onRemoveCollaborator,
  getCollaboratorSubmissionStatus,
  currentCollaborator,
}) => {
  const isEditMode = !!exhibitData;
  const isSoloOriginal = exhibitData?.isSolo ?? false;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-[11px] font-medium mb-2">
          Exhibit Title
        </label>
        <Input
          id="title"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full focus:outline-none focus:ring-0 h-8"
          readOnly={viewMode === "collaborator" || isReadOnly}
          style={{ fontSize: "10px" }}
          maxLength={100}
        />
        {/* <div className="text-[9px] text-gray-500 mt-1 text-right">{title.length}/100</div> */}
      </div>

      {viewMode === "owner" && !isReadOnly && (
        <div>
          <span className="text-[11px] font-medium mb-2">Exhibit Type</span>
          <ToggleGroup
            type="single"
            value={exhibitType}
            onValueChange={(value) => {
              // Prevent switching from solo to collab in edit mode
              if (isEditMode && isSoloOriginal && value === "collab") {
                return; // Don't allow changing from solo to collaborative
              }
              // Allow changing from collab to solo in edit mode
              if (isEditMode && !isSoloOriginal && value === "solo") {
                handleExhibitTypeChange(value);
                return;
              }

              // Allow all changes in create mode
              if (!isEditMode) {
                handleExhibitTypeChange(value);
              }
            }}
            className="mt-1.5 gap-9"
          >
            <ToggleGroupItem
              value="solo"
              className="w-full text-[10px] border rounded-md h-8"
              disabled={isEditMode && !isSoloOriginal}
            >
              Solo
            </ToggleGroupItem>
            <ToggleGroupItem
              value="collab"
              className="w-full text-[10px] border rounded-md h-8"
              disabled={isEditMode && isSoloOriginal}
            >
              Collaborative
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Show warning message for solo exhibits in edit mode */}
          {isEditMode && isSoloOriginal && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-[10px] text-amber-700">
                <strong>Note:</strong> Solo exhibits cannot be changed to collaborative exhibits. To create a
                collaborative exhibit, please create a new exhibit instead.
              </p>
            </div>
          )}
        </div>
      )}

      {(viewMode !== "owner" || isReadOnly) && (
        <div>
          <label className="block text-[11px] font-medium mb-2">Exhibit Type</label>
          <div className="text-xs text-gray-700 border p-2 rounded">
            {exhibitType === "solo" ? "Solo Exhibition" : "Collaborative Exhibition"}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="style" className="block text-[11px] font-medium mb-2">
            Artwork Style
          </label>
          <div className="relative">
            <select
              id="style"
              value={artworkStyle}
              onChange={(e) => setArtworkStyle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-18 text-[10px] cursor-pointer"
              disabled={viewMode === "collaborator" || isReadOnly}
            >
              <option value="" disabled>
                Select artwork style
              </option>
              {ART_STYLES.map((style) => (
                <option key={style} value={style.toLowerCase()}>
                  {style}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www3.org/2000/svg">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium mb-2">Duration</label>
        <div className="flex items-center space-x-4">
          <div className="w-full">
            <div className="text-[10px] text-gray-500 mb-1">Start Date</div>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-8"
              readOnly={viewMode === "collaborator" || isReadOnly}
              style={{ fontSize: "10px" }}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex items-center relative top-2">-</div>

          <div className="w-full">
            <div className="text-[10px] text-gray-500 mb-1">End Date</div>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-8"
              readOnly={viewMode === "collaborator" || isReadOnly}
              style={{ fontSize: "10px" }}
              min={startDate || new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-[11px] font-medium mb-2">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Add a description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-20"
          readOnly={viewMode === "collaborator" || isReadOnly}
          style={{ fontSize: "10px" }}
          maxLength={1000}
        />
        {/* <div className="text-[9px] text-gray-500 mt-1 text-right">{description.length}/1000</div> */}
      </div>

      {exhibitType === "collab" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-medium">Collaborators</label>
            {viewMode === "owner" && !isReadOnly && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex items-center gap-1 h-5"
                onClick={onAddCollaborator}
                disabled={collaborators.length >= 2}
                style={{ fontSize: "10px" }}
                title={collaborators.length >= 2 ? "Maximum 2 collaborators allowed" : "Add a new collaborator"}
              >
                <i className="bx bx-plus text-xs"></i> Add
              </Button>
            )}
          </div>

          {/* Display selected collaborators */}
          {collaborators.length > 0 ? (
            <div className="space-y-2">
              {collaborators.map((artist, index) => {
                // Get submission status for this collaborator
                const status = getCollaboratorSubmissionStatus(artist.id);

                return (
                  <div key={artist.id} className="flex items-center justify-between p-2 rounded-md bg-[#9b87f5]/10">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-white">
                        {artist.profile_picture ? (
                          <img src={artist.profile_picture} alt={artist.first_name} className="rounded-full" />
                        ) : (
                          `${artist.first_name?.[0] || ""}`.toUpperCase()
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[10px]">
                          {artist.first_name} {artist.last_name || ""}
                        </span>
                        {isEditMode && status.filled === 0 && (
                          <span className="text-[9px] text-amber-600 font-medium">New</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(viewMode === "review" ||
                        viewMode === "monitoring" ||
                        viewMode === "preview" ||
                        (viewMode === "owner" && isEditMode)) && (
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
                      )}
                      {viewMode === "owner" &&
                        !isReadOnly &&
                        // In edit mode: only show remove button if collaborator hasn't submitted any artworks
                        // In create mode: show remove button for all collaborators
                        (!isEditMode || status.filled === 0) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 rounded-full hover:bg-red-100 hover:text-red-600"
                            onClick={() => onRemoveCollaborator(artist)}
                            title={
                              isEditMode && status.filled === 0
                                ? "Remove newly added collaborator"
                                : "Remove collaborator"
                            }
                          >
                            <i className="bx bx-x text-xs"></i>
                          </Button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground py-2 p-4 text-center">
              No collaborators added yet. Add up to 2 collaborators.
            </div>
          )}

          {/* Info message for edit mode */}
          {isEditMode && viewMode === "owner" && collaborators.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <p className="text-[9px] text-blue-700">
                <i className="bx bx-info-circle mr-1"></i>
                Only newly added collaborators who haven't submitted artworks can be removed. Adding collaborators may
                automatically switch to a larger environment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Collaborator Selection Status - Only visible in collaborator view */}
      {viewMode === "collaborator" && currentCollaborator && (
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Your Artwork Selection</h3>

          {/* Count collaborator's assigned slots and selected artworks */}
          {(() => {
            const status = getCollaboratorSubmissionStatus(currentCollaborator.id);

            return (
              <div className="flex items-center justify-between">
                <span className="text-[10px]">
                  {status.filled} of {status.total} slots filled
                </span>
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full text-[10px] bg-[#9b87f5]" style={{ width: `${status.percentage}%` }}></div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ExhibitFormFields;
