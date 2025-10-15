import React from "react";
import { Heart, MessageCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLoggedInUserId } from "@/auth/decode";

interface ThankYouMessageBubbleProps {
  sellerName: string;
  artworkTitle: string;
  buyerName: string;
  rating?: number;
  onViewReview?: () => void;
  isSender?: boolean;
  messageType?: "thankYou";
  orderId?: string;
}

const ThankYouMessageBubble: React.FC<ThankYouMessageBubbleProps> = ({
  sellerName,
  artworkTitle,
  buyerName,
  rating,
  onViewReview,
  isSender = false,
  messageType = "thankYou",
  orderId,
}) => {
  const navigate = useNavigate();
  const currentUserId = getLoggedInUserId();

  const handleViewReview = () => {
    if (onViewReview) {
      onViewReview();
    } else {
      if (currentUserId) {
        if (isSender) {
          // Sender (seller) navigation - go to sold artworks to see reviews
          navigate(`/userprofile/${currentUserId}`, {
            state: {
              activeTab: "onSale",
              mainTab: "myListings",
              activeSubGroup: "soldArtworks",
              subTab: "reviews",
              highlightedOrderId: orderId,
            },
          });
        } else {
          // Receiver (buyer) navigation - go to purchase history
          navigate(`/userprofile/${currentUserId}`, {
            state: {
              activeTab: "onSale",
              mainTab: "myPurchase",
              activeSubGroup: "purchasedArtworks",
              subTab: "reviewed",
            },
          });
        }
      } else {
        console.log("View review details");
      }
    }
  };

  // Dynamic color setup - matching AutomaticMessageBubble
  const textMain = isSender ? "text-white" : "text-gray-900";
  const textSecondary = isSender ? "text-white/80" : "text-gray-600";
  const textHighlight = "text-pink-500";
  const borderColor = isSender ? "border-white/20" : "border-gray-300/50";
  const iconColor = isSender ? "text-pink-400" : "text-pink-600";

  return (
    <div className="space-y-3 border border-red-200 rounded-lg p-3 bg-red-50/30">
      {/* Header */}
      <div className={`flex items-center gap-2 pb-2 border-b ${borderColor}`}>
        <Heart className={`w-4 h-4 ${iconColor}`} />
        <span className={`font-bold text-xs ${textMain}`}>Thank You Message!</span>
      </div>

      {/* Body */}
      <div className={`space-y-2.5 text-[11px] leading-relaxed ${textMain}`}>
        <p>
          Hello <span className={`font-semibold ${textMain}`}>{buyerName}</span>,
        </p>

        <p>
          Thank you for purchasing <span className={`font-semibold ${textHighlight}`}>"{artworkTitle}"</span>! Your
          support means the world to me. I hope you love your new piece!✨
        </p>

        {rating && (
          <div className="flex items-center gap-2">
            <span className={textSecondary}>Your rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
              <span className={`text-[10px] ${textSecondary}`}>({rating}/5)</span>
            </div>
          </div>
        )}

        <p className={`italic text-[10px] ${textSecondary}`}>
          Your purchase helps me continue creating art and brings joy to collectors like you. Thank you for choosing my
          work!
        </p>

        <button
          onClick={handleViewReview}
          className={`flex items-center gap-2 underline font-medium mt-3 transition-colors ${
            isSender ? "text-white hover:text-pink-400" : "text-pink-600 hover:text-pink-700"
          }`}
        >
          <MessageCircle className={`w-4 h-4 ${iconColor}`} />
          View Review Details
        </button>

        <div
          className={`rounded-lg p-3 mt-4 ${
            isSender ? "bg-pink-400/20 border border-pink-300/30" : "bg-pink-100/40 border border-pink-400/50"
          }`}
        >
          <p className="text-[9px] text-pink-700">
            <span className="font-semibold">From the Artist:</span> Your support means everything to me. Thank you for
            believing in my art and helping me continue this creative journey.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouMessageBubble;
