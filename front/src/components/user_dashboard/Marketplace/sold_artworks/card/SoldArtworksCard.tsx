import React, { useState, useEffect } from "react";
import { Calendar, User, DollarSign, Package, MessageCircle, Eye, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { autoTranslate } from "@/utils/autoTranslate";

interface SoldArtworkCardProps {
  id: string;
  artworkImage: string;
  title: string;
  buyer: string;
  buyer_id?: string;
  price: number;
  status: string;
  saleDate: string;
  completedDate?: string;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
  };
  artwork: {
    size: string;
    medium: string;
    style: string;
    edition: string;
    yearCreated: number;
  };
  commission?: number;
  review?: {
    rating: number;
    comment: string;
    photos: string[];
    reviewDate: string;
  };
  isHighlighted?: boolean;
  onViewDetails: (artwork: any) => void;
  onContactBuyer: (artwork: any) => void;
  onThankBuyer?: (artwork: any) => void;
  onMarkAsShipped?: (artwork: any) => void;
  onViewPayment?: (artwork: any) => void;
  onPaymentHover?: (artwork: any) => void;
  onProcessRefund?: (artwork: any) => void;
  onViewReview?: (artwork: any) => void;
  onTrackProgress?: (artwork: any) => void;
  onViewSummary?: (artwork: any) => void;
}

