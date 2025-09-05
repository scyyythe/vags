import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ArtworkReview {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    profile_picture?: string;
    is_verified?: boolean;
  };
  score: number;
  comment: string;
  created_at: string;
  images?: string[];
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: ArtworkReview[];
  totalReviews: number;
}

const ReviewModal = ({ isOpen, onClose, reviews, totalReviews }: ReviewModalProps) => {
  const [sortBy, setSortBy] = useState("newest");

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className="text-yellow-400 text-sm">
        {index < rating ? "★" : "☆"}
      </span>
    ));
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortBy === "highest") {
      return b.score - a.score;
    }
    if (sortBy === "lowest") {
      return a.score - b.score;
    }
    return 0;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md rounded-lg h-[500px] bg-white flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4 border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-semibold">Review List</DialogTitle>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-[10px] text-gray-600">
              Showing {reviews.length} of {totalReviews} results
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-gray-600">Sort by :</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-24 h-7 text-[10px] border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="newest" className="text-[10px]">
                    Newest
                  </SelectItem>
                  <SelectItem value="oldest" className="text-[10px]">
                    Oldest
                  </SelectItem>
                  <SelectItem value="highest" className="text-[10px]">
                    Highest Rated
                  </SelectItem>
                  <SelectItem value="lowest" className="text-[10px]">
                    Lowest Rated
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="-mb-4 bg-white h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-hide">
          <div className="space-y-6 py-2">
            {sortedReviews.length === 0 ? (
              <p className="text-center text-[11px] text-gray-500">No reviews yet</p>
            ) : (
              sortedReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={review.user?.profile_picture} alt={review.user?.first_name} />
                      <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                        {review.user
                          ? `${review.user.first_name.charAt(0)}${review.user.last_name.charAt(0)}`.toUpperCase()
                          : "NA"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-[11px]">
                            {review.user?.first_name} {review.user?.last_name}
                          </h4>
                          {review.user?.is_verified && <span className="text-[9px] text-gray-500">(Verified)</span>}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center mb-1">{renderStars(review.score)}</div>

                      <p className="text-[10px] text-gray-600 mb-2">{review.comment}</p>

                      {/* Review images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {review.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Review image ${i + 1}`}
                              className="w-16 h-16 object-cover rounded-md border"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
