import React, { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExhibitCard from "@/components/user_dashboard/Exhibit/card/ExhibitCard";
import { useMyExhibitCards } from "@/hooks/exhibit/useMyCardExhibit";
import useUserExhibits from "@/hooks/exhibit/useUserExhibits";
import { getLoggedInUserId } from "@/auth/decode";
import ExhibitCardSkeleton from "@/components/skeletons/exhibits/ExhibitCardSkeleton";
import { usePendingRequests } from "@/hooks/exhibit/usePendingRequests";
import { usePublishExhibit } from "@/hooks/mutate/exhibit/usePublishExhibit";
import { ExhibitRequest } from "@/hooks/exhibit/usePendingRequests";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

type ExhibitsTabProps = {
  selectedStatus: string;
  includeDeleted?: boolean;
  includeHidden?: boolean;
  includeArchived?: boolean;
  userId?: string;
};

const ExhibitsTab: React.FC<ExhibitsTabProps> = ({
  selectedStatus,
  includeDeleted = false,
  includeHidden = false,
  includeArchived = false,
  userId,
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const [typeTab, setTypeTab] = useState<"solo" | "collab">("solo");
  const [statusFilter, setStatusFilter] = useState<"on_going" | "closed" | "upcoming">("on_going");

  // Language and translation
  const { language } = useLanguage();
  
  // Tab labels
  const soloText = useAutoTranslation("SOLO", language);
  const collabText = useAutoTranslation("COLLAB", language);
  
  // Tooltip texts
  const pendingRequestsText = useAutoTranslation("Pending Requests", language);
  const myContributionsText = useAutoTranslation("My Contributions", language);
  
  // Filter options
  const upcomingText = useAutoTranslation("Upcoming", language);
  const ongoingText = useAutoTranslation("Ongoing", language);
  const endedText = useAutoTranslation("Ended", language);
  const filterText = useAutoTranslation("Filter", language);
  
  // Section headings
  const pendingRequestsHeadingText = useAutoTranslation("Pending Requests", language);
  const myContributionsHeadingText = useAutoTranslation("My Contributions", language);
  
  // Badge labels
  const ownerText = useAutoTranslation("Owner", language);
  const collaboratorText = useAutoTranslation("Collaborator", language);
  const pendingText = useAutoTranslation("Pending", language);
  const publishedText = useAutoTranslation("Published", language);
  const draftText = useAutoTranslation("Draft", language);
  const cancelledText = useAutoTranslation("Cancelled", language);
  const readyText = useAutoTranslation("Ready", language);
  const inProgressText = useAutoTranslation("In Progress", language);
  
  // Progress text
  const progressText = useAutoTranslation("Progress", language);
  const submissionsText = useAutoTranslation("submissions", language);
  
  // Button labels
  const publishText = useAutoTranslation("Publish", language);
  const reviewText = useAutoTranslation("Review", language);
  const viewText = useAutoTranslation("View", language);
  const viewLiveText = useAutoTranslation("View Live", language);
  const viewOthersText = useAutoTranslation("View Others", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const publishExhibitText = useAutoTranslation("Publish Exhibit", language);
  const viewExhibitDetailsText = useAutoTranslation("View Exhibit Details", language);
  
  // Empty state messages
  const noPendingRequestsText = useAutoTranslation("No pending requests at the moment.", language);
  const noContributionsText = useAutoTranslation("No contributions submitted yet.", language);
  const noDeletedExhibitsText = useAutoTranslation("No deleted exhibits found.", language);
  const noUpcomingExhibitsText = useAutoTranslation("No upcoming exhibits found.", language);
  const noOngoingExhibitsText = useAutoTranslation("No ongoing exhibits found.", language);
  const noPastExhibitsText = useAutoTranslation("No past exhibits found.", language);
  
  // Dialog texts
  const publishExhibitDialogTitleText = useAutoTranslation("Publish Exhibit", language);
  const allCollaboratorsSubmittedText = useAutoTranslation("All collaborators have submitted their artwork for", language);
  const areYouReadyToPublishText = useAutoTranslation("Are you ready to publish this exhibit?", language);
  
  // Toast messages
  const exhibitPublishedText = useAutoTranslation("Exhibit Published", language);
  const exhibitPublishedDescText = useAutoTranslation("Your exhibit has been published successfully.", language);
  const failedToPublishText = useAutoTranslation("Failed to publish exhibit", language);
  const somethingWentWrongText = useAutoTranslation("Something went wrong.", language);
  
  // Status messages for contributions
  const exhibitLiveText = useAutoTranslation("Exhibit is now live! Your contribution is part of this published exhibit.", language);
  const waitingForOthersText = useAutoTranslation("You've submitted your contributions. Waiting for others to finish.", language);

  const [showPending, setShowPending] = useState(false);
  const [showContributions, setShowContributions] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedExhibit, setSelectedExhibit] = useState<ExhibitRequest | null>(null);

  const loggedInUserId = getLoggedInUserId();
  const isOwnProfile = !userId || userId === loggedInUserId;

  // Use different hooks based on whether we're viewing our own profile or someone else's
  const { data: myExhibits = [], isLoading: isLoadingMy } = useMyExhibitCards({
    includeDeleted,
    includeHidden,
    includeArchived,
  });

  const { data: userExhibits = [], isLoading: isLoadingUser } = useUserExhibits(userId || "");

  // Use the appropriate data based on profile type
  const exhibits = isOwnProfile ? myExhibits : userExhibits;
  const isLoading = isOwnProfile ? isLoadingMy : isLoadingUser;

  const { mutate: publishExhibit } = usePublishExhibit();

  const now = new Date();

  const isOngoing = (exhibit: any) =>
    exhibit.startDate && exhibit.endDate && new Date(exhibit.startDate) <= now && new Date(exhibit.endDate) >= now;

  const isUpcoming = (exhibit: any) => exhibit.startDate && new Date(exhibit.startDate) > now;

  const isEnded = (exhibit: any) => exhibit.endDate && new Date(exhibit.endDate) < now;
  const filteredExhibits = useMemo(() => {
    if (!exhibits) return [];

    return exhibits.filter((exhibit: any) => {
      const isCorrectType = typeTab === "solo" ? exhibit.isSolo : !exhibit.isSolo;

      const statusMatch =
        selectedStatus === "Hidden" || selectedStatus === "Deleted" || selectedStatus === "Archived"
          ? true // Don't filter by status when viewing hidden/deleted/archived exhibits
          : statusFilter === "on_going"
          ? isOngoing(exhibit)
          : statusFilter === "closed"
          ? isEnded(exhibit)
          : statusFilter === "upcoming"
          ? isUpcoming(exhibit)
          : true;
      let visibilityMatch = true;
      if (selectedStatus === "Deleted") {
        visibilityMatch = exhibit.visibility?.toLowerCase() === "deleted";
      } else if (selectedStatus === "Hidden") {
        // For hidden status, backend already filters using HiddenContent model
        // All exhibits returned are hidden, so we show all of them regardless of their visibility
        visibilityMatch = true;
      } else if (selectedStatus === "Archived") {
        visibilityMatch = exhibit.visibility?.toLowerCase() === "archived";
      } else {
        // For Active/Public status, show public exhibits
        visibilityMatch = exhibit.visibility?.toLowerCase() === "public";
      }

      return isCorrectType && statusMatch && visibilityMatch;
    });
  }, [exhibits, statusFilter, typeTab, selectedStatus, includeHidden]);

  const tabEmptyMessages = {
    upcoming: includeDeleted ? noDeletedExhibitsText : noUpcomingExhibitsText,
    on_going: includeDeleted ? noDeletedExhibitsText : noOngoingExhibitsText,
    closed: includeDeleted ? noDeletedExhibitsText : noPastExhibitsText,
  };

  const { data: pendingRequests = [], isLoading: isLoadingRequests } = usePendingRequests();

  const handleRequestClick = (request: ExhibitRequest) => {
    if (request.isOwner && request.type === "ready") {
      setSelectedExhibit(request);
      setShowPublishDialog(true);
    } else if (!request.isOwner) {
      navigate(`/collaborator/exhibit/${request.exhibitId}`);
    }
  };

  const handlePublishExhibit = () => {
    if (selectedExhibit) {
      // Get translated title for toast
      const translatedTitle = selectedExhibit.exhibitTitle;
      
      publishExhibit(selectedExhibit.exhibitId, {
        onSuccess: () => {
          toast.success(`${exhibitPublishedText}: ${translatedTitle}`, {
            description: exhibitPublishedDescText,
            closeButton: true,
          });
          setShowPublishDialog(false);

          if (selectedExhibit.exhibitType) {
            const exhibitType = selectedExhibit.exhibitType.toLowerCase();
            if (exhibitType === "solo") {
              setTypeTab("solo");
            } else if (exhibitType === "collaborative") {
              setTypeTab("collab");
            }
          }
        },
        onError: (error: any) => {
          toast.error(failedToPublishText, {
            description: error?.response?.data?.detail || somethingWentWrongText,
            closeButton: true,
          });
        },
      });
    }
  };

  const hasUnreadRequests = isOwnProfile && pendingRequests.length > 0;
  const hasReadyExhibits = isOwnProfile && pendingRequests.some((req) => req.isOwner && req.type === "ready");

  // Separate pending requests from contributions
  const actualPendingRequests = pendingRequests.filter((req) => req.type !== "contributed");
  const contributions = pendingRequests.filter((req) => req.type === "contributed" && !req.isOwner);

  const hasContributions = isOwnProfile && contributions.length > 0;

  return (
    <div>
      {/* Tabs */}
      <div className="text-[10px] pl-2 border-gray-300 mb-3">
        <div className="flex justify-between items-center">
          <div className="space-x-8">
            <button
              className={`pb-2 font-medium uppercase ${
                typeTab === "solo" ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
              }`}
              onClick={() => setTypeTab("solo")}
            >
              {soloText}
            </button>
            <button
              className={`pb-2 font-medium uppercase ${
                typeTab === "collab" ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
              }`}
              onClick={() => setTypeTab("collab")}
            >
              {collabText}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {typeTab === "collab" && isOwnProfile && selectedStatus !== "Hidden" && (
              <>
                {/* Pending Requests Icon */}
                <button
                  onClick={() => {
                    setShowPending(!showPending);
                    if (!showPending) {
                      setShowContributions(false); // Close contributions when opening pending
                    }
                  }}
                  className="relative group flex items-center"
                >
                  <i
                    className={`bx bx-time text-[15px] cursor-pointer ${
                      showPending ? "text-yellow-600" : "text-yellow-500"
                    } mr-1`}
                  ></i>
                  {actualPendingRequests.length > 0 && (
                    <span className="absolute -top-1 right-0 w-2 h-2 bg-red-600 rounded-full"></span>
                  )}
                  {/* Tooltip */}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white text-black text-[10px] px-2 py-1 border shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {pendingRequestsText}
                  </span>
                </button>

                {/* Contributions Icon */}
                <button
                  onClick={() => {
                    setShowContributions(!showContributions);
                    if (!showContributions) {
                      setShowPending(false); // Close pending when opening contributions
                    }
                  }}
                  className="relative group flex items-center"
                >
                  <i
                    className={`bx bx-check-circle text-[15px] cursor-pointer ${
                      showContributions ? "text-blue-600" : "text-blue-500"
                    } mr-1`}
                  ></i>
                  {contributions.length > 0 && (
                    <span className="absolute -top-1 right-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                  {/* Tooltip */}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white text-black text-[10px] px-2 py-1 border shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {myContributionsText}
                  </span>
                </button>
              </>
            )}

            {/* DROPDOWN */}
            {selectedStatus !== "Hidden" && selectedStatus !== "Deleted" && selectedStatus !== "Archived" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="py-1 px-4 rounded-full text-[10px] border border-gray-300 flex items-center gap-1.5">
                    {/* <i className="bx bx-sort text-xs"></i> */}
                    {{
                      upcoming: upcomingText,
                      on_going: ongoingText,
                      closed: endedText,
                    }[statusFilter] || filterText}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="rounded-lg shadow-md py-2 text-[10px] bg-white border">
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("upcoming")}
                    className={`text-[10px] hover:bg-gray-100 cursor-pointer ${
                      statusFilter === "upcoming" ? "font-semibold text-gray-800" : "text-gray-600"
                    }`}
                  >
                    {upcomingText}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setStatusFilter("on_going")}
                    className={`text-[10px] hover:bg-gray-100 cursor-pointer ${
                      statusFilter === "on_going" ? "font-semibold text-gray-800" : "text-gray-600"
                    }`}
                  >
                    {ongoingText}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setStatusFilter("closed")}
                    className={`text-[10px] hover:bg-gray-100 cursor-pointer ${
                      statusFilter === "closed" ? "font-semibold text-gray-800" : "text-gray-600"
                    }`}
                  >
                    {endedText}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Pending Section */}
      {typeTab === "collab" && showPending && isOwnProfile && selectedStatus !== "Hidden" && (
        <div className="mb-4 border border-yellow-300 bg-yellow-50 rounded p-3 text-[10px]">
          <h2 className="font-semibold text-yellow-700 mb-2">{pendingRequestsHeadingText}</h2>
          {actualPendingRequests.length > 0 ? (
            <ul className="space-y-2">
              {actualPendingRequests.map((req) => (
                <li
                  key={req.id}
                  className={`border rounded p-2 ${
                    req.isOwner && req.type === "ready" ? "border-green-200 bg-green-50" : "border-yellow-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium"><TranslatedText text={req.exhibitTitle} /></span>

                        {/* Role Badge */}
                        {req.isOwner ? (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 text-blue-600 border-blue-500">
                            {ownerText}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 text-purple-700 border-purple-400">
                            {collaboratorText}
                          </Badge>
                        )}

                        {/* Status Tracker */}
                        {req.type === "pending" && (
                          <Badge className="bg-yellow-500 text-white text-[8px] px-1 py-0">{pendingText}</Badge>
                        )}
                        {req.type === "published" && (
                          <Badge className="bg-red-700 text-white text-[8px] px-1 py-0">{publishedText}</Badge>
                        )}
                        {/* {req.type === "review" && (
                          <Badge className="bg-blue-500 text-white text-[8px] px-1 py-0">In Review</Badge>
                        )} */}
                        {/* Extra mocked statuses */}
                        {req.status.toLowerCase().includes("draft") && (
                          <Badge className="bg-black text-white text-[8px] px-1 py-0">{draftText}</Badge>
                        )}
                        {req.status.toLowerCase().includes("cancelled") && (
                          <Badge className="bg-gray-400 text-white text-[8px] px-1 py-0">{cancelledText}</Badge>
                        )}
                        {req.type === "ready" && (
                          <Badge className="bg-green-600 text-white text-[8px] px-1 py-0">{readyText}</Badge>
                        )}
                      </div>
                      <p className="text-gray-500 mt-0.5"><TranslatedText text={req.status} /></p>
                      {req.isOwner && req.collaboratorsSubmitted !== undefined && (
                        <div className="mt-1 flex items-center">
                          <span className="text-[9px] text-gray-600 mr-2">
                            {progressText}: {req.collaboratorsSubmitted}/{req.totalCollaborators} {submissionsText}
                          </span>
                          <div className="w-24 h-1 bg-gray-200 rounded-full">
                            <div
                              className={`h-full ${
                                req.type === "ready"
                                  ? "bg-green-500"
                                  : req.type === "pending"
                                  ? "bg-yellow-500"
                                  : req.type === "published"
                                  ? "bg-red-700"
                                  : req.status.toLowerCase().includes("draft")
                                  ? "bg-black"
                                  : req.status.toLowerCase().includes("cancelled")
                                  ? "bg-gray-400"
                                  : "bg-gray-300"
                              }`}
                              style={{ width: `${(req.collaboratorsSubmitted / req.totalCollaborators) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Conditional Button */}
                    {req.isOwner ? (
                      req.type === "ready" ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/exhibitreview?id=${req.exhibitId}`)}
                            className="h-6 text-[9px] text-gray-600 px-2 py-1 rounded-full border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                            title="Preview all contributions"
                          >
                            <i className="bx bx-show-alt text-[10px]"></i>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedExhibit(req);
                              setShowPublishDialog(true);
                            }}
                            className="h-6 text-[9px] text-white px-3.5 py-1 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
                          >
                            {publishText}
                          </button>
                        </div>
                      ) : (
                        <Link
                          to={`/exhibitreview?id=${req.exhibitId}`}
                          className="h-6 text-[9px] text-white px-3.5 py-1 rounded-full bg-amber-600 hover:bg-amber-700 flex items-center justify-center"
                        >
                          {reviewText}
                        </Link>
                      )
                    ) : (
                      <button
                        onClick={() => handleRequestClick(req)}
                        className="h-6 text-[9px] text-white px-3.5 py-1 rounded-full bg-[#9b87f5] hover:bg-[#7E69AB] flex items-center justify-center"
                      >
                        {viewText}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-[11px]">{noPendingRequestsText}</p>
          )}
        </div>
      )}

      {/* Contributions Section */}
      {typeTab === "collab" && showContributions && isOwnProfile && selectedStatus !== "Hidden" && (
        <div className="mb-4 border border-blue-300 bg-blue-50 rounded p-3 text-[10px]">
          <h2 className="font-semibold text-blue-700 mb-2">{myContributionsHeadingText}</h2>
          {contributions.length > 0 ? (
            <ul className="space-y-2">
              {contributions.map((req) => (
                <li key={req.id} className="border border-blue-200 bg-white rounded p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium"><TranslatedText text={req.exhibitTitle} /></span>

                        {/* Role Badge */}
                        <Badge variant="outline" className="text-[8px] px-1 py-0 text-purple-700 border-purple-400">
                          {collaboratorText}
                        </Badge>

                        {/* Status Badge - Show different badges based on exhibit status */}
                        {req.status.toLowerCase().includes("live") || req.status.toLowerCase().includes("published") ? (
                          <Badge className="bg-green-600 text-white text-[8px] px-1 py-0 flex items-center gap-1">
                            <i className="bx bx-check-circle text-[7px]"></i>
                            {publishedText}
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500 text-white text-[8px] px-1 py-0 flex items-center gap-1">
                            <i className="bx bx-time text-[7px]"></i>
                            {inProgressText}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-500 mt-0.5">
                        {req.status.toLowerCase().includes("live") || req.status.toLowerCase().includes("published")
                          ? exhibitLiveText
                          : (req.status ? <TranslatedText text={req.status} /> : waitingForOthersText)}
                      </p>
                      {req.collaboratorsSubmitted !== undefined && (
                        <div className="mt-1 flex items-center">
                          <span className="text-[9px] text-gray-600 mr-2">
                            {progressText}: {req.collaboratorsSubmitted}/{req.totalCollaborators} {submissionsText}
                          </span>
                          <div className="w-24 h-1 bg-gray-200 rounded-full">
                            <div
                              className={`h-full ${
                                req.status.toLowerCase().includes("live") ||
                                req.status.toLowerCase().includes("published")
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${(req.collaboratorsSubmitted / req.totalCollaborators) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* View Others Button */}
                    <button
                      onClick={() => navigate(`/exhibitreview?id=${req.exhibitId}`)}
                      className={`h-6 text-[9px] text-white px-3.5 py-1 rounded-full flex items-center justify-center ${
                        req.status.toLowerCase().includes("live") || req.status.toLowerCase().includes("published")
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {req.status.toLowerCase().includes("live") || req.status.toLowerCase().includes("published")
                        ? viewLiveText
                        : viewOthersText}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-[11px]">{noContributionsText}</p>
          )}
        </div>
      )}

      {/* Exhibit Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <ExhibitCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredExhibits.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredExhibits.map((exhibit: any) => (
            <ExhibitCard
              key={exhibit.id}
              exhibit={{
                ...exhibit,
                category: exhibit.category?.charAt(0).toUpperCase() + exhibit.category?.slice(1),
              }}
              onClick={() => navigate(`/view-exhibit/${exhibit.id}`)}
              isOwnProfile={isOwnProfile}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center p-4 text-xs text-gray-500">{tabEmptyMessages[statusFilter]}</div>
      )}

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent className="w-full max-w-sm rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-sm">{publishExhibitDialogTitleText}</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-[10px]">
              {allCollaboratorsSubmittedText} "{selectedExhibit?.exhibitTitle && <TranslatedText text={selectedExhibit.exhibitTitle} />}". {areYouReadyToPublishText}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <Link
              to={`/exhibitreview?id=${selectedExhibit?.exhibitId}`}
              className="flex items-center px-2.5 py-1 gap-1 text-[8px] rounded-full border border-gray-300"
              onClick={() => setShowPublishDialog(false)}
            >
              <i className="bx bx-show-alt"></i> {viewExhibitDetailsText}
            </Link>
          </div>
          <AlertDialogFooter>
            <div className="w-full flex flex-row gap-6">
              <AlertDialogCancel className="h-[28px] w-full text-[9px] rounded-full">{cancelText}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700 w-full h-[28px] text-[9px] rounded-full"
                onClick={handlePublishExhibit}
              >
                {publishExhibitText}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExhibitsTab;
