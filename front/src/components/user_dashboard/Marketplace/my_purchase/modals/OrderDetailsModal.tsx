import { useState } from "react";
import { X, Calendar, Package, MapPin, CreditCard, Palette, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

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
  const { language } = useLanguage();

  // Translation hooks
  const saleDetailsText = useAutoTranslation("Sale Details", language);
  const orderDetailsText = useAutoTranslation("Order Details", language);
  const artworkDetailsText = useAutoTranslation("Artwork Details", language);
  const untitledText = useAutoTranslation("Untitled", language);
  const soldToText = useAutoTranslation("Sold to", language);
  const byText = useAutoTranslation("by", language);
  const unknownText = useAutoTranslation("Unknown", language);
  const sizeText = useAutoTranslation("Size:", language);
  const mediumText = useAutoTranslation("Medium:", language);
  const styleText = useAutoTranslation("Style:", language);
  const editionText = useAutoTranslation("Edition:", language);
  const yearText = useAutoTranslation("Year:", language);
  const quantityText = useAutoTranslation("Quantity:", language);
  const buyerAddressText = useAutoTranslation("Buyer Address", language);
  const shippingAddressText = useAutoTranslation("Shipping Address", language);
  const shippingNotAvailableText = useAutoTranslation("Shipping address not available.", language);
  const paymentInformationText = useAutoTranslation("Payment Information", language);
  const paymentReceivedText = useAutoTranslation("Payment received", language);
  const paymentConfirmedText = useAutoTranslation("Payment confirmed", language);
  const paymentInitiatedText = useAutoTranslation("Payment Initiated", language);
  const paymentInitiatedDescText = useAutoTranslation("Payment request sent to payment gateway", language);
  const paymentProcessingText = useAutoTranslation("Payment Processing", language);
  const paymentProcessingDescText = useAutoTranslation("Payment being processed by bank", language);
  const paymentVerifiedText = useAutoTranslation("Payment Verified", language);
  const paymentVerifiedDescText = useAutoTranslation("Payment verification completed", language);
  const orderConfirmedText = useAutoTranslation("Order Confirmed", language);
  const orderConfirmedDescText = useAutoTranslation("Order confirmed and sent to seller", language);
  const saleSummaryText = useAutoTranslation("Sale Summary", language);
  const orderSummaryText = useAutoTranslation("Order Summary", language);
  const saleDateText = useAutoTranslation("Sale Date", language);
  const orderDateText = useAutoTranslation("Order Date", language);
  const saleIdText = useAutoTranslation("Sale ID", language);
  const orderIdText = useAutoTranslation("Order ID", language);
  const expectedDeliveryText = useAutoTranslation("Expected Delivery", language);
  const totalText = useAutoTranslation("Total", language);
  const contactBuyerText = useAutoTranslation("Contact Buyer", language);
  const viewPaymentDetailsText = useAutoTranslation("View Payment Details", language);
  const markAsShippedText = useAutoTranslation("Mark as Shipped", language);
  const markedAsShippedText = useAutoTranslation("Marked as Shipped", language);
  const contactSellerText = useAutoTranslation("Contact Seller", language);
  const trackPaymentText = useAutoTranslation("Track Payment", language);
  const leaveReviewText = useAutoTranslation("Leave Review", language);

  // Status translations
  const pendingPaymentText = useAutoTranslation("PENDING PAYMENT", language);
  const paymentProcessingStatusText = useAutoTranslation("PAYMENT PROCESSING", language);
  const paidText = useAutoTranslation("PAID", language);
  const completedText = useAutoTranslation("COMPLETED", language);
  const failedText = useAutoTranslation("FAILED", language);
  const cancelledText = useAutoTranslation("CANCELLED", language);
  const refundedText = useAutoTranslation("REFUNDED", language);
  const reviewedText = useAutoTranslation("REVIEWED", language);
  const unknownStatusText = useAutoTranslation("UNKNOWN", language);

  // Helper function to get translated status text
  const getTranslatedStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_payment":
        return pendingPaymentText;
      case "payment_processing":
        return paymentProcessingStatusText;
      case "paid":
        return paidText;
      case "completed":
        return completedText;
      case "failed":
        return failedText;
      case "cancelled":
        return cancelledText;
      case "refunded":
        return refundedText;
      case "reviewed":
        return reviewedText;
      default:
        return unknownStatusText;
    }
  };

  const computedOrder = {
    ...order,
    paymentMethod: order.paymentMethod,
    amount: order.price,
    processingFee: +(order.price * 0.05).toFixed(2),
    netAmount: +(order.price * 0.95).toFixed(2),
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
        completed: order.status.toLowerCase() !== "pending_payment",
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
        className="max-w-4xl max-h-[90vh] overflow-y-auto order-details-scrollbar-hidden bg-white dark:bg-gray-800"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm mt-3 text-gray-900 dark:text-gray-100">
            <span>{viewType === "seller" ? saleDetailsText : orderDetailsText}</span>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(order.status || "unknown")} text-white text-[10px]`}>
                {getTranslatedStatus(order.status || "unknown")}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artwork Section */}
            <div className="border border-border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Palette className="w-2.5 h-2.5" />
                {artworkDetailsText}
              </h3>
              <div className="flex gap-4">
                <img
                  src={order.artworkImage || "/placeholder.png"}
                  alt={order.title || "Artwork"}
                  className="w-24 h-24 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-xs text-foreground dark:text-gray-100 mb-0.5">
                    {order.title ? <TranslatedText text={order.title} /> : untitledText}
                  </h4>
                  <p className="text-[10px] text-black dark:text-gray-300 mb-2">
                    {viewType === "seller" ? (
                      <>
                        {soldToText} {order.buyer ? <TranslatedText text={order.buyer} /> : unknownText}
                      </>
                    ) : (
                      <>
                        {byText} {order.artist ? <TranslatedText text={order.artist} /> : unknownText}
                      </>
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                    <div>
                      {sizeText} {order.artwork.size ? <TranslatedText text={order.artwork.size} /> : unknownText}
                    </div>
                    <div>
                      {mediumText} {order.artwork.medium ? <TranslatedText text={order.artwork.medium} /> : unknownText}
                    </div>
                    <div>
                      {styleText}{" "}
                      {order.artwork.style
                        ? <TranslatedText text={order.artwork.style.charAt(0).toUpperCase() + order.artwork.style.slice(1)} />
                        : unknownText}
                    </div>

                    <div>
                      {editionText} {order.artwork.edition ? <TranslatedText text={order.artwork.edition} /> : unknownText}
                    </div>
                    <div>
                      {yearText} {order.artwork.yearCreated || unknownText}
                    </div>
                    <div>
                      {(order.artwork.edition === "Limited Edition" || order.artwork.edition === "Open Edition") &&
                        order.artwork.quantity && <span className="block">{quantityText} {order.artwork.quantity}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <MapPin className="w-2.5 h-2.5" />
                {viewType === "seller" ? buyerAddressText : shippingAddressText}
              </h3>
              {order.shippingAddress ? (
                <div className="leading-snug">
                  <p className="font-medium text-xs">
                    <TranslatedText text={order.shippingAddress.name} />
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    <TranslatedText text={order.shippingAddress.address} />
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    <TranslatedText text={order.shippingAddress.city} />
                    {order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">{shippingNotAvailableText}</p>
              )}
            </div>

            {/* Payment Information */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <CreditCard className="w-2.5 h-2.5" />
                {paymentInformationText}
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <CreditCard className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[11px] font-medium">
                    {order.paymentMethod ? <TranslatedText text={order.paymentMethod} /> : unknownText}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {viewType === "seller" ? paymentReceivedText : paymentConfirmedText}
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
              <h3 className="font-semibold text-sm">{viewType === "seller" ? saleSummaryText : orderSummaryText}</h3>

              <div className="space-y-3 text-[10px]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {viewType === "seller" ? saleDateText : orderDateText}
                    </p>
                    <p className="font-medium text-[11px]">
                      <TranslatedText text={order.saleDate || order.orderDate || unknownText} />
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="w-2.5 h-2.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {viewType === "seller" ? saleIdText : orderIdText}
                    </p>
                    <p className="font-medium text-[10px]">
                      <TranslatedText text={order.id || unknownText} />
                    </p>
                  </div>
                </div>

                {order.expectedDelivery && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{expectedDeliveryText}</p>
                      <p className="font-medium text-[11px]">
                        <TranslatedText text={order.expectedDelivery} />
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold">{totalText}</span>
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
                      {contactBuyerText}
                    </button>
                    <button
                      className="w-full py-2 rounded-lg text-[11px] text-black font-medium bg-gray-100"
                      onClick={onViewPayment}
                    >
                      {viewPaymentDetailsText}
                    </button>
                    {(order.status === "payment_received" || order.status === "in_progress") && (
                      <button
                        className={`w-full py-2 rounded-lg text-[11px] font-medium transition-colors ${
                          isShipped ? "bg-black text-white" : "border text-black"
                        }`}
                        onClick={() => setIsShipped(!isShipped)}
                      >
                        {isShipped ? markedAsShippedText : markAsShippedText}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button className="w-full py-2 rounded-full text-[11px] text-white font-medium bg-black">
                      {contactSellerText}
                    </button>
                    <button className="w-full py-2 rounded-full text-[11px] text-black font-medium border">
                      {trackPaymentText}
                    </button>
                    {order.status === "Completed" && (
                      <button
                        className="w-full py-2 rounded-lg text-[11px] text-black font-medium bg-gray-100"
                        onClick={() => onLeaveReview?.(order)}
                      >
                        {leaveReviewText}
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
