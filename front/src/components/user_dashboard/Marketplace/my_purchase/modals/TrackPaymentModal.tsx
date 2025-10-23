import React from "react";
import { X, CreditCard, Clock, CheckCircle, AlertCircle, Package, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

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

const TrackPaymentModal: React.FC<TrackPaymentModalProps> = ({ isOpen, onClose, order }) => {
  const { language } = useLanguage();

  // Translation hooks
  const paymentTrackingText = useAutoTranslation("Payment Tracking", language);
  const byText = useAutoTranslation("by", language);
  const transactionDetailsText = useAutoTranslation("Transaction Details", language);
  const transactionIdText = useAutoTranslation("Transaction ID:", language);
  const paymentMethodText = useAutoTranslation("Payment Method:", language);
  const orderDateText = useAutoTranslation("Order Date:", language);
  const paymentBreakdownText = useAutoTranslation("Payment Breakdown", language);
  const artworkPriceText = useAutoTranslation("Artwork Price:", language);
  const processingFeeText = useAutoTranslation("Processing Fee:", language);
  const totalPaidText = useAutoTranslation("Total Paid:", language);
  const paymentTimelineText = useAutoTranslation("Payment Timeline", language);
  const paymentInitiatedText = useAutoTranslation("Payment Initiated", language);
  const paymentInitiatedDescText = useAutoTranslation("Payment request sent to payment gateway", language);
  const paymentProcessingText = useAutoTranslation("Payment Processing", language);
  const paymentProcessingDescText = useAutoTranslation("Payment being processed by bank", language);
  const paymentVerifiedText = useAutoTranslation("Payment Verified", language);
  const paymentVerifiedDescText = useAutoTranslation("Payment verification completed", language);
  const orderConfirmedText = useAutoTranslation("Order Confirmed", language);
  const orderConfirmedDescText = useAutoTranslation("Order confirmed and sent to seller", language);
  const paymentSuccessfulText = useAutoTranslation("Payment Successful", language);
  const paymentFailedText = useAutoTranslation("Payment Failed", language);
  const paymentProcessingStatusText = useAutoTranslation("Payment Processing", language);
  const paymentSuccessDescText = useAutoTranslation("Your payment has been processed successfully. The seller has been notified.", language);
  const paymentFailedDescText = useAutoTranslation("Your payment could not be processed. Please try again or contact support.", language);
  const paymentProcessingStatusDescText = useAutoTranslation("Your payment is being processed. This usually takes 1-3 minutes.", language);
  const retryPaymentText = useAutoTranslation("Retry Payment", language);

  // Status translations
  const pendingPaymentText = useAutoTranslation("PENDING PAYMENT", language);
  const processingText = useAutoTranslation("PROCESSING", language);
  const paidText = useAutoTranslation("PAID", language);
  const completedText = useAutoTranslation("COMPLETED", language);
  const failedText = useAutoTranslation("FAILED", language);

  // Helper function to get translated status text
  const getTranslatedStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_payment":
        return pendingPaymentText;
      case "processing":
        return processingText;
      case "paid":
        return paidText;
      case "completed":
        return completedText;
      case "failed":
        return failedText;
      default:
        return status.replace(/_/g, " ").toUpperCase();
    }
  };

  const paymentDetails = {
    transactionId: `TXN-${order.id.slice(-8).toUpperCase()}`,
    paymentMethod: order.paymentMethod,
    amount: order.price,
    processingFee: order.price * 0.05,
    netAmount: order.price * 0.95,
    status: order.status,
    timeline: [
      {
        status: paymentInitiatedText,
        date: order.orderDate,
        time: "10:30 AM",
        description: paymentInitiatedDescText,
        completed: true,
        icon: <CreditCard className="w-3 h-3" />,
      },
      {
        status: paymentProcessingText,
        date: order.orderDate,
        time: "10:31 AM",
        description: paymentProcessingDescText,
        completed: order.status !== "pending_payment",
        icon: <Clock className="w-3 h-3" />,
      },
      {
        status: paymentVerifiedText,
        date: order.orderDate,
        time: "10:35 AM",
        description: paymentVerifiedDescText,
        completed: ["paid", "completed", "reviewed"].includes(order.status.toLowerCase()),
        icon: <CheckCircle className="w-3 h-3" />,
      },
      {
        status: orderConfirmedText,
        date: order.orderDate,
        time: "10:36 AM",
        description: orderConfirmedDescText,
        completed: ["paid", "completed", "reviewed"].includes(order.status.toLowerCase()),
        icon: <Package className="w-3 h-3" />,
      },
    ],
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
      case "stripe":
        return "💳";
      default:
        return "💳";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide bg-white dark:bg-gray-800" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm mt-3 text-gray-900 dark:text-gray-100">
            <span>{paymentTrackingText}</span>
            <Badge className={`${getStatusColor(order.status)} text-white text-[10px]`}>
              {getTranslatedStatus(order.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-[11px]">
          {/* Artwork Info */}
          <div className="flex gap-4 p-4 border border-border rounded-lg">
            <img src={order.artworkImage} alt={order.title} className="w-16 h-16 rounded-md object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                <TranslatedText text={order.title} />
              </h3>
              <p className="text-xs text-muted-foreground">
                {byText} <TranslatedText text={order.artist} />
              </p>
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
                  {transactionDetailsText}
                </h3>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{transactionIdText}</span>
                    <span className="font-mono">{paymentDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{paymentMethodText}</span>
                    <span className="flex items-center gap-1">
                      {getPaymentMethodIcon(paymentDetails.paymentMethod)}
                      <TranslatedText text={paymentDetails.paymentMethod} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{orderDateText}</span>
                    <span><TranslatedText text={order.orderDate} /></span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">{paymentBreakdownText}</h3>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{artworkPriceText}</span>
                    <span>₱{paymentDetails.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{processingFeeText}</span>
                    <span>₱{paymentDetails.processingFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>{totalPaidText}</span>
                    <span>₱{(paymentDetails.amount + paymentDetails.processingFee).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Timeline */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-[13px] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {paymentTimelineText}
              </h3>
              <div className="space-y-3">
                {paymentDetails.timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                        item.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {item.icon}
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
          <div
            className={`p-4 rounded-lg border-l-4 ${
              order.status.toLowerCase() === "paid" || order.status.toLowerCase() === "completed"
                ? "bg-green-50 border-green-500"
                : order.status.toLowerCase() === "failed"
                ? "bg-red-50 border-red-500"
                : "bg-yellow-50 border-yellow-500"
            }`}
          >
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
                    ? paymentSuccessfulText
                    : order.status.toLowerCase() === "failed"
                    ? paymentFailedText
                    : paymentProcessingStatusText}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {order.status.toLowerCase() === "paid" || order.status.toLowerCase() === "completed"
                    ? paymentSuccessDescText
                    : order.status.toLowerCase() === "failed"
                    ? paymentFailedDescText
                    : paymentProcessingStatusDescText}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {(order.status.toLowerCase() === "failed" || order.status.toLowerCase() === "pending_payment") && (
            <button className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
              {retryPaymentText}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackPaymentModal;
