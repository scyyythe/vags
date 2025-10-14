import React, { useState } from "react";
import { Calendar, Package, Star, MessageSquare, RotateCcw, CheckCircle, Bell } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useAutomaticMessage } from "../../../../../hooks/messages/useAutomaticMessage";

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
              Cancel
            </button>
            <button
              className="text-[10px] text-white py-1.5 px-4 bg-red-700 rounded-full border"
              onClick={wrap(() => {})}
            >
              Pay Now
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
            Track Payment
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
              Contact Seller
            </button>
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-500 rounded-full"
              onClick={wrap(onTrackOrder)}
            >
              <Package className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              Track Payment
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
              Retry Payment
            </button>
            <button className="text-[10px] py-1.5 px-4 bg-gray-200 rounded-full" onClick={wrap(onContact)}>
              Support
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
              Contact Seller
            </button>
            <button
              className="flex text-[10px] text-white py-1.5 px-4 bg-green-600 rounded-full"
              onClick={wrap(onMarkCompleted)}
            >
              <CheckCircle className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              Mark as Completed
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
            Reorder
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
                Review ({daysLeft}d left)
              </button>
            )}
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-400 rounded-full"
              onClick={wrap(onReorder)}
            >
              <RotateCcw className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              Reorder
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
              View Review
            </button>
            <button
              className="flex text-[10px] py-1.5 px-4 border border-gray-400 rounded-full"
              onClick={wrap(onReorder)}
            >
              <RotateCcw className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              Reorder
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-card border rounded-lg py-4 px-6 group transition-all duration-300 cursor-pointer hover:shadow-lg ${
        isHighlighted ? "border-red-400 border-2 bg-red-50 shadow-lg ring-2 ring-red-200" : "border-border"
      }`}
      onClick={onViewDetails}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative">
          <img src={artworkImage} alt={title} className="w-20 h-20 rounded-md object-cover" />
          {isHighlighted && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start pt-1.5">
            <div>
              <h3 className="font-semibold text-[13px] text-foreground truncate pb-0.5">{title}</h3>
              <p className="text-[10px] text-muted-foreground">by {artist}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-foreground">
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
              <div className="flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                <span>Ordered: {orderDate}</span>
              </div>
              {expectedDelivery && (
                <div className="flex items-center gap-1">
                  <Package className="w-2.5 h-2.5" />
                  <span>Expected: {expectedDelivery}</span>
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
