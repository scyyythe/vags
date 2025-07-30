import React from "react";
import { X, CreditCard, Clock, CheckCircle, AlertCircle, Package, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TrackPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    artworkImage: string;
    title: string;
    artist: string;
    price: number;
    status: string;
    orderDate: string;
    paymentMethod?: string;
  };
}

const TrackPaymentModal: React.FC<TrackPaymentModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const paymentDetails = {
    transactionId: `TXN-${order.id.slice(-8).toUpperCase()}`,
    paymentMethod: order.paymentMethod || "GCash",
    amount: order.price,
    processingFee: order.price * 0.05,
    netAmount: order.price * 0.95,
    status: order.status,
    timeline: [
      {
        status: "Payment Initiated",
        date: order.orderDate,
        time: "10:30 AM",
        description: "Payment request sent to payment gateway",
        completed: true,
        icon: <CreditCard className="w-3 h-3" />
      },
      {
        status: "Payment Processing",
        date: order.orderDate,
        time: "10:31 AM",
        description: "Payment being processed by bank",
        completed: order.status !== "pending_payment",
        icon: <Clock className="w-3 h-3" />
      },
      {
        status: "Payment Verified",
        date: order.orderDate,
        time: "10:35 AM",
        description: "Payment verification completed",
        completed: ["paid", "completed", "reviewed"].includes(order.status.toLowerCase()),
        icon: <CheckCircle className="w-3 h-3" />
      },
      {
        status: "Order Confirmed",
        date: order.orderDate,
        time: "10:36 AM",
        description: "Order confirmed and sent to seller",
        completed: ["paid", "completed", "reviewed"].includes(order.status.toLowerCase()),
        icon: <Package className="w-3 h-3" />
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_payment":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "paid":
      case "completed":
        return "bg-green-600";
      case "failed":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "gcash":
        return "💳";
      case "paymaya":
        return "💳";
      case "credit card":
        return "💳";
      case "bank transfer":
        return "💳";
      default:
        return "💳";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"
      onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm mt-3">
            <span>Payment Tracking</span>
            <Badge className={`${getStatusColor(order.status)} text-white text-[10px]`}>
              {order.status.replace(/_/g, " ").toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-[11px]">
          {/* Artwork Info */}
          <div className="flex gap-4 p-4 border border-border rounded-lg">
            <img 
              src={order.artworkImage} 
              alt={order.title} 
              className="w-16 h-16 rounded-md object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{order.title}</h3>
              <p className="text-xs text-muted-foreground">by {order.artist}</p>
              <p className="text-sm font-bold text-foreground mt-1">
                ₱{order.price >= 1000 ? `${(order.price / 1000).toFixed(1)}k` : order.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-[13px] mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Transaction Details
                </h3>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono">{paymentDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="flex items-center gap-1">
                      {getPaymentMethodIcon(paymentDetails.paymentMethod)}
                      {paymentDetails.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span>{order.orderDate}</span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">Payment Breakdown</h3>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Artwork Price:</span>
                    <span>₱{paymentDetails.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee:</span>
                    <span>₱{paymentDetails.processingFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Paid:</span>
                    <span>₱{(paymentDetails.amount + paymentDetails.processingFee).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Timeline */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-[13px] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Payment Timeline
              </h3>
              <div className="space-y-3">
                {paymentDetails.timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                      item.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-xs font-medium ${item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                          {item.status}
                        </p>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">{item.date}</p>
                          <p className="text-[10px] text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`p-4 rounded-lg border-l-4 ${
            order.status.toLowerCase() === "paid" || order.status.toLowerCase() === "completed"
              ? "bg-green-50 border-green-500"
              : order.status.toLowerCase() === "failed"
              ? "bg-red-50 border-red-500"
              : "bg-yellow-50 border-yellow-500"
          }`}>
            <div className="flex items-center gap-2">
              {order.status.toLowerCase() === "paid" || order.status.toLowerCase() === "completed" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : order.status.toLowerCase() === "failed" ? (
                <AlertCircle className="w-4 h-4 text-red-600" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-600" />
              )}
              <div>
                <p className="text-xs font-medium">
                  {order.status.toLowerCase() === "paid" || order.status.toLowerCase() === "completed"
                    ? "Payment Successful"
                    : order.status.toLowerCase() === "failed"
                    ? "Payment Failed"
                    : "Payment Processing"
                  }
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {order.status.toLowerCase() === "paid" || order.status.toLowerCase() === "completed"
                    ? "Your payment has been processed successfully. The seller has been notified."
                    : order.status.toLowerCase() === "failed"
                    ? "Your payment could not be processed. Please try again or contact support."
                    : "Your payment is being processed. This usually takes 1-3 minutes."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
            {(order.status.toLowerCase() === "failed" || order.status.toLowerCase() === "pending_payment") && (
              <button className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
                Retry Payment
              </button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackPaymentModal;
