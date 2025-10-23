import React from "react";
import { RotateCcw, Calendar, DollarSign, User, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

interface RefundDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  refund: {
    id: string;
    originalAmount: number;
    refundAmount: number;
    currency: string;
    status: string;
    reason: string;
    requestDate: string;
    processedDate?: string;
    refundMethod: string;
    transactionId: string;
    originalTransactionId: string;
    buyer: {
      name: string;
      email: string;
    };
    timeline: Array<{
      status: string;
      date: string;
      description: string;
      completed: boolean;
    }>;
  };
}

const RefundDetailsModal: React.FC<RefundDetailsModalProps> = ({
  isOpen,
  onClose,
  refund,
}) => {
  const { language } = useLanguage();

  // Translation hooks
  const refundDetailsText = useAutoTranslation("Refund Details", language);
  const refundSummaryText = useAutoTranslation("Refund Summary", language);
  const refundIdText = useAutoTranslation("Refund ID", language);
  const originalTransactionText = useAutoTranslation("Original Transaction", language);
  const originalAmountText = useAutoTranslation("Original Amount", language);
  const refundAmountText = useAutoTranslation("Refund Amount", language);
  const refundMethodText = useAutoTranslation("Refund Method", language);
  const refundReasonText = useAutoTranslation("Refund Reason", language);
  const buyerInformationText = useAutoTranslation("Buyer Information", language);
  const refundTimelineText = useAutoTranslation("Refund Timeline", language);
  const importantDatesText = useAutoTranslation("Important Dates", language);
  const requestDateText = useAutoTranslation("Request Date", language);
  const processedDateText = useAutoTranslation("Processed Date", language);
  const downloadReportText = useAutoTranslation("Download Report", language);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "processed":
        return "bg-status-success";
      case "pending":
      case "processing":
        return "bg-status-pending";
      case "failed":
        return "bg-status-failed";
      case "cancelled":
        return "bg-status-cancelled";
      default:
        return "bg-muted";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-sm text-gray-900 dark:text-gray-100">
                <span className="text-sm">{refundDetailsText}</span>
            </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-[11px]">
            {/* Refund Summary */}
            <div className="border border-border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <DollarSign className="w-2.5 h-2.5" />
                {refundSummaryText}
                </h3>
                <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground dark:text-gray-400">{refundIdText}</span>
                    <span className="text-xs font-mono text-gray-900 dark:text-gray-100"><TranslatedText text={refund.id} /></span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground dark:text-gray-400">{originalTransactionText}</span>
                    <span className="text-xs font-mono text-gray-900 dark:text-gray-100"><TranslatedText text={refund.originalTransactionId} /></span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground dark:text-gray-400">{originalAmountText}</span>
                    <span className="text-gray-900 dark:text-gray-100">
                    ₱{refund.originalAmount >= 1000 ? `${(refund.originalAmount / 1000).toFixed(1)}k` : refund.originalAmount.toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground dark:text-gray-400">{refundAmountText}</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    -₱{refund.refundAmount >= 1000 ? `${(refund.refundAmount / 1000).toFixed(1)}k` : refund.refundAmount.toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground dark:text-gray-400">{refundMethodText}</span>
                    <span className="text-xs text-gray-900 dark:text-gray-100"><TranslatedText text={refund.refundMethod} /></span>
                </div>
                </div>
            </div>

            {/* Refund Reason */}
            <div className="border border-border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <AlertCircle className="w-2.5 h-2.5" />
                {refundReasonText}
                </h3>
                <p className="text-[11px] text-muted-foreground dark:text-gray-400">
                  <TranslatedText text={refund.reason} />
                </p>
            </div>

            {/* Buyer Information */}
            <div className="border border-border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="w-2.5 h-2.5" />
                {buyerInformationText}
                </h3>
                <div>
                <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100">
                  <TranslatedText text={refund.buyer.name} />
                </p>
                <p className="text-[10px] text-muted-foreground dark:text-gray-400">
                  <TranslatedText text={refund.buyer.email} />
                </p>
                </div>
            </div>

            {/* Refund Timeline */}
            <div className="border border-border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <RotateCcw className="w-2.5 h-2.5" />
                {refundTimelineText}
                </h3>
                <div className="space-y-3">
                {refund.timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1 ${item.completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              <TranslatedText text={item.status} />
                            </p>
                            <p className="text-[10px] text-muted-foreground dark:text-gray-400">
                              <TranslatedText text={item.description} />
                            </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground dark:text-gray-400">
                          <TranslatedText text={item.date} />
                        </p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Important Dates */}
            <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
                <Calendar className="w-2.5 h-2.5" />
                {importantDatesText}
                </h3>
                <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">{requestDateText}</span>
                    <span>{format(new Date(refund.requestDate), "MMM dd, yyyy")}</span>
                </div>
                {refund.processedDate && (
                    <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">{processedDateText}</span>
                    <span>{format(new Date(refund.processedDate), "MMM dd, yyyy")}</span>
                    </div>
                )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button className="px-6 py-2 rounded-lg text-[11px] text-white font-medium bg-black">
                {downloadReportText}
                </button>
            </div>
            </div>
        </DialogContent>
        </Dialog>

  );
};

export default RefundDetailsModal;