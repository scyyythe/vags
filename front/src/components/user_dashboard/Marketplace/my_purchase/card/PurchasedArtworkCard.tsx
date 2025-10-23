import React, { useState } from "react";
import { Calendar, Package, Star, MessageSquare, RotateCcw, CheckCircle, Bell } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useAutomaticMessage } from "../../../../../hooks/messages/useAutomaticMessage";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

interface PurchasedArtworkCardProps {
  id: string;
  artworkImage: string;
  title: string;
  artist: string;
  artistId?: string;
  price: number;
  status: string;
  orderDate: string;
  completedDate?: string;
  expectedDelivery?: string;
  isHighlighted?: boolean;
  onViewDetails: () => void;
  onReview?: () => void;
  onViewReview?: () => void;
  onContact?: () => void;
  onTrackOrder?: () => void;
  onRequestRefund?: () => void;
  onCancelOrder?: () => void;
  onReorder?: () => void;
  onMarkCompleted?: () => void;
}

const PurchasedArtworkCard: React.FC<PurchasedArtworkCardProps> = ({
  id,
  artworkImage,
  title,
  artist,
  artistId,
  price,
  status,
  orderDate,
  completedDate,
  expectedDelivery,
  isHighlighted = false,
  onViewDetails,
  onReview,
  onViewReview,
  onContact,
  onTrackOrder,
  onRequestRefund,
  onCancelOrder,
  onReorder,
  onMarkCompleted,
}) => {
  const { handleContactWithAutoMessage } = useAutomaticMessage();
  const { language } = useLanguage();

  // Translation hooks
  const cancelText = useAutoTranslation("Cancel", language);
  const payNowText = useAutoTranslation("Pay Now", language);
  const trackPaymentText = useAutoTranslation("Track Payment", language);
  const contactSellerText = useAutoTranslation("Contact Seller", language);
  const retryPaymentText = useAutoTranslation("Retry Payment", language);
  const supportText = useAutoTranslation("Support", language);
  const markAsCompletedText = useAutoTranslation("Mark as Completed", language);
  const reorderText = useAutoTranslation("Reorder", language);
  const reviewText = useAutoTranslation("Review", language);
  const daysLeftText = useAutoTranslation("d left", language);
  const viewReviewText = useAutoTranslation("View Review", language);
  const byText = useAutoTranslation("by", language);
  const orderedText = useAutoTranslation("Ordered:", language);
  const expectedText = useAutoTranslation("Expected:", language);

  const canReview = () => {
    if (!completedDate || typeof completedDate !== "string") return false;

    const completed = new Date(completedDate);
    if (isNaN(completed.getTime())) {
      console.warn("Invalid completedDate:", completedDate);
      return false;
    }

    const daysSinceCompleted = differenceInDays(new Date(), completed);
    return daysSinceCompleted <= 30;
  };

  const wrap = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };

  const normalizedStatus = status?.toLowerCase().trim();

  const getStatusActions = () => {
    const daysLeft = completedDate ? 30 - differenceInDays(new Date(), new Date(completedDate)) : 0;
    const reviewAllowed = canReview();
    const normalizedStatus = status?.toLowerCase().trim();
    const hasBeenReviewed = normalizedStatus === "reviewed";

    switch (normalizedStatus) {
      case "pending_payment":
        return (
          <>
            <button className="text-[10px] text-gray-500 py-1.5 px-4 rounded-full border" onClick={wrap(onCancelOrder)}>
              {cancelText}
            </button>
            <button
              className="text-[10px] text-white py-1.5 px-4 bg-red-700 rounded-full border"
              onClick={wrap(() => {})}
            >
              {payNowText}
            </button>
          </>
        );

      case "processing":
        return (
          <button
            className="flex text-[10px] py-1.5 px-4 border border-gray-400 rounded-full"
            onClick={wrap(onTrackOrder)}
          >
            <Package className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
            {trackPaymentText}
          </button>
        );

      case "paid":
        return (
          <>
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-300 rounded-full"
              onClick={wrap(() => handleContactWithAutoMessage(artistId!, artist, title, id))}
            >
              <MessageSquare className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {contactSellerText}
            </button>
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-500 rounded-full"
              onClick={wrap(onTrackOrder)}
            >
              <Package className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {trackPaymentText}
            </button>
          </>
        );

      case "failed":
        return (
          <>
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-400 rounded-full"
              onClick={wrap(onRequestRefund)}
            >
              <RotateCcw className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {retryPaymentText}
            </button>
            <button className="text-[10px] py-1.5 px-4 bg-gray-200 rounded-full" onClick={wrap(onContact)}>
              {supportText}
            </button>
          </>
        );

      case "to_receive":
        return (
          <>
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-300 rounded-full"
              onClick={wrap(() => handleContactWithAutoMessage(artistId!, artist, title, id))}
            >
              <MessageSquare className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {contactSellerText}
            </button>
            <button
              className="flex text-[10px] text-white py-1.5 px-4 bg-green-600 rounded-full"
              onClick={wrap(onMarkCompleted)}
            >
              <CheckCircle className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {markAsCompletedText}
            </button>
          </>
        );

      case "cancelled":
      case "refunded":
        return (
          <button
            className="flex text-[10px] py-1.5 px-4 border border-gray-400 rounded-full"
            onClick={wrap(onReorder)}
          >
            <RotateCcw className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
            {reorderText}
          </button>
        );

      case "completed":
        return (
          <>
            {!hasBeenReviewed && reviewAllowed && (
              <button
                className="flex text-[10px] text-white py-1.5 px-4 bg-red-700 rounded-full"
                onClick={wrap(onReview)}
              >
                <Star className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
                {reviewText} ({daysLeft}{daysLeftText})
              </button>
            )}
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-400 rounded-full"
              onClick={wrap(onReorder)}
            >
              <RotateCcw className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {reorderText}
            </button>
          </>
        );

      case "reviewed":
        return (
          <>
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-300 rounded-full"
              onClick={wrap(onViewReview)}
            >
              <Star className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {viewReviewText}
            </button>
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-400 rounded-full"
              onClick={wrap(onReorder)}
            >
              <RotateCcw className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {reorderText}
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-card dark:bg-gray-800 border rounded-lg py-4 px-6 group transition-all duration-300 cursor-pointer hover:shadow-lg ${
        isHighlighted ? "border border-red-300 dark:border-red-600 shadow-[0_0_6px_rgba(239,68,68,0.7)]" : "border-border dark:border-gray-600"
      }`}
      onClick={onViewDetails}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative">
          <img src={artworkImage} alt={title} className="w-20 h-20 rounded-md object-cover" />
          {/* {isHighlighted && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
          )} */}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start pt-1.5">
            <div>
              <h3 className="font-semibold text-[13px] text-foreground dark:text-gray-100 truncate pb-0.5">
                <TranslatedText text={title} />
              </h3>
              <p className="text-[10px] text-muted-foreground dark:text-gray-400">
                {byText} <TranslatedText text={artist} />
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-foreground dark:text-gray-100">
                ₱
                {typeof price === "number"
                  ? price >= 1000
                    ? `${(price / 1000).toFixed(1)}k`
                    : price.toLocaleString()
                  : "₱—"}
              </p>
            </div>
          </div>

          {/* Dates + Actions Row */}
          <div className="flex justify-between items-center text-[11px] flex-wrap gap-2 mt-2">
            {/* Order Dates */}
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <Calendar className="w-2.5 h-2.5" />
                <span>
                  {orderedText} <TranslatedText text={orderDate} />
                </span>
              </div>
              {expectedDelivery && (
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                  <Package className="w-2.5 h-2.5" />
                  <span>
                    {expectedText} <TranslatedText text={expectedDelivery} />
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">{getStatusActions()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasedArtworkCard;
