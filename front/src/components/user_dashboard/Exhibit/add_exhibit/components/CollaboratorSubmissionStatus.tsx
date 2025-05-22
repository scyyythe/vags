import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type Artist = {
  id: number;
  name: string;
  avatar: string;
};

type CollaboratorStatus = {
  artist: Artist;
  status: "pending" | "partial" | "completed";
  slotsAssigned: number;
  slotsFilled: number;
};

type CollaboratorSubmissionStatusProps = {
  collaborators: CollaboratorStatus[];
  exhibitTitle: string;
  allSlotsCompleted: boolean;
  onRequestReview: () => void;
  onPublish: () => void;
};

const CollaboratorSubmissionStatus = ({
  collaborators,
  exhibitTitle,
  allSlotsCompleted,
  onRequestReview,
  onPublish
}: CollaboratorSubmissionStatusProps) => {
  const [showPublishDialog, setShowPublishDialog] = React.useState(false);
  
  // Calculate overall completion status
  const totalSlots = collaborators.reduce((sum, collab) => sum + collab.slotsAssigned, 0);
  const totalFilled = collaborators.reduce((sum, collab) => sum + collab.slotsFilled, 0);
  const completionPercentage = totalSlots > 0 ? Math.round((totalFilled / totalSlots) * 100) : 0;
  
  const handlePublishRequest = () => {
    if (allSlotsCompleted) {
      setShowPublishDialog(true);
    } else {
      toast.error("Cannot publish yet", {
        description: "Not all slots have been filled. Please wait for collaborators to complete their submissions."
      });
    }
  };

  const handleReviewRequest = () => {
    // Call the provided onRequestReview callback
    onRequestReview();
    
    // Show confirmation toast
    toast.success("Review requested", {
      description: "A review request has been sent to the appropriate parties."
    });
  };

  const getStatusLabel = (status: CollaboratorStatus["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "partial": 
        return <Badge className="bg-amber-500">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Collaborator Submissions</h3>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            Overall: {completionPercentage}% complete
          </span>
          <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${allSlotsCompleted ? "bg-green-500" : "bg-amber-500"}`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Collaborators list with status */}
      <div className="grid gap-2">
        {collaborators.map((collab) => (
          <Card key={collab.artist.id} className="p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <img src={collab.artist.avatar} alt={collab.artist.name} className="rounded-full" />
                </Avatar>
                <div>
                  <p className="text-xs font-medium">{collab.artist.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500">
                      {collab.slotsFilled}/{collab.slotsAssigned} slots filled
                    </span>
                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          collab.status === "completed" 
                            ? "bg-green-500" 
                            : collab.status === "partial" 
                              ? "bg-amber-500" 
                              : "bg-gray-300"
                        }`}
                        style={{ 
                          width: `${collab.slotsAssigned > 0 ? (collab.slotsFilled / collab.slotsAssigned) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              {getStatusLabel(collab.status)}
            </div>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={handleReviewRequest}
        >
          Request Review
        </Button>
        
        <Button
          size="sm"
          className={`text-xs ${allSlotsCompleted ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}
          onClick={handlePublishRequest}
          disabled={!allSlotsCompleted}
        >
          Publish Exhibit
        </Button>
      </div>

      {/* Publish confirmation dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Ready to Publish</AlertDialogTitle>
            <AlertDialogDescription>
              All slots for "{exhibitTitle}" have been filled. Would you like to publish this exhibit now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700 text-xs"
              onClick={() => {
                setShowPublishDialog(false);
                onPublish();
              }}
            >
              Publish Exhibit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CollaboratorSubmissionStatus;
