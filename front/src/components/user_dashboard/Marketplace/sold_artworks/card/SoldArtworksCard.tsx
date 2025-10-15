import React, { useState } from "react";
import { Calendar, User, DollarSign, Package, MessageCircle, Eye, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
  onProcessRefund,
  onViewReview,
  onTrackProgress,
  onViewSummary,
}) => {
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
      awaiting_payment: { label: "Awaiting Payment", variant: "secondary" as const },
      payment_received: { label: "Payment Received", variant: "default" as const },
      in_progress: { label: "In Progress", variant: "outline" as const },
      to_receive: { label: "In Progress", variant: "outline" as const },
      completed: { label: "Completed", variant: "default" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
      refunded: { label: "Refunded", variant: "secondary" as const },
      reviews: { label: "Reviewed", variant: "default" as const },
      reviewed: { label: "Reviewed", variant: "default" as const },
    };

    return (
      statusConfig[normalizedStatus as keyof typeof statusConfig] || {
        label: status,
        variant: "default" as const,
      }
    );

    return (
      statusConfig[status as keyof typeof statusConfig] || {
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
              Contact Buyer
            </button>
            <button
              onClick={() => onViewDetails(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Eye className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              View Details
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
              {shippedArtworks[id] ? "Marked as Shipped" : "Mark as Shipped"}
            </button>

            <button
              onClick={() => onViewPayment?.(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100"
            >
              <DollarSign className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              View Payment
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
              Contact Buyer
            </button>
            <button
              onClick={() => onTrackProgress?.(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Eye className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              Track Progress
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
              View Summary
            </button>
            <button
              onClick={() => onContactBuyer(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full border"
            >
              <MessageCircle className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              Contact Buyer
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
              View Details
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
              Refund Details
            </button>
            <button
              onClick={() => onViewDetails(artworkData)}
              className="flex text-[10px] text-black font-medium py-1.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Eye className="w-2.5 h-2.5 mr-1.5 mt-0.5" />
              View Details
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
              View Review
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
              Thank Buyer
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
            View Details
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
              <h3 className="font-semibold text-[13px] truncate">{title}</h3>
              <p className="text-[11px] text-muted-foreground">Order #{id}</p>
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
                <span className="truncate">{buyer}</span>
              </div>
              <div className="flex items-center gap-1">
                <p>Price: </p>
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
                <p>Net Earnings: </p>
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
