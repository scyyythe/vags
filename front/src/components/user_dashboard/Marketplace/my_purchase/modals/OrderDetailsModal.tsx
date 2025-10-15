import { useState } from "react";
import { X, Calendar, Package, MapPin, CreditCard, Palette, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    buyer_id?: string;
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
      quantity?: number;
      yearCreated: number;
    };
    timeline: Array<{
      status: string;
      date: string;
      time?: string;
      description: string;
      completed: boolean;
      icon?: React.ReactNode;
    }>;
  };
  onContactBuyer?: (artwork: any) => void;
  onViewPayment?: (artwork: any) => void;
  onMarkAsShipped?: (artwork: any) => void;
  onLeaveReview?: (order: any) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  viewType = "buyer",
  onContactBuyer,
  onViewPayment,
  onMarkAsShipped,
  onLeaveReview,
}) => {
  const computedOrder = {
    ...order,
    paymentMethod: order.paymentMethod,
    amount: order.price,
    processingFee: +(order.price * 0.05).toFixed(2),
    netAmount: +(order.price * 0.95).toFixed(2),
    timeline: [
      {
        status: "Payment Initiated",
        date: order.orderDate,
        time: "10:30 AM",
        description: "Payment request sent to payment gateway",
        completed: true,
        icon: <CreditCard className="w-3 h-3" />,
      },
      {
        status: "Payment Processing",
        date: order.orderDate,
        time: "10:31 AM",
        description: "Payment being processed by bank",
        completed: order.status.toLowerCase() !== "pending_payment",
        icon: <Clock className="w-3 h-3" />,
      },
      {
        status: "Payment Verified",
        date: order.orderDate,
        time: "10:35 AM",
        description: "Payment verification completed",
        completed: ["paid", "completed", "reviewed"].includes(order.status.toLowerCase()),
        icon: <CheckCircle className="w-3 h-3" />,
      },
      {
        status: "Order Confirmed",
        date: order.orderDate,
        time: "10:36 AM",
        description: "Order confirmed and sent to seller",
        completed: ["paid", "completed", "reviewed"].includes(order.status.toLowerCase()),
        icon: <Package className="w-3 h-3" />,
      },
    ],
  };

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

  const [isShipped, setIsShipped] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto order-details-scrollbar-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm mt-3">
            <span>{viewType === "seller" ? "Sale Details" : "Order Details"}</span>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(order.status || "unknown")} text-white text-[10px]`}>
                {(order.status || "unknown").replace(/_/g, " ").toUpperCase()}
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
                  src={order.artworkImage || "/placeholder.png"}
                  alt={order.title || "Artwork"}
                  className="w-24 h-24 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-xs text-foreground mb-0.5">{order.title || "Untitled"}</h4>
                  <p className="text-[10px] text-black mb-2">
                    {viewType === "seller" ? `Sold to ${order.buyer || "Unknown"}` : `by ${order.artist || "Unknown"}`}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                    <div>Size: {order.artwork.size || "Unknown"}</div>
                    <div>Medium: {order.artwork.medium || "Unknown"}</div>
                    <div>
                      Style:{" "}
                      {order.artwork.style
                        ? order.artwork.style.charAt(0).toUpperCase() + order.artwork.style.slice(1)
                        : "Unknown"}
                    </div>

                    <div>Edition: {order.artwork.edition || "Unknown"}</div>
                    <div>Year: {order.artwork.yearCreated || "Unknown"}</div>
                    <div>
                      {(order.artwork.edition === "Limited Edition" || order.artwork.edition === "Open Edition") &&
                        order.artwork.quantity && <span className="block">Quantity: {order.artwork.quantity}</span>}
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
              {order.shippingAddress ? (
                <div className="leading-snug">
                  <p className="font-medium text-xs">{order.shippingAddress.name}</p>
                  <p className="text-muted-foreground text-[10px]">{order.shippingAddress.address}</p>
                  <p className="text-muted-foreground text-[10px]">
                    {order.shippingAddress.city}
                    {order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">Shipping address not available.</p>
              )}
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
                  <p className="text-[11px] font-medium">{order.paymentMethod || "Unknown"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {viewType === "seller" ? "Payment received" : "Payment confirmed"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Timeline */}

            {viewType === "buyer" &&
              computedOrder.timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                      item.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {item.icon || <Clock className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p
                        className={`text-xs font-medium ${
                          item.completed ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.status}
                      </p>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">{item.date}</p>
                        {item.time && <p className="text-[10px] text-muted-foreground">{item.time}</p>}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
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
                    <p className="font-medium text-[11px]">{order.saleDate || order.orderDate || "Unknown"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="w-2.5 h-2.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {viewType === "seller" ? "Sale ID" : "Order ID"}
                    </p>
                    <p className="font-medium text-[10px]">{order.id || "Unknown"}</p>
                  </div>
                </div>

                {order.expectedDelivery && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Expected Delivery</p>
                      <p className="font-medium text-[11px]">{order.expectedDelivery}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold">Total</span>
                  <span className="text-sm font-bold text-foreground">
                    ₱
                    {order.price
                      ? order.price >= 1000
                        ? `${(order.price / 1000).toFixed(1)}k`
                        : order.price.toLocaleString()
                      : "0"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                {viewType === "seller" ? (
                  <>
                    <button
                      className="w-full py-2 rounded-lg text-[11px] text-black font-medium border"
                      onClick={onContactBuyer}
                    >
                      Contact Buyer
                    </button>
                    <button
                      className="w-full py-2 rounded-lg text-[11px] text-black font-medium bg-gray-100"
                      onClick={onViewPayment}
                    >
                      View Payment Details
                    </button>
                    {(order.status === "payment_received" || order.status === "in_progress") && (
                      <button
                        className={`w-full py-2 rounded-lg text-[11px] font-medium transition-colors ${
                          isShipped ? "bg-black text-white" : "border text-black"
                        }`}
                        onClick={() => setIsShipped(!isShipped)}
                      >
                        {isShipped ? "Marked as Shipped" : "Mark as Shipped"}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button className="w-full py-2 rounded-lg text-[11px] text-white font-medium bg-black">
                      Contact Seller
                    </button>
                    <button className="w-full py-2 rounded-lg text-[11px] text-black font-medium border">
                      Track Payment
                    </button>
                    {order.status === "Completed" && (
                      <button
                        className="w-full py-2 rounded-lg text-[11px] text-black font-medium bg-gray-100"
                        onClick={() => onLeaveReview?.(order)}
                      >
                        Leave Review
                      </button>
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
