import React from "react";
import {
  Calendar,
  User,
  DollarSign,
  Package,
  MessageCircle,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface SoldArtworkCardProps {
  id: string;
  artworkImage: string;
  title: string;
  buyer: string;
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
  onViewDetails: (artwork: any) => void;
  onContactBuyer: (artwork: any) => void;
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
  price,
  status,
  saleDate,
  completedDate,
  paymentMethod,
  shippingAddress,
  artwork,
  commission = 0.1,
  review,
  onViewDetails,
  onContactBuyer,
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
      { status: "Delivered", date: "", description: "Artwork delivered to buyer", completed: false }
    ]
  };

  const getStatusBadge = () => {
    const statusConfig = {
      awaiting_payment: { label: "Awaiting Payment", variant: "secondary" as const },
      payment_received: { label: "Payment Received", variant: "default" as const },
      in_progress: { label: "In Progress", variant: "outline" as const },
      completed: { label: "Completed", variant: "default" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
      refunded: { label: "Refunded", variant: "secondary" as const },
      reviews: { label: "Reviewed", variant: "default" as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "default" as const,
    };
  };

  const getActionButtons = () => {
    switch (status) {
      case "awaiting_payment":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onContactBuyer(artworkData)} className="text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              Contact Buyer
            </Button>
            <Button size="sm" variant="outline" onClick={() => onViewDetails(artworkData)} className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        );
      case "payment_received":
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onMarkAsShipped?.(artworkData)} className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              Mark as Shipped
            </Button>
            <Button size="sm" variant="outline" onClick={() => onViewPayment?.(artworkData)} className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              View Payment
            </Button>
          </div>
        );
      case "in_progress":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onContactBuyer(artworkData)} className="text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              Contact Buyer
            </Button>
            <Button size="sm" variant="outline" onClick={() => onTrackProgress?.(artworkData)} className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Track Progress
            </Button>
          </div>
        );
      case "completed":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onViewSummary?.(artworkData)} className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              View Summary
            </Button>
            <Button size="sm" variant="outline" onClick={() => onContactBuyer(artworkData)} className="text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              Contact Buyer
            </Button>
          </div>
        );
      case "cancelled":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onViewDetails(artworkData)} className="text-xs">
              <XCircle className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        );
      case "refunded":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onProcessRefund?.(artworkData)} className="text-xs">
              <RotateCcw className="w-3 h-3 mr-1" />
              Refund Details
            </Button>
            <Button size="sm" variant="outline" onClick={() => onViewDetails(artworkData)} className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        );
      case "reviews":
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onViewReview?.(artworkData)} className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              View Review
            </Button>
            <Button size="sm" variant="outline" onClick={() => onContactBuyer(artworkData)} className="text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              Thank Buyer
            </Button>
          </div>
        );
      default:
        return (
          <Button size="sm" variant="outline" onClick={() => onViewDetails(artworkData)} className="text-xs">
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
        );
    }
  };

  const netEarnings = price * (1 - commission);
  const statusBadge = getStatusBadge();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Artwork Image */}
        <div className="flex-shrink-0">
          <img
            src={artworkImage}
            alt={title}
            className="w-20 h-20 rounded-lg object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-sm truncate">{title}</h3>
              <p className="text-xs text-muted-foreground">Order #{id}</p>
            </div>
            <Badge variant={statusBadge.variant} className="text-xs">
              {statusBadge.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate">{buyer}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>₱{price >= 1000 ? `${(price / 1000).toFixed(0)}k` : price}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(saleDate), "MMM dd")}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-600 font-medium">
                +₱{netEarnings >= 1000 ? `${(netEarnings / 1000).toFixed(0)}k` : Math.round(netEarnings)}
              </span>
            </div>
          </div>

          {/* Review preview */}
          {status === "reviews" && review && (
            <div className="mb-3 p-2 bg-muted rounded-md">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {format(new Date(review.reviewDate), "MMM dd")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            {getActionButtons()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SoldArtworkCard;