const SoldArtworkCard: React.FC<SoldArtworkCardProps> = ({
  id,
  artworkImage,
  title,
  buyer,
  buyer_id,
  price,
  status,
  saleDate,
  completedDate,
  paymentMethod,
  shippingAddress,
  artwork,
  commission = 0.1,
  review,
  isHighlighted = false,
  onViewDetails,
  onContactBuyer,
  onThankBuyer,
  onMarkAsShipped,
  onViewPayment,
  onPaymentHover,
  onProcessRefund,
  onViewReview,
  onTrackProgress,
  onViewSummary,
}) => {
  const { language } = useLanguage();

  // State for translated dynamic data
  const [translatedTitle, setTranslatedTitle] = useState(title);
  const [translatedBuyer, setTranslatedBuyer] = useState(buyer);
  const [translatedStatusLabels, setTranslatedStatusLabels] = useState<Record<string, string>>({});

  // Translation hooks for static text
  const orderText = useAutoTranslation("Order", language);
  const priceText = useAutoTranslation("Price", language);
  const netEarningsText = useAutoTranslation("Net Earnings", language);
  const contactBuyerText = useAutoTranslation("Contact Buyer", language);
  const viewDetailsText = useAutoTranslation("View Details", language);
  const markAsShippedText = useAutoTranslation("Mark as Shipped", language);
  const markedAsShippedText = useAutoTranslation("Marked as Shipped", language);
  const viewPaymentText = useAutoTranslation("View Payment", language);
  const trackProgressText = useAutoTranslation("Track Progress", language);
  const viewSummaryText = useAutoTranslation("View Summary", language);
  const refundDetailsText = useAutoTranslation("Refund Details", language);
  const viewReviewText = useAutoTranslation("View Review", language);
  const thankBuyerText = useAutoTranslation("Thank Buyer", language);

  // Effect to translate dynamic data
  useEffect(() => {
    const translateDynamicData = async () => {
      try {
        if (language.toLowerCase() !== "en") {
          const [translatedTitleResult, translatedBuyerResult] = await Promise.all([
            autoTranslate(title, language.toLowerCase()),
            autoTranslate(buyer, language.toLowerCase())
          ]);
          setTranslatedTitle(translatedTitleResult);
          setTranslatedBuyer(translatedBuyerResult);
        } else {
          setTranslatedTitle(title);
          setTranslatedBuyer(buyer);
        }
      } catch (error) {
        console.warn("Failed to translate dynamic data:", error);
        setTranslatedTitle(title);
        setTranslatedBuyer(buyer);
      }
    };

    translateDynamicData();
  }, [title, buyer, language]);

  // Effect to translate status labels
  useEffect(() => {
    const translateStatusLabels = async () => {
      try {
        const statusLabels = {
          "Awaiting Payment": "Awaiting Payment",
          "Payment Received": "Payment Received", 
          "In Progress": "In Progress",
          "Completed": "Completed",
          "Cancelled": "Cancelled",
          "Refunded": "Refunded",
          "Reviewed": "Reviewed"
        };

        if (language.toLowerCase() !== "en") {
          const translatedLabels: Record<string, string> = {};
          for (const [key, value] of Object.entries(statusLabels)) {
            translatedLabels[key] = await autoTranslate(value, language.toLowerCase());
          }
          setTranslatedStatusLabels(translatedLabels);
        } else {
          setTranslatedStatusLabels(statusLabels);
        }
      } catch (error) {
        console.warn("Failed to translate status labels:", error);
        setTranslatedStatusLabels({
          "Awaiting Payment": "Awaiting Payment",
          "Payment Received": "Payment Received", 
          "In Progress": "In Progress",
          "Completed": "Completed",
          "Cancelled": "Cancelled",
          "Refunded": "Refunded",
          "Reviewed": "Reviewed"
        });
      }
    };

    translateStatusLabels();
  }, [language]);

  const artworkData = {
    id,
    artworkImage,
    title,
    buyer,
    buyer_id,
    price,
    status,
    saleDate,
    completedDate,
    paymentMethod,
    shippingAddress,
    artwork,
    review,
    timeline: [
      { status: "Order Placed", date: saleDate, description: "Your order has been confirmed", completed: true },
      { status: "Payment Confirmed", date: saleDate, description: "Payment received", completed: true },
      { status: "Shipped", date: "", description: "Artwork will be shipped", completed: false },
      { status: "Delivered", date: "", description: "Artwork delivered to buyer", completed: false },
    ],
  };

  const getStatusBadge = () => {
    const normalizedStatus = status.toLowerCase();

    const statusConfig = {
      awaiting_payment: { label: translatedStatusLabels["Awaiting Payment"] || "Awaiting Payment", variant: "secondary" as const },
      payment_received: { label: translatedStatusLabels["Payment Received"] || "Payment Received", variant: "default" as const },
      in_progress: { label: translatedStatusLabels["In Progress"] || "In Progress", variant: "outline" as const },
      to_receive: { label: translatedStatusLabels["In Progress"] || "In Progress", variant: "outline" as const },
      completed: { label: translatedStatusLabels["Completed"] || "Completed", variant: "default" as const },
      cancelled: { label: translatedStatusLabels["Cancelled"] || "Cancelled", variant: "destructive" as const },
      refunded: { label: translatedStatusLabels["Refunded"] || "Refunded", variant: "secondary" as const },
      reviews: { label: translatedStatusLabels["Reviewed"] || "Reviewed", variant: "default" as const },
      reviewed: { label: translatedStatusLabels["Reviewed"] || "Reviewed", variant: "default" as const },
    };

    return (
      statusConfig[normalizedStatus as keyof typeof statusConfig] || {
        label: status,
        variant: "default" as const,
      }
    );
  };

  const [shippedArtworks, setShippedArtworks] = useState<Record<string, boolean>>({});

  const getActionButtons = () => {
    switch (status) {
      case "awaiting_payment":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onContactBuyer(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full border"
            >
              <MessageCircle className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {contactBuyerText}
            </button>
            <button
              onClick={() => onViewDetails(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Eye className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {viewDetailsText}
            </button>
          </div>
        );
      case "payment_received":
      case "paid":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShippedArtworks((prev) => ({
                  ...prev,
                  [id]: !prev[id],
                }));
                if (!shippedArtworks[id]) {
                  onMarkAsShipped?.(artworkData);
                }
              }}
              className={`flex text-[10px] font-medium py-1.5 px-4 rounded-full border transition-all duration-150
                ${shippedArtworks[id] ? "bg-black text-white" : "text-black border"}`}
            >
              <Package className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {shippedArtworks[id] ? markedAsShippedText : markAsShippedText}
            </button>

            <button
              onClick={() => onViewPayment?.(artworkData)}
              onMouseEnter={() => onPaymentHover?.(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100"
            >
              <DollarSign className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {viewPaymentText}
            </button>
          </div>
        );
      case "in_progress":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onContactBuyer(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full border"
            >
              <MessageCircle className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {contactBuyerText}
            </button>
            <button
              onClick={() => onTrackProgress?.(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Eye className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {trackProgressText}
            </button>
          </div>
        );
      case "completed":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onViewSummary?.(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <CheckCircle className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {viewSummaryText}
            </button>
            <button
              onClick={() => onContactBuyer(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full border"
            >
              <MessageCircle className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {contactBuyerText}
            </button>
          </div>
        );
      case "cancelled":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <XCircle className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {viewDetailsText}
            </button>
          </div>
        );
      case "refunded":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onProcessRefund?.(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full border"
            >
              <RotateCcw className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {refundDetailsText}
            </button>
            <button
              onClick={() => onViewDetails(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Eye className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {viewDetailsText}
            </button>
          </div>
        );
      case "reviewed":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onViewReview?.(artworkData)}
              className="flex text-[10px] text-white font-medium py-1.5 px-4 rounded-full bg-black"
            >
              <Eye className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {viewReviewText}
            </button>
            <button
              onClick={() => {
                console.log("🔘 Thank Buyer button clicked in SoldArtworkCard!");
                if (onThankBuyer) {
                  onThankBuyer(artworkData);
                } else {
                  console.log("⚠️ onThankBuyer not provided, falling back to onContactBuyer");
                  onContactBuyer(artworkData);
                }
              }}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full border"
            >
              <MessageCircle className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              {thankBuyerText}
            </button>
          </div>
        );
      default:
        return (
          <button
            onClick={() => onViewDetails(artworkData)}
            className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <Eye className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
            {viewDetailsText}
          </button>
        );
    }
  };

  const netEarnings = price * (1 - commission);
  const statusBadge = getStatusBadge();

  return (
    <Card
      className={`p-4 hover:shadow-md transition-all duration-700 ${
        isHighlighted
          ? "border border-red-300 shadow-[0_0_6px_rgba(239,68,68,0.7)]"
          : "border group transition-all duration-300 cursor-pointer hover:shadow-lg"
      }`}
    >
      <div className="flex gap-4">
        {/* Artwork Image */}
        <div className="flex-shrink-0">
          <img src={artworkImage} alt={title} className="w-20 h-20 rounded-lg object-cover" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-[13px] truncate">{translatedTitle}</h3>
              <p className="text-[11px] text-muted-foreground">{orderText} #{id}</p>
            </div>
            {/* <Badge variant={statusBadge.variant} className="text-[11px]">
              {statusBadge.label}
            </Badge> */}
          </div>

          {/* Info + Actions aligned in row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
              <div className="flex items-center gap-1 text-gray-700">
                <User className="w-2.5 h-2.5" />
                <span className="truncate">{translatedBuyer}</span>
              </div>
              <div className="flex items-center gap-1">
                <p>{priceText}: </p>
                <DollarSign className="w-2.5 h-2.5" />
                <span className="font-semibold">{price >= 1000 ? `${(price / 1000).toFixed(0)}k` : price}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                <span>
                  {saleDate && !isNaN(new Date(saleDate).getTime()) ? format(new Date(saleDate), "MMM dd") : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <p>{netEarningsText}: </p>
                <span className="text-green-600 font-semibold">
                  +₱{netEarnings >= 1000 ? `${(netEarnings / 1000).toFixed(0)}k` : Math.round(netEarnings)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">{getActionButtons()}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SoldArtworkCard;
