import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLoggedInUserId } from "@/auth/decode";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { autoTranslate } from "@/utils/autoTranslate";

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
  const { language } = useLanguage();

  // State for translated dynamic data
  const [translatedSellerName, setTranslatedSellerName] = useState(sellerName);
  const [translatedArtworkTitle, setTranslatedArtworkTitle] = useState(artworkTitle);
  const [translatedBuyerName, setTranslatedBuyerName] = useState(buyerName);

  // Translation hooks for static text
  const thankYouMessageText = useAutoTranslation("Thank You Message!", language);
  const helloText = useAutoTranslation("Hello", language);
  const thankYouForPurchasingText = useAutoTranslation("Thank you for purchasing", language);
  const supportMeansText = useAutoTranslation("Your support means the world to me. I hope you love your new piece!", language);
  const yourRatingText = useAutoTranslation("Your rating:", language);
  const yourPurchaseHelpsText = useAutoTranslation("Your purchase helps me continue creating art and brings joy to collectors like you. Thank you for choosing my work!", language);
  const fromTheArtistText = useAutoTranslation("From the Artist:", language);
  const artistSupportText = useAutoTranslation("Your support means everything to me. Thank you for believing in my art and helping me continue this creative journey.", language);
  const viewReviewDetailsText = useAutoTranslation("View Review Details", language);

  // Effect to translate dynamic data
  useEffect(() => {
    const translateDynamicData = async () => {
      try {
        if (language.toLowerCase() !== "en") {
          const [translatedSeller, translatedArtwork, translatedBuyer] = await Promise.all([
            autoTranslate(sellerName, language.toLowerCase()),
            autoTranslate(artworkTitle, language.toLowerCase()),
            autoTranslate(buyerName, language.toLowerCase())
          ]);
          setTranslatedSellerName(translatedSeller);
          setTranslatedArtworkTitle(translatedArtwork);
          setTranslatedBuyerName(translatedBuyer);
        } else {
          setTranslatedSellerName(sellerName);
          setTranslatedArtworkTitle(artworkTitle);
          setTranslatedBuyerName(buyerName);
        }
      } catch (error) {
        console.warn("Failed to translate dynamic data:", error);
        // Fallback to original data
        setTranslatedSellerName(sellerName);
        setTranslatedArtworkTitle(artworkTitle);
        setTranslatedBuyerName(buyerName);
      }
    };

    translateDynamicData();
  }, [sellerName, artworkTitle, buyerName, language]);

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
  const textMain = isSender ? "text-white" : "text-gray-900 dark:text-gray-100";
  const textSecondary = isSender ? "text-white/80" : "text-gray-600 dark:text-gray-400";
  const textHighlight = isSender ? "text-yellow-400" : "text-blue-700 dark:text-blue-400";
  const borderColor = isSender ? "border-white/20" : "border-gray-300/50 dark:border-gray-600/50";
  const iconColor = isSender ? "text-yellow-300" : "text-blue-600 dark:text-blue-400";

  return (
    <div className="space-y-3 max-w-[200px] mx-auto">
      {/* Header */}
      <div className={`flex items-center gap-2 pb-2 border-b ${borderColor}`}>
        <p className="text-xs">
          {helloText} <span className={`font-semibold ${textMain}`}>{translatedBuyerName}</span>!
        </p>
      </div>

      {/* Body */}
      <div className={`space-y-2.5 text-[11px] leading-relaxed ${textMain}`}>

        <p>
          {thankYouForPurchasingText} <span className={`font-semibold ${textHighlight}`}>"{translatedArtworkTitle}"</span>! {supportMeansText}
        </p>

        {rating && (
          <div className="flex items-center gap-2">
            <span className={textSecondary}>{yourRatingText}</span>
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
          {yourPurchaseHelpsText}
        </p>

        <button
          onClick={handleViewReview}
          className={`flex items-center gap-2 underline font-medium mt-3 transition-colors ${
            isSender ? "text-yellow-300" : "text-blue-600"
          }`}
        >
          <MessageCircle className={`w-4 h-4 ${iconColor}`} />
          {viewReviewDetailsText}
        </button>

        {/* <div
          className={`rounded-lg p-3 mt-4 ${
            isSender ? "bg-pink-400/20 border border-pink-300/30" : "bg-pink-100/40 border border-pink-400/50"
          }`}
        >
          <p className="text-[9px] text-pink-700">
            <span className="font-semibold">{fromTheArtistText}</span> {artistSupportText}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default ThankYouMessageBubble;
