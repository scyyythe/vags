import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye } from "lucide-react";

type ExhibitRequest = {
  id: number;
  exhibitTitle: string;
  status: string;
  exhibitId: number;
  isOwner?: boolean;
  type: "pending" | "review" | "ready" | "monitoring";
  collaboratorsSubmitted?: number;
  totalCollaborators?: number;
};

const ExhibitsTab = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [typeTab, setTypeTab] = useState<"solo" | "collab">("solo");
  const [statusFilter, setStatusFilter] = useState<"on_going" | "closed">("on_going");
  const [showPending, setShowPending] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedExhibit, setSelectedExhibit] = useState<ExhibitRequest | null>(null);

  const tabEmptyMessages = {
    on_going: "No ongoing exhibits found.",
    closed: "No past exhibits found.",
  };

  // Updated to include monitoring type for AddExhibit view
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
    {
      id: 4,
      exhibitTitle: "Digital Renaissance",
      status: "Monitor submission progress",
      exhibitId: 4,
      isOwner: true,
      type: "monitoring",
      collaboratorsSubmitted: 1,
      totalCollaborators: 3
    }
  ];

  // Handler for clicking on a request
  const handleRequestClick = (request: ExhibitRequest) => {
    // If this is a ready-to-publish exhibit owned by the current user
    if (request.isOwner && request.type === "ready") {
      setSelectedExhibit(request);
      setShowPublishDialog(true);
    } 
    // If this is a monitoring request (AddExhibit for monitoring)
    else if (request.isOwner && request.type === "monitoring") {
      // Navigate to AddExhibit in monitoring mode
      navigate(`/addexhibit/${request.exhibitId}?mode=monitoring`);
      toast.info(`Monitoring exhibit: ${request.exhibitTitle}`, {
        description: `Tracking progress: ${request.collaboratorsSubmitted}/${request.totalCollaborators} submissions`
      });
    }
    // For Review action (owner viewing pending request)
    else if (request.isOwner && request.type === "pending") {
      // Navigate to AddExhibit in review mode
      navigate(`/addexhibit/${request.exhibitId}?mode=review`);
      toast.info(`Reviewing exhibit: ${request.exhibitTitle}`, {
        description: "You can review and manage this exhibit's collaborations"
      });
    }
    // For View action (collaborator viewing their submission page)
    else {
      // Navigate to collaborator view
      navigate(`/collaborator/exhibit/${request.exhibitId}`);
    }
  };

  // Handler for viewing exhibit details from publish dialog
  const handleViewExhibitDetails = () => {
    if (selectedExhibit) {
      navigate(`/addexhibit/${selectedExhibit.exhibitId}?mode=preview`);
      setShowPublishDialog(false);
    }
  };

  // Handler for publishing an exhibit
  const handlePublishExhibit = () => {
    if (selectedExhibit) {
      toast.success(`Exhibit Published: ${selectedExhibit.exhibitTitle}`, {
        description: "Your exhibit has been published successfully."
      });
      // In a real application, this would call an API endpoint
      setShowPublishDialog(false);
      
      // Remove the published exhibit from the pending requests
      const updatedRequests = pendingRequests.filter(req => req.id !== selectedExhibit.id);
      // Note: In a real app with state management, you would update the state here
      
      // Close the pending section if there are no more requests
      if (updatedRequests.length === 0) {
        setShowPending(false);
      }
    }
  };

  // Check for unread pending requests
  const hasUnreadRequests = pendingRequests.length > 0;
  
  // Check if there are ready-to-publish exhibits
  const hasReadyExhibits = pendingRequests.some(req => req.isOwner && req.type === "ready");

  return (
    <div>
      {/* Main Tabs (Solo / Collab) */}
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

          {/* Pending Icon + Status Filter */}
          <div className="flex items-center space-x-2">
            {typeTab === "collab" && (
              <button
                onClick={() => setShowPending(!showPending)}
                className="relative group"
                aria-label="Pending Requests"
              >
                {/* Pending Icon with notification indicator */}
                <div className="relative">
                  <i className={`bx ${hasReadyExhibits ? 'bx-check-circle text-green-500' : 'bx-time text-yellow-500'} cursor-pointer text-[15px]`}></i>
                  {hasUnreadRequests && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                  )}
                </div>
                {/* Tooltip */}
                <span className="absolute top-6 mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-[10px] text-black bg-white border shadow group-hover:opacity-100 opacity-0 transition-opacity pointer-events-none">
                  {hasReadyExhibits ? 'Ready to Publish' : 'Pending Requests'}
                </span>
              </button>
            )}

            {/* Status Filter (Ongoing / Past) */}
            <select
              className="text-[9px] border rounded-full pr-6 pl-2 py-1 text-gray-700 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="on_going">Ongoing</option>
              <option value="closed">Ended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pending Requests Container - Now with Enhanced UI for Owners and Monitoring */}
      {typeTab === "collab" && showPending && (
        <div className="mb-4 border border-yellow-300 bg-yellow-50 rounded p-3 text-[10px]">
          <h2 className="font-semibold text-yellow-700 mb-2">
            {hasReadyExhibits 
              ? "Pending Requests" 
              : "Pending Requests"}
          </h2>
          {pendingRequests.length > 0 ? (
            <ul className="space-y-2">
              {pendingRequests.map((req) => (
                <li key={req.id} className={`border rounded p-2 ${
                  req.isOwner && req.type === "ready" 
                    ? "border-green-200 bg-green-50"
                    : req.isOwner && req.type === "monitoring"
                      ? "border-blue-200 bg-blue-50"
                      : "border-yellow-200 bg-white"
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{req.exhibitTitle}</span>
                        {req.isOwner && (
                          <Badge variant="outline" className="text-[8px] px-1 py-0">Owner</Badge>
                        )}
                        {req.type === "ready" && (
                          <Badge className="bg-green-500 text-white text-[8px] px-1 py-0">Ready</Badge>
                        )}
                        {req.type === "monitoring" && (
                          <Badge className="bg-blue-500 text-[8px] text-white px-1 py-0">Monitoring</Badge>
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
                                  : req.type === "monitoring" 
                                    ? "bg-blue-500" 
                                    : "bg-yellow-500"
                              }`} 
                              style={{width: `${(req.collaboratorsSubmitted / req.totalCollaborators) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className={`h-6 text-[9px] text-white px-3.5 py-1 rounded-full ${
                        req.isOwner && req.type === "ready" 
                          ? "bg-green-600 hover:bg-green-700" 
                          : req.isOwner && req.type === "monitoring"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : req.isOwner 
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-[#9b87f5] hover:bg-[#7E69AB]"
                      }`}
                      onClick={() => handleRequestClick(req)}
                    >
                      {req.isOwner 
                        ? req.type === "ready" 
                          ? "Publish" 
                          : req.type === "monitoring"
                            ? "Monitor" 
                            : "Review" 
                        : "View"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-[10px]">No pending requests at the moment.</p>
          )}
        </div>
      )}

      {/* Exhibit Cards Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        <div className="col-span-full text-center p-4 text-xs text-gray-500">
          {tabEmptyMessages[statusFilter]}
        </div>
      </div>

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
            <button 
              onClick={handleViewExhibitDetails}
              className="flex items-center px-2.5 py-1 gap-1 text-[8px] rounded-full border border-gray-300"
            >
              <i className='bx bx-show-alt'></i> View Exhibit Details
            </button>
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
