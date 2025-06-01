import { useState } from "react";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Review {
  id: string;
  user: string;
  userImage: string;
  rating: number;
  comment: string;
  timestamp: string;
  verified: boolean;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
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
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    return 0;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] bg-white flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Review List</DialogTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing 1-3 out of {totalReviews} results
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by :</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-24 h-8 text-xs border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-1">
          <div className="space-y-6 py-4">
            {sortedReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.userImage} alt={review.user} />
                    <AvatarFallback className="bg-gray-300 text-gray-600 text-sm">
                      {review.user.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">{review.user}</h4>
                        {review.verified && (
                          <span className="text-xs text-gray-500">(Verified)</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">1 month ago</span>
                    </div>
                    
                    <h5 className="font-medium text-sm mb-2">"Even More Stunning in Person!"</h5>
                    
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {review.comment}
                    </p>
                    
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                      <span className="text-xs font-medium ml-1">{review.rating}.0</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
