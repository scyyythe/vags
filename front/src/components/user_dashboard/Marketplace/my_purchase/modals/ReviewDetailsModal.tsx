import React, { useState } from "react";
import { Star, Calendar, Edit, Trash2, Camera, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onThankBuyer?: () => void;
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
  allReviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    photos: string[];
    reviewDate: string;
    reviewerName?: string;
    canEdit: boolean;
    canDelete: boolean;
  }>;
  isLoading?: boolean;
}

const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onThankBuyer,
  viewType = "buyer",
  review,
  artwork,
  allReviews = [],
  isLoading = false,
}) => {
  const { language } = useLanguage();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Translation hooks
  const customerReviewsText = useAutoTranslation("Customer Reviews", language);
  const yourReviewText = useAutoTranslation("Your Review", language);
  const ofText = useAutoTranslation("of", language);
  const editText = useAutoTranslation("Edit", language);
  const removeText = useAutoTranslation("Remove", language);
  const deleteText = useAutoTranslation("Delete", language);
  const loadingReviewsText = useAutoTranslation("Loading reviews...", language);
  const byText = useAutoTranslation("by", language);
  const reviewedOnText = useAutoTranslation("Reviewed on", language);
  const customerReviewLabelText = useAutoTranslation("Customer's Review", language);
  const yourReviewLabelText = useAutoTranslation("Your Review", language);
  const noReviewProvidedText = useAutoTranslation("No written review provided.", language);
  const photosText = useAutoTranslation("Photos", language);
  const reviewPhotoText = useAutoTranslation("Review photo", language);
  const sellerRestrictionText = useAutoTranslation("As a seller, you can only remove inappropriate reviews. You cannot edit customer reviews.", language);
  const expiredEditDeleteText = useAutoTranslation("This review can no longer be edited or deleted as the time limit has expired.", language);
  const expiredDeleteOnlyText = useAutoTranslation("You can still edit this review, but it can no longer be deleted.", language);

  // Use allReviews if available (seller view), otherwise use single review (buyer view)
  const reviewsToShow = allReviews.length > 0 ? allReviews : [review];
  const currentReview = reviewsToShow[currentReviewIndex] || review;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] text-xs review-details-scroll-hidden bg-white dark:bg-gray-800"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm mt-2 text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-2">
              <span>{viewType === "seller" ? customerReviewsText : yourReviewText}</span>
              {allReviews.length > 1 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <button
                    onClick={() => setCurrentReviewIndex(Math.max(0, currentReviewIndex - 1))}
                    disabled={currentReviewIndex === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span>
                    {currentReviewIndex + 1} {ofText} {allReviews.length}
                  </span>
                  <button
                    onClick={() => setCurrentReviewIndex(Math.min(allReviews.length - 1, currentReviewIndex + 1))}
                    disabled={currentReviewIndex === allReviews.length - 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {viewType === "buyer" && currentReview.canEdit && (
                <button
                  onClick={onEdit}
                  className="flex text-[10px] py-1 px-4 border rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Edit className="w-2.5 h-2.5 mr-1.5 mt-1" />
                  {editText}
                </button>
              )}
              {currentReview.canDelete && (
                <button
                  onClick={onDelete}
                  className="flex text-[10px] text-white py-1 px-4 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-2.5 h-2.5 mr-1.5 mt-1 text-white" />
                  {viewType === "seller" ? removeText : deleteText}
                </button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            /* Loading State */
            <div className="flex items-center justify-center py-8">
              <div className="text-[10px] text-muted-foreground">{loadingReviewsText}</div>
            </div>
          ) : (
            <>
              {/* Artwork Info */}
              <div className="flex gap-4 p-4 bg-muted rounded-lg">
                <img src={artwork.artworkImage} alt={artwork.title} className="w-20 h-20 rounded-md object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold text-[11px]">
                    <TranslatedText text={artwork.title} />
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    {byText} <TranslatedText text={artwork.artist} />
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= currentReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-[10px] font-medium">{currentReview.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Review Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {reviewedOnText}{" "}
                    {currentReview.reviewDate && !isNaN(new Date(currentReview.reviewDate).getTime())
                      ? format(new Date(currentReview.reviewDate), "MMMM dd, yyyy")
                      : "Invalid date"}
                    {viewType === "seller" && currentReview.reviewerName && (
                      <span> {byText} <TranslatedText text={currentReview.reviewerName} /></span>
                    )}
                  </span>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <h4 className="font-medium text-xs">
                    {viewType === "seller" ? customerReviewLabelText : yourReviewLabelText}
                  </h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-[10px] leading-relaxed">
                      {currentReview.comment ? <TranslatedText text={currentReview.comment} /> : noReviewProvidedText}
                    </p>
                  </div>
                </div>

                {/* Photos */}
                {currentReview.photos && currentReview.photos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs flex items-center gap-2">
                      <Camera className="w-3 h-3" />
                      {photosText} ({currentReview.photos.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {currentReview.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`${reviewPhotoText} ${index + 1}`}
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
                      {sellerRestrictionText}
                    </p>
                  </div>
                ) : (
                  <>
                    {!currentReview.canEdit && !currentReview.canDelete && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-[10px] text-muted-foreground">
                          {expiredEditDeleteText}
                        </p>
                      </div>
                    )}
                    {currentReview.canEdit && !currentReview.canDelete && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-[10px] text-muted-foreground">
                          {expiredDeleteOnlyText}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDetailsModal;
