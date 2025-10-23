import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

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
  const { language } = useLanguage();

  // Translation hooks
  const reviewListText = useAutoTranslation("Review List", language);
  const showingText = useAutoTranslation("Showing", language);
  const ofText = useAutoTranslation("of", language);
  const resultsText = useAutoTranslation("results", language);
  const sortByText = useAutoTranslation("Sort by :", language);
  const newestText = useAutoTranslation("Newest", language);
  const oldestText = useAutoTranslation("Oldest", language);
  const highestRatedText = useAutoTranslation("Highest Rated", language);
  const lowestRatedText = useAutoTranslation("Lowest Rated", language);
  const noReviewsYetText = useAutoTranslation("No reviews yet", language);
  const verifiedText = useAutoTranslation("Verified", language);

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
        className="max-w-md rounded-lg h-[500px] bg-white dark:bg-gray-800 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4 border-gray-100 dark:border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">{reviewListText}</DialogTitle>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-[10px] text-gray-600 dark:text-gray-400">
              {showingText} {reviews.length} {ofText} {totalReviews} {resultsText}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-gray-600 dark:text-gray-400">{sortByText}</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-24 h-7 text-[10px] border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg z-50">
                  <SelectItem value="newest" className="text-[10px]">
                    {newestText}
                  </SelectItem>
                  <SelectItem value="oldest" className="text-[10px]">
                    {oldestText}
                  </SelectItem>
                  <SelectItem value="highest" className="text-[10px]">
                    {highestRatedText}
                  </SelectItem>
                  <SelectItem value="lowest" className="text-[10px]">
                    {lowestRatedText}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="-mb-4 bg-white dark:bg-gray-800 h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-hide">
          <div className="space-y-6 py-2">
            {sortedReviews.length === 0 ? (
              <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">{noReviewsYetText}</p>
            ) : (
              sortedReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 dark:border-gray-600 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={review.user?.profile_picture} alt={review.user?.first_name} />
                      <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs">
                        {review.user
                          ? `${review.user.first_name.charAt(0)}${review.user.last_name.charAt(0)}`.toUpperCase()
                          : "NA"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-[11px] text-gray-900 dark:text-gray-100">
                            <TranslatedText text={review.user?.first_name} /> <TranslatedText text={review.user?.last_name} />
                          </h4>
                          {review.user?.is_verified && <span className="text-[9px] text-gray-500 dark:text-gray-400">({verifiedText})</span>}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center mb-1">{renderStars(review.score)}</div>

                      <p className="text-[10px] text-gray-600 dark:text-gray-300 mb-2">
                        <TranslatedText text={review.comment} />
                      </p>

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
