import React, { useState } from "react";
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
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import ExhibitCard from "@/components/user_dashboard/Exhibit/card/ExhibitCard";
import { useMyExhibitCards } from "@/hooks/exhibit/useMyCardExhibit";
type ExhibitRequest = {
  id: number;
  exhibitTitle: string;
  status: string;
  exhibitId: number;
  isOwner?: boolean;
  type: "pending" | "review" | "ready";
  collaboratorsSubmitted?: number;
  totalCollaborators?: number;
};

const ExhibitsTab = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [typeTab, setTypeTab] = useState<"solo" | "collab">("solo");
  const [statusFilter, setStatusFilter] = useState<"on_going" | "closed" | "upcoming">("on_going");
  const [showPending, setShowPending] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedExhibit, setSelectedExhibit] = useState<ExhibitRequest | null>(null);

  const { data: exhibits = [], isLoading } = useMyExhibitCards();

  const now = new Date();

  const isOngoing = (exhibit: any) =>
    exhibit.startDate && exhibit.endDate &&
    new Date(exhibit.startDate) <= now && new Date(exhibit.endDate) >= now;

  const isUpcoming = (exhibit: any) =>
    exhibit.startDate && new Date(exhibit.startDate) > now;

  const isEnded = (exhibit: any) =>
    exhibit.endDate && new Date(exhibit.endDate) < now;

  const filteredExhibits = exhibits.filter((exhibit: any) => {
    const isCorrectType = typeTab === "solo" ? exhibit.isSolo : !exhibit.isSolo;

    const statusMatch =
      statusFilter === "on_going" ? isOngoing(exhibit) :
      statusFilter === "closed" ? isEnded(exhibit) :
      statusFilter === "upcoming" ? isUpcoming(exhibit) : true;

    return isCorrectType && statusMatch;
  });

  const tabEmptyMessages = {
    upcoming: "No upcoming exhibits found.",
    on_going: "No ongoing exhibits found.",
    closed: "No past exhibits found.",
  };

  const pendingRequests: ExhibitRequest[] = [
    { 
      id: 1, 
      exhibitTitle: "Nature's Symphony", 
      status: "Waiting for collaborator submissions", 
      exhibitId: 2,
      isOwner: true,
      type: "pending",
      collaboratorsSubmitted: 1,
      totalCollaborators: 2
    },
    { 
      id: 2, 
      exhibitTitle: "Urban Dreamscape", 
      status: "Pending slot", 
      exhibitId: 1,
      isOwner: false,
      type: "pending"
    },
    {
      id: 3,
      exhibitTitle: "Abstract Visions",
      status: "All submissions received, ready for review",
      exhibitId: 3,
      isOwner: true,
      type: "ready",
      collaboratorsSubmitted: 2,
      totalCollaborators: 2
    },
  ];

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
      toast.success(`Exhibit Published: ${selectedExhibit.exhibitTitle}`, {
        description: "Your exhibit has been published successfully."
      });
      setShowPublishDialog(false);
    }
  };

  const hasUnreadRequests = pendingRequests.length > 0;
  const hasReadyExhibits = pendingRequests.some(req => req.isOwner && req.type === "ready");

  return (
    <div>
      {/* Tabs */}
      <div className="text-[10px] pl-2 border-gray-300 mb-3">
        <div className="flex justify-between items-center">
          <div className="space-x-8">
            {["solo", "collab"].map((tab) => (
              <button
                key={tab}
                className={`pb-2 font-medium uppercase ${typeTab === tab ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"}`}
                onClick={() => setTypeTab(tab as typeof typeTab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {typeTab === "collab" && (
              <button onClick={() => setShowPending(!showPending)} className="relative group">
                <div className="relative">
                  <i className={`bx ${hasReadyExhibits ? 'bx-time text-yellow-500 mr-4': ''} cursor-pointer text-[15px]`}></i>
                  {hasUnreadRequests && <span className="absolute -top-1 right-2.5 w-2 h-2 bg-red-600 rounded-full"></span>}
                </div>
                <span className="absolute top-6 mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-[10px] text-black bg-white border shadow group-hover:opacity-100 opacity-0 transition-opacity pointer-events-none">
                  {hasReadyExhibits ? 'Pending Requests' : ''}
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
                <li key={req.id} className={`border rounded p-2 ${req.isOwner && req.type === "ready" ? "border-green-200 bg-green-50" : "border-yellow-200 bg-white"}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{req.exhibitTitle}</span>
                        {req.isOwner ? (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 text-blue-600 border-blue-500">Owner</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 text-red-600 border-red-500">Collaborator</Badge>
                        )}
                        {req.type === "ready" && <Badge className="bg-green-500 text-white text-[8px] px-1 py-0">Ready</Badge>}
                      </div>
                      <p className="text-gray-500 mt-0.5">{req.status}</p>
                      {req.isOwner && req.collaboratorsSubmitted !== undefined && (
                        <div className="mt-1 flex items-center">
                          <span className="text-[9px] text-gray-600 mr-2">
                            Progress: {req.collaboratorsSubmitted}/{req.totalCollaborators} submissions
                          </span>
                          <div className="w-24 h-1 bg-gray-200 rounded-full">
                            <div className={`h-full ${req.type === "ready" ? "bg-green-500" : "bg-yellow-500"}`}
                                 style={{width: `${(req.collaboratorsSubmitted / req.totalCollaborators) * 100}%`}}></div>
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
        <div className="text-center text-xs text-gray-500">Loading exhibits...</div>
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
        <div className="col-span-full text-center p-4 text-xs text-gray-500">
          {tabEmptyMessages[statusFilter]}
        </div>
      )}

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent className="w-full max-w-sm rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-sm">Publish Exhibit</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-[10px]">
              All collaborators have submitted their artwork for "{selectedExhibit?.exhibitTitle}". 
              Are you ready to publish this exhibit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <Link
              to={`/exhibitreview?id=${selectedExhibit?.exhibitId}`}
              className="flex items-center px-2.5 py-1 gap-1 text-[8px] rounded-full border border-gray-300"
              onClick={() => setShowPublishDialog(false)}
            >
              <i className='bx bx-show-alt'></i> View Exhibit Details
            </Link>
          </div>
          <AlertDialogFooter >
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
