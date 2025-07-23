import React from "react";
import {
  X,
  Calendar,
  Package,
  MapPin,
  CreditCard,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose ,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewType?: "buyer" | "seller";
  order: {
    id: string;
    artworkImage: string;
    title: string;
    artist?: string;
    buyer?: string;
    price: number;
    status: string;
    orderDate?: string;
    saleDate?: string;
    expectedDelivery?: string;
    paymentMethod: string;
    shippingAddress: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
    };
    artwork: {
      size: string;
      medium: string;
      style: string;
      edition: string;
      yearCreated: number;
    };
    timeline: Array<{
      status: string;
      date: string;
      description: string;
      completed: boolean;
    }>;
  };
  onContactBuyer?: (artwork: any) => void;
  onViewPayment?: (artwork: any) => void;
  onMarkAsShipped?: (artwork: any) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  viewType = "buyer",
  onContactBuyer,
  onViewPayment,
  onMarkAsShipped,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_payment":
        return "bg-yellow-500";
      case "payment_processing":
        return "bg-blue-500";
      case "paid":
      case "completed":
        return "bg-green-600";
      case "failed":
        return "bg-red-600";
      case "cancelled":
      case "refunded":
        return "bg-gray-500";
      case "reviewed":
        return "bg-indigo-600";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {if (!open) onClose();}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto order-details-scrollbar-hidden" 
      onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm mt-3">
            <span>{viewType === "seller" ? "Sale Details" : "Order Details"}</span>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(order.status)} text-white text-[10px]`}>
                {order.status.replace(/_/g, " ").toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artwork Section */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Palette className="w-2.5 h-2.5" />
                Artwork Details
              </h3>
              <div className="flex gap-4">
                <img
                  src={order.artworkImage}
                  alt={order.title}
                  className="w-24 h-24 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-[11px] text-foreground">
                    {order.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    {viewType === "seller" ? `Sold to ${order.buyer}` : `by ${order.artist}`}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                    <div>Size: {order.artwork.size}</div>
                    <div>Medium: {order.artwork.medium}</div>
                    <div>Style: {order.artwork.style}</div>
                    <div>Edition: {order.artwork.edition}</div>
                    <div className="col-span-2">
                      Year: {order.artwork.yearCreated}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <MapPin className="w-2.5 h-2.5" />
                {viewType === "seller" ? "Buyer Address" : "Shipping Address"}
              </h3>
              <div className="text-[10px] leading-snug">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.address}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}{order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <CreditCard className="w-2.5 h-2.5" />
                Payment Information
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <CreditCard className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-medium">{order.paymentMethod}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {viewType === "seller" ? "Payment received" : "Payment confirmed"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            {viewType === "buyer" && order.timeline && order.timeline.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Package className="w-2.5 h-2.5" />
                  Payment Timeline
                </h3>
                <div className="space-y-3">
                  {order.timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          item.completed ? "bg-green-600" : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[11px] font-medium">{item.status}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-sm">{viewType === "seller" ? "Sale Summary" : "Order Summary"}</h3>

              <div className="space-y-3 text-[10px]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {viewType === "seller" ? "Sale Date" : "Order Date"}
                    </p>
                    <p className="font-medium text-[11px]">{order.saleDate || order.orderDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="w-2.5 h-2.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {viewType === "seller" ? "Sale ID" : "Order ID"}
                    </p>
                    <p className="font-medium text-[10px]">{order.id}</p>
                  </div>
                </div>

                {order.expectedDelivery && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Expected Delivery</p>
                      <p className="font-medium text-[11px]">
                        {order.expectedDelivery}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold">Total</span>
                  <span className="text-sm font-bold text-foreground">
                    ₱
                    {order.price >= 1000
                      ? `${(order.price / 1000).toFixed(1)}k`
                      : order.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                {viewType === "seller" ? (
                  <>
                    <Button className="w-full" size="sm" onClick={onContactBuyer}>
                      Contact Buyer
                    </Button>
                    <Button variant="outline" className="w-full" size="sm" onClick={onViewPayment}>
                      View Payment Details
                    </Button>
                    {(order.status === "payment_received" || order.status === "in_progress") && (
                      <Button variant="secondary" className="w-full" size="sm" onClick={onMarkAsShipped}>
                        Mark as Shipped
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button className="w-full" size="sm">
                      Contact Seller
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Track Payment
                    </Button>
                    {order.status === "completed" && (
                      <Button variant="secondary" className="w-full" size="sm">
                        Leave Review
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
