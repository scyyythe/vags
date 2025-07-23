import React from "react";
import { Star, Calendar, Edit, Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  viewType?: "buyer" | "seller";
  review: {
    id: string;
    rating: number;
    comment: string;
    photos: string[];
    reviewDate: string;
    canEdit: boolean;
    canDelete: boolean;
    reviewerName?: string;
  };
  artwork: {
    artworkImage: string;
    title: string;
    artist: string;
  };
}

const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  viewType = "buyer",
  review,
  artwork,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] text-xs review-details-scroll-hidden"
      onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm mt-2">
            <span>{viewType === "seller" ? "Customer Review" : "Your Review"}</span>
            <div className="flex items-center gap-2">
              {viewType === "buyer" && review.canEdit && (
                <button onClick={onEdit} className="flex text-[10px] py-1 px-4 border rounded-full hover:bg-gray-100 transition-colors">
                  <Edit className="w-2.5 h-2.5 mr-1.5 mt-1" />
                  Edit
                </button>
              )}
              {review.canDelete && (
                <button onClick={onDelete} className="flex text-[10px] text-white py-1 px-4 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
                  <Trash2 className="w-2.5 h-2.5 mr-1.5 mt-1 text-white" />
                  {viewType === "seller" ? "Remove" : "Delete"}
                </button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artwork Info */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <img
              src={artwork.artworkImage}
              alt={artwork.title}
              className="w-20 h-20 rounded-md object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-[11px]">{artwork.title}</h3>
              <p className="text-[10px] text-muted-foreground mb-2">by {artwork.artist}</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-[10px] font-medium">{review.rating}/5</span>
              </div>
            </div>
          </div>

          {/* Review Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>
                Reviewed on {format(new Date(review.reviewDate), "MMMM dd, yyyy")}
                {viewType === "seller" && review.reviewerName && (
                  <span> by {review.reviewerName}</span>
                )}
              </span>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs">
                {viewType === "seller" ? "Customer's Review" : "Your Review"}
              </h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-[10px] leading-relaxed">
                  {review.comment || "No written review provided."}
                </p>
              </div>
            </div>

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-xs flex items-center gap-2">
                  <Camera className="w-3 h-3" />
                  Photos ({review.photos.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {review.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-full h-32 rounded-lg object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edit/Delete Restrictions */}
            {viewType === "seller" ? (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-[10px] text-muted-foreground">
                  As a seller, you can only remove inappropriate reviews. You cannot edit customer reviews.
                </p>
              </div>
            ) : (
              <>
                {!review.canEdit && !review.canDelete && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-[10px] text-muted-foreground">
                      This review can no longer be edited or deleted as the time limit has expired.
                    </p>
                  </div>
                )}
                {review.canEdit && !review.canDelete && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-[10px] text-muted-foreground">
                      You can still edit this review, but it can no longer be deleted.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDetailsModal;
