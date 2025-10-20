import React, { useRef } from "react";
import { CreditCard, DollarSign, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { Transaction } from "@/hooks/transaction/useTransactions";
import { CombinedTransactionData } from "@/hooks/transaction/useTransactionByArtwork";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: CombinedTransactionData | Transaction | any;
  artworkData?: {
    title?: string;
    artworkImage?: string;
    buyer?: string;
  };
  isLoading?: boolean;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  payment,
  artworkData,
  isLoading = false,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  // Translation hooks
  const paymentDetailsText = useAutoTranslation("Payment Details", language);
  const noPaymentInfoText = useAutoTranslation("No payment information available.", language);
  const loadingPaymentDetailsText = useAutoTranslation("Loading payment details...", language);
  const artworkPurchasedText = useAutoTranslation("Artwork Purchased", language);
  const paymentSummaryText = useAutoTranslation("Payment Summary", language);
  const transactionIdText = useAutoTranslation("Transaction ID", language);
  const amountPaidText = useAutoTranslation("Amount Paid", language);
  const processingFeeText = useAutoTranslation("Processing Fee", language);
  const netAmountText = useAutoTranslation("Net Amount", language);
  const paymentMethodText = useAutoTranslation("Payment Method", language);
  const buyerInformationText = useAutoTranslation("Buyer Information", language);
  const billingAddressText = useAutoTranslation("Billing Address:", language);
  const downloadReceiptText = useAutoTranslation("Download Receipt", language);
  const unknownBuyerText = useAutoTranslation("Unknown Buyer", language);
  const noEmailProvidedText = useAutoTranslation("No email provided", language);
  const unknownArtworkText = useAutoTranslation("Unknown Artwork", language);
  const philippinesText = useAutoTranslation("Philippines", language);
  const atText = useAutoTranslation("at", language);

  // Helper function to normalize payment data from different sources
  const normalizePaymentData = () => {
    if (!payment) return null;

    // If it's combined transaction and purchase data (from our new hook)
    if ("transaction" in payment && "purchase" in payment) {
      const { transaction, purchase } = payment as CombinedTransactionData;
      const amount = parseFloat(transaction.amount);
      const processingFee = amount * 0.05; // 5% processing fee
      const netAmount = amount - processingFee;

      return {
        id: (transaction as any)._id || transaction.id,
        transactionId: transaction.transaction_id,
        amount: amount,
        currency: transaction.currency || "PHP",
        status: transaction.payment_status,
        paymentMethod: transaction.payment_method,
        paymentDate: transaction.timestamp,
        processingFee: processingFee,
        netAmount: netAmount,
        buyer: {
          name: purchase.shipping_address.name || unknownBuyerText,
          email: noEmailProvidedText, // Email not available in current data structure
        },
        billing: {
          address: purchase.shipping_address.address,
          city: purchase.shipping_address.city,
          postalCode: purchase.shipping_address.postal_code,
          country: purchase.shipping_address.country,
        },
        artwork: {
          title: artworkData?.title || unknownArtworkText,
          image: artworkData?.artworkImage || "",
        },
      };
    }

    // If it's a Transaction object (from API)
    if ("transaction_id" in payment && "extra_data" in payment) {
      const transaction = payment as Transaction;
      const amount = parseFloat(transaction.amount);
      const processingFee = amount * 0.05; // 5% processing fee
      const netAmount = amount - processingFee;

      return {
        id: transaction.id,
        transactionId: transaction.transaction_id,
        amount: amount,
        currency: transaction.currency || "PHP",
        status: transaction.payment_status,
        paymentMethod: transaction.payment_method,
        paymentDate: transaction.timestamp,
        processingFee: processingFee,
        netAmount: netAmount,
        buyer: {
          name:
            transaction.receiver_first_name && transaction.receiver_last_name
              ? `${transaction.receiver_first_name} ${transaction.receiver_last_name}`
              : transaction.receiver_first_name || unknownBuyerText,
          email: transaction.extra_data?.buyer_email || noEmailProvidedText,
        },
        billing: transaction.extra_data?.billing_address
          ? {
              address: transaction.extra_data.billing_address.address || "",
              city: transaction.extra_data.billing_address.city || "",
              postalCode: transaction.extra_data.billing_address.postal_code || "",
              country: transaction.extra_data.billing_address.country || philippinesText,
            }
          : undefined,
        artwork: {
          title: artworkData?.title || transaction.extra_data?.artwork_title || unknownArtworkText,
          image: artworkData?.artworkImage || transaction.extra_data?.artwork_image || "",
        },
      };
    }

    // If it's mock data (existing structure)
    return {
      ...payment,
      artwork: {
        title: artworkData?.title || payment.artwork?.title || unknownArtworkText,
        image: artworkData?.artworkImage || payment.artwork?.image || "",
      },
    };
  };

  const normalizedPayment = normalizePaymentData();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-status-success";
      case "pending":
        return "bg-status-pending";
      case "failed":
        return "bg-status-failed";
      default:
        return "bg-muted";
    }
  };

  // download as picture
  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !normalizedPayment) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Receipt_${normalizedPayment.transactionId}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading receipt:", error);
    }
  };

  if (!normalizedPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{paymentDetailsText}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{noPaymentInfoText}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm">
            <span>{paymentDetailsText}</span>
          </DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="space-y-6 text-[11px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-sm text-gray-600">{loadingPaymentDetailsText}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Artwork Information */}
              {normalizedPayment.artwork && (
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-xs mb-3">{artworkPurchasedText}</h3>
                  <div className="flex items-center gap-3">
                    {normalizedPayment.artwork.image && (
                      <img
                        src={normalizedPayment.artwork.image}
                        alt={normalizedPayment.artwork.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="text-xs font-medium">
                        <TranslatedText text={normalizedPayment.artwork.title} />
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
                  <DollarSign className="w-2.5 h-2.5" />
                  {paymentSummaryText}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{transactionIdText}</span>
                    <span className="text-xs font-mono">{normalizedPayment.transactionId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{amountPaidText}</span>
                    <span className="text-xs font-semibold">
                      ₱
                      {normalizedPayment.amount >= 1000
                        ? `${(normalizedPayment.amount / 1000).toFixed(1)}k`
                        : normalizedPayment.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{processingFeeText}</span>
                    <span className="text-xs">
                      -₱
                      {normalizedPayment.processingFee >= 1000
                        ? `${(normalizedPayment.processingFee / 1000).toFixed(1)}k`
                        : normalizedPayment.processingFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold">{netAmountText}</span>
                      <span className="text-sm font-bold text-green-600">
                        ₱
                        {normalizedPayment.netAmount >= 1000
                          ? `${(normalizedPayment.netAmount / 1000).toFixed(1)}k`
                          : normalizedPayment.netAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method + Buyer Info side-by-side with scroll */}
              <div className="flex flex-col md:flex-row gap-4 max-h-[260px] overflow-x-auto">
                {/* Payment Method */}
                <div className="border border-border rounded-lg p-4 min-w-[300px] overflow-auto">
                  <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
                    <CreditCard className="w-2.5 h-2.5" />
                    {paymentMethodText}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                      <CreditCard className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">
                        <TranslatedText text={normalizedPayment.paymentMethod} />
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(normalizedPayment.paymentDate), `MMM dd, yyyy '${atText}' h:mm a`)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buyer Information */}
                <div className="border border-border rounded-lg p-4 min-w-[300px] overflow-auto">
                  <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
                    <User className="w-2.5 h-2.5" />
                    {buyerInformationText}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium">
                        <TranslatedText text={normalizedPayment.buyer.name} />
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        <TranslatedText text={normalizedPayment.buyer.email} />
                      </p>
                    </div>
                    {normalizedPayment.billing && (
                      <div className="pt-2 border-t">
                        <p className="text-[11px] text-muted-foreground">{billingAddressText}</p>
                        <p className="text-xs">
                          <TranslatedText text={normalizedPayment.billing.address} />
                        </p>
                        <p className="text-xs">
                          <TranslatedText text={normalizedPayment.billing.city} />, <TranslatedText text={normalizedPayment.billing.postalCode} />
                        </p>
                        <p className="text-xs">
                          <TranslatedText text={normalizedPayment.billing.country} />
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!isLoading && (
          <div className="flex justify-end">
            <button
              onClick={handleDownloadReceipt}
              className="px-6 py-2 rounded-lg text-[11px] text-white font-medium bg-black"
            >
              {downloadReceiptText}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsModal;
