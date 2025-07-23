import React from "react";
import { RotateCcw, Calendar, DollarSign, User, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-sm">
                <span className="text-sm">Refund Details</span>
            </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-[11px]">
            {/* Refund Summary */}
            <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
                <DollarSign className="w-2.5 h-2.5" />
                Refund Summary
                </h3>
                <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">Refund ID</span>
                    <span className="text-xs font-mono">{refund.id}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">Original Transaction</span>
                    <span className="text-xs font-mono">{refund.originalTransactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">Original Amount</span>
                    <span>
                    ₱{refund.originalAmount >= 1000 ? `${(refund.originalAmount / 1000).toFixed(1)}k` : refund.originalAmount.toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">Refund Amount</span>
                    <span className="text-sm font-bold text-red-600">
                    -₱{refund.refundAmount >= 1000 ? `${(refund.refundAmount / 1000).toFixed(1)}k` : refund.refundAmount.toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">Refund Method</span>
                    <span className="text-xs">{refund.refundMethod}</span>
                </div>
                </div>
            </div>

            {/* Refund Reason */}
            <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
                <AlertCircle className="w-2.5 h-2.5" />
                Refund Reason
                </h3>
                <p className="text-[11px] text-muted-foreground">{refund.reason}</p>
            </div>

            {/* Buyer Information */}
            <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
                <User className="w-2.5 h-2.5" />
                Buyer Information
                </h3>
                <div>
                <p className="text-[11px] font-medium">{refund.buyer.name}</p>
                <p className="text-[10px] text-muted-foreground">{refund.buyer.email}</p>
                </div>
            </div>

            {/* Refund Timeline */}
            <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
                <RotateCcw className="w-2.5 h-2.5" />
                Refund Timeline
                </h3>
                <div className="space-y-3">
                {refund.timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1 ${item.completed ? "bg-green-500" : "bg-gray-300"}`} />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium">{item.status}</p>
                            <p className="text-[10px] text-muted-foreground">{item.description}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{item.date}</p>
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
                Important Dates
                </h3>
                <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">Request Date</span>
                    <span>{format(new Date(refund.requestDate), "MMM dd, yyyy")}</span>
                </div>
                {refund.processedDate && (
                    <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">Processed Date</span>
                    <span>{format(new Date(refund.processedDate), "MMM dd, yyyy")}</span>
                    </div>
                )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button className="px-6 py-2 rounded-lg text-[11px] text-white font-medium bg-black">
                Download Report
                </button>
            </div>
            </div>
        </DialogContent>
        </Dialog>

  );
};

export default RefundDetailsModal;