import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewMode, Artist, SubmissionStatus } from "../components/types";
import { ART_STYLES } from "@/components/user_dashboard/Explore/create_post/ArtworkStyles";
import { User } from "@/hooks/users/useUserQuery";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { autoTranslate } from "@/utils/autoTranslate";
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
  const { language } = useLanguage();

  // State for translated art styles
  const [translatedArtStyles, setTranslatedArtStyles] = useState<string[]>([...ART_STYLES]);

  // Effect to translate art styles when language changes
  useEffect(() => {
    const translateStyles = async () => {
      try {
        const translated = await Promise.all(
          ART_STYLES.map(async (style) => await autoTranslate(style, language.toLowerCase()))
        );
        setTranslatedArtStyles(translated);
      } catch (error) {
        console.warn("Failed to translate art styles:", error);
        setTranslatedArtStyles([...ART_STYLES]);
      }
    };

    if (language.toLowerCase() !== "en") {
      translateStyles();
    } else {
      setTranslatedArtStyles([...ART_STYLES]);
    }
  }, [language]);

  // Translation hooks for all text content
  const exhibitTitleText = useAutoTranslation("Exhibit Title", language);
  const enterTitleText = useAutoTranslation("Enter title", language);
  const exhibitTypeText = useAutoTranslation("Exhibit Type", language);
  const soloText = useAutoTranslation("Solo", language);
  const collaborativeText = useAutoTranslation("Collaborative", language);
  const soloExhibitionText = useAutoTranslation("Solo Exhibition", language);
  const collaborativeExhibitionText = useAutoTranslation("Collaborative Exhibition", language);
  const noteText = useAutoTranslation("Note:", language);
  const soloCannotBeChangedText = useAutoTranslation("Solo exhibits cannot be changed to collaborative exhibits. To create a collaborative exhibit, please create a new exhibit instead.", language);
  const artworkStyleText = useAutoTranslation("Artwork Style", language);
  const selectArtworkStyleText = useAutoTranslation("Select artwork style", language);
  const durationText = useAutoTranslation("Duration", language);
  const startDateText = useAutoTranslation("Start Date", language);
  const endDateText = useAutoTranslation("End Date", language);
  const descriptionText = useAutoTranslation("Description", language);
  const addDescriptionText = useAutoTranslation("Add a description", language);
  const collaboratorsText = useAutoTranslation("Collaborators", language);
  const addText = useAutoTranslation("Add", language);
  const maximumCollaboratorsText = useAutoTranslation("Maximum 2 collaborators allowed", language);
  const addNewCollaboratorText = useAutoTranslation("Add a new collaborator", language);
  const newText = useAutoTranslation("New", language);
  const removeCollaboratorText = useAutoTranslation("Remove collaborator", language);
  const removeNewlyAddedCollaboratorText = useAutoTranslation("Remove newly added collaborator", language);
  const noCollaboratorsAddedText = useAutoTranslation("No collaborators added yet. Add up to 2 collaborators.", language);
  const onlyNewlyAddedText = useAutoTranslation("Only newly added collaborators who haven't submitted artworks can be removed. Adding collaborators may automatically switch to a larger environment.", language);
  const yourArtworkSelectionText = useAutoTranslation("Your Artwork Selection", language);
  const slotsFilledText = useAutoTranslation("slots filled", language);
  const ofText = useAutoTranslation("of", language);

  const isEditMode = !!exhibitData;
  const isSoloOriginal = exhibitData?.isSolo ?? false;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-[11px] font-medium mb-2 text-gray-900 dark:text-gray-100">
          {exhibitTitleText}
        </label>
        <Input
          id="title"
          placeholder={enterTitleText}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full focus:outline-none focus:ring-0 h-8 dark:border-gray-600 dark:bg-gray-800"
          readOnly={viewMode === "collaborator" || isReadOnly}
          style={{ fontSize: "10px" }}
          maxLength={100}
        />
        {/* <div className="text-[9px] text-gray-500 mt-1 text-right">{title.length}/100</div> */}
      </div>

      {viewMode === "owner" && !isReadOnly && (
        <div>
          <span className="text-[11px] font-medium mb-2 text-gray-900 dark:text-gray-100">{exhibitTypeText}</span>
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
              className="w-full text-[10px] border rounded-md h-8 dark:data-[state=on]:bg-black dark:data-[state=on]:text-white dark:data-[state=on]:border-black"
              disabled={isEditMode && !isSoloOriginal}
            >
              {soloText}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="collab"
              className="w-full text-[10px] border rounded-md h-8 dark:data-[state=on]:bg-black dark:data-[state=on]:text-white dark:data-[state=on]:border-black"
              disabled={isEditMode && isSoloOriginal}
            >
              {collaborativeText}
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Show warning message for solo exhibits in edit mode */}
          {isEditMode && isSoloOriginal && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-[10px] text-amber-700">
                <strong>{noteText}</strong> {soloCannotBeChangedText}
              </p>
            </div>
          )}
        </div>
      )}

      {(viewMode !== "owner" || isReadOnly) && (
        <div>
          <label className="block text-[11px] font-medium mb-2">{exhibitTypeText}</label>
          <div className="text-xs text-gray-700 border p-2 rounded">
            {exhibitType === "solo" ? soloExhibitionText : collaborativeExhibitionText}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="style" className="block text-[11px] font-medium mb-2">
            {artworkStyleText}
          </label>
          <Select value={artworkStyle} onValueChange={setArtworkStyle} disabled={viewMode === "collaborator" || isReadOnly}>
            <SelectTrigger className="w-full text-[10px] h-8 dark:border-gray-600 dark:bg-gray-800">
              <SelectValue placeholder={selectArtworkStyleText} />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-y-auto">
              {translatedArtStyles.map((style, index) => (
                <SelectItem key={ART_STYLES[index]} value={ART_STYLES[index].toLowerCase()} className="text-[10px]">
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium mb-2">{durationText}</label>
        <div className="flex items-center space-x-4">
          <div className="w-full">
            <div className="text-[10px] text-gray-500 mb-1">{startDateText}</div>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-8 date-input-rtl dark:border-gray-600 dark:bg-gray-800"
              readOnly={viewMode === "collaborator" || isReadOnly}
              style={{ fontSize: "10px", direction: "ltr" }}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex items-center relative top-2">-</div>

          <div className="w-full">
            <div className="text-[10px] text-gray-500 mb-1">{endDateText}</div>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-8 date-input-rtl dark:border-gray-600 dark:bg-gray-800"
              readOnly={viewMode === "collaborator" || isReadOnly}
              style={{ fontSize: "10px", direction: "ltr" }}
              min={startDate || new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-[11px] font-medium mb-2">
          {descriptionText}
        </label>
        <Textarea
          id="description"
          placeholder={addDescriptionText}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-20 dark:border-gray-600 dark:bg-gray-800"
          readOnly={viewMode === "collaborator" || isReadOnly}
          style={{ fontSize: "10px" }}
          maxLength={1000}
        />
        {/* <div className="text-[9px] text-gray-500 mt-1 text-right">{description.length}/1000</div> */}
      </div>

      {exhibitType === "collab" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-medium">{collaboratorsText}</label>
            {viewMode === "owner" && !isReadOnly && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex items-center gap-1 h-5"
                onClick={onAddCollaborator}
                disabled={collaborators.length >= 2}
                style={{ fontSize: "10px" }}
                title={collaborators.length >= 2 ? maximumCollaboratorsText : addNewCollaboratorText}
              >
                <i className="bx bx-plus text-xs"></i> {addText}
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
                          <span className="text-[9px] text-amber-600 font-medium">{newText}</span>
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
                                ? removeNewlyAddedCollaboratorText
                                : removeCollaboratorText
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
              {noCollaboratorsAddedText}
            </div>
          )}

          {/* Info message for edit mode */}
          {isEditMode && viewMode === "owner" && collaborators.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <p className="text-[9px] text-blue-700">
                <i className="bx bx-info-circle mr-1"></i>
                {onlyNewlyAddedText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Collaborator Selection Status - Only visible in collaborator view */}
      {viewMode === "collaborator" && currentCollaborator && (
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="text-sm font-medium mb-2">{yourArtworkSelectionText}</h3>

          {/* Count collaborator's assigned slots and selected artworks */}
          {(() => {
            const status = getCollaboratorSubmissionStatus(currentCollaborator.id);

            return (
              <div className="flex items-center justify-between">
                <span className="text-[10px]">
                  {status.filled} {ofText} {status.total} {slotsFilledText}
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
