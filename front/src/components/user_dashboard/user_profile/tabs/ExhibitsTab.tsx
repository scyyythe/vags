import React, { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import ExhibitCard from "@/components/user_dashboard/Exhibit/card/ExhibitCard";
import { useMyExhibitCards } from "@/hooks/exhibit/useMyCardExhibit";
import ExhibitCardSkeleton from "@/components/skeletons/ExhibitCardSkeleton";
import { usePendingRequests } from "@/hooks/exhibit/usePendingRequests";
import { usePublishExhibit } from "@/hooks/mutate/exhibit/usePublishExhibit";
import { ExhibitRequest } from "@/hooks/exhibit/usePendingRequests";
type ExhibitsTabProps = {
  selectedStatus: string;
  includeDeleted?: boolean;
  includeHidden?: boolean;
  includeArchived?: boolean;
};

const ExhibitsTab: React.FC<ExhibitsTabProps> = ({
  selectedStatus,
  includeDeleted = false,
  includeHidden = false,
  includeArchived = false,
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const [typeTab, setTypeTab] = useState<"solo" | "collab">("solo");
  const [statusFilter, setStatusFilter] = useState<"on_going" | "closed" | "upcoming">("on_going");

  const [showPending, setShowPending] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedExhibit, setSelectedExhibit] = useState<ExhibitRequest | null>(null);

  const { data: exhibits = [], isLoading } = useMyExhibitCards({
    includeDeleted,
    includeHidden,
    includeArchived,
  });

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
        statusFilter === "on_going"
          ? isOngoing(exhibit)
          : statusFilter === "closed"
          ? isEnded(exhibit)
          : statusFilter === "upcoming"
          ? isUpcoming(exhibit)
          : true;
      let visibilityMatch = true;
      if (selectedStatus === "Deleted") visibilityMatch = exhibit.visibility?.toLowerCase() === "deleted";
      else if (selectedStatus === "Hidden") visibilityMatch = exhibit.visibility?.toLowerCase() === "private";
      else if (selectedStatus === "Archived") visibilityMatch = exhibit.visibility?.toLowerCase() === "archived";
      else visibilityMatch = exhibit.visibility?.toLowerCase() === "public";

      return isCorrectType && statusMatch && visibilityMatch;
    });
  }, [exhibits, statusFilter, typeTab, includeDeleted]);

  const tabEmptyMessages = {
    upcoming: includeDeleted ? "No deleted exhibits found." : "No upcoming exhibits found.",
    on_going: includeDeleted ? "No deleted exhibits found." : "No ongoing exhibits found.",
    closed: includeDeleted ? "No deleted exhibits found." : "No past exhibits found.",
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
      publishExhibit(selectedExhibit.exhibitId, {
        onSuccess: () => {
          toast.success(`Exhibit Published: ${selectedExhibit.exhibitTitle}`, {
            description: "Your exhibit has been published successfully.",
            closeButton: true,
          });
          setShowPublishDialog(false);
        },
        onError: (error: any) => {
          toast.error("Failed to publish exhibit", {
            description: error?.response?.data?.detail || "Something went wrong.",
            closeButton: true,
          });
        },
      });
    }
  };

  const hasUnreadRequests = pendingRequests.length > 0;
  const hasReadyExhibits = pendingRequests.some((req) => req.isOwner && req.type === "ready");

  return (
    <div>
      {/* Tabs */}
      <div className="text-[10px] pl-2 border-gray-300 mb-3">
        <div className="flex justify-between items-center">
          <div className="space-x-8">
            {["solo", "collab"].map((tab) => (
              <button
                key={tab}
                className={`pb-2 font-medium uppercase ${
                  typeTab === tab ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
                }`}
                onClick={() => setTypeTab(tab as typeof typeTab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {typeTab === "collab" && (
              <button onClick={() => setShowPending(!showPending)} className="relative group flex items-center">
                <i
                  className={`bx bx-time text-[15px] cursor-pointer ${
                    hasReadyExhibits ? "text-yellow-500" : "text-yellow-500"
                  } mr-1`}
                ></i>
                {hasUnreadRequests && <span className="absolute -top-1 right-0 w-2 h-2 bg-red-600 rounded-full"></span>}
                {/* Tooltip */}
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white text-black text-[10px] px-2 py-1 border shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {hasReadyExhibits ? "No Pending Requests" : "Pending Requests"}
                </span>
              </button>
            )}

            <select
              className="text-[9px] border rounded-full pr-6 pl-2 py-1 text-gray-700 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="upcoming">Upcoming</option>
              <option value="on_going">Ongoing</option>
              <option value="closed">Ended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pending Section */}
      {typeTab === "collab" && showPending && (
        <div className="mb-4 border border-yellow-300 bg-yellow-50 rounded p-3 text-[10px]">
          <h2 className="font-semibold text-yellow-700 mb-2">Pending Requests</h2>
          {pendingRequests.length > 0 ? (
            <ul className="space-y-2">
              {pendingRequests.map((req) => (
                <li
                  key={req.id}
                  className={`border rounded p-2 ${
                    req.isOwner && req.type === "ready" ? "border-green-200 bg-green-50" : "border-yellow-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{req.exhibitTitle}</span>

                        {/* Role Badge */}
                        {req.isOwner ? (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 text-blue-600 border-blue-500">
                            Owner
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 text-purple-700 border-purple-400">
                            Collaborator
                          </Badge>
                        )}

                        {/* Status Tracker */}
                        {req.type === "pending" && (
                          <Badge className="bg-yellow-500 text-white text-[8px] px-1 py-0">Pending</Badge>
                        )}
                        {req.type === "published" && (
                          <Badge className="bg-red-700 text-white text-[8px] px-1 py-0">Published</Badge>
                        )}
                        {/* {req.type === "review" && (
                          <Badge className="bg-blue-500 text-white text-[8px] px-1 py-0">In Review</Badge>
                        )} */}
                        {/* Extra mocked statuses */}
                        {req.status.toLowerCase().includes("draft") && (
                          <Badge className="bg-black text-white text-[8px] px-1 py-0">Draft</Badge>
                        )}
                        {req.status.toLowerCase().includes("cancelled") && (
                          <Badge className="bg-gray-400 text-white text-[8px] px-1 py-0">Cancelled</Badge>
                        )}
                        {req.type === "ready" && (
                          <Badge className="bg-green-600 text-white text-[8px] px-1 py-0">Ready</Badge>
                        )}
                      </div>
                      <p className="text-gray-500 mt-0.5">{req.status}</p>
                      {req.isOwner && req.collaboratorsSubmitted !== undefined && (
                        <div className="mt-1 flex items-center">
                          <span className="text-[9px] text-gray-600 mr-2">
                            Progress: {req.collaboratorsSubmitted}/{req.totalCollaborators} submissions
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
                        <button
                          onClick={() => {
                            setSelectedExhibit(req);
                            setShowPublishDialog(true);
                          }}
                          className="h-6 text-[9px] text-white px-3.5 py-1 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
                        >
                          Publish
                        </button>
                      ) : (
                        <Link
                          to={`/exhibitreview?id=${req.exhibitId}`}
                          className="h-6 text-[9px] text-white px-3.5 py-1 rounded-full bg-amber-600 hover:bg-amber-700 flex items-center justify-center"
                        >
                          Review
                        </Link>
                      )
                    ) : (
                      <button
                        onClick={() => handleRequestClick(req)}
                        className="h-6 text-[9px] text-white px-3.5 py-1 rounded-full bg-[#9b87f5] hover:bg-[#7E69AB]"
                      >
                        View
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-[11px]">No pending requests at the moment.</p>
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
            <AlertDialogTitle className="text-center text-sm">Publish Exhibit</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-[10px]">
              All collaborators have submitted their artwork for "{selectedExhibit?.exhibitTitle}". Are you ready to
              publish this exhibit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <Link
              to={`/exhibitreview?id=${selectedExhibit?.exhibitId}`}
              className="flex items-center px-2.5 py-1 gap-1 text-[8px] rounded-full border border-gray-300"
              onClick={() => setShowPublishDialog(false)}
            >
              <i className="bx bx-show-alt"></i> View Exhibit Details
            </Link>
          </div>
          <AlertDialogFooter>
            <div className="w-full flex flex-row gap-6">
              <AlertDialogCancel className="h-[28px] w-full text-[9px] rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700 w-full h-[28px] text-[9px] rounded-full"
                onClick={handlePublishExhibit}
              >
                Publish Exhibit
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExhibitsTab;
