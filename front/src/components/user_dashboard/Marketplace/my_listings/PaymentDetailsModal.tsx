import React from "react";
import { CreditCard, DollarSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

const PaymentDetailsModal = ({ isOpen, onClose, payment }) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm">
            <span>Payment Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-[11px]">
          {/* Payment Summary */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
              <DollarSign className="w-2.5 h-2.5" />
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Transaction ID</span>
                <span className="text-xs font-mono">{payment.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Amount Paid</span>
                <span className="text-xs font-semibold">
                  ₱{payment.amount >= 1000 ? `${(payment.amount / 1000).toFixed(1)}k` : payment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Processing Fee</span>
                <span className="text-xs">
                  -₱{payment.processingFee >= 1000 ? `${(payment.processingFee / 1000).toFixed(1)}k` : payment.processingFee.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">Net Amount</span>
                  <span className="text-sm font-bold text-green-600">
                    ₱{payment.netAmount >= 1000 ? `${(payment.netAmount / 1000).toFixed(1)}k` : payment.netAmount.toLocaleString()}
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
                Payment Method
                </h3>
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <CreditCard className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
                <div>
                    <p className="text-xs font-medium">{payment.paymentMethod}</p>
                    <p className="text-[11px] text-muted-foreground">
                    {format(new Date(payment.paymentDate), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                </div>
                </div>
            </div>

            {/* Buyer Information */}
            <div className="border border-border rounded-lg p-4 min-w-[300px] overflow-auto">
                <h3 className="font-semibold text-xs mb-4 flex items-center gap-2">
                <User className="w-2.5 h-2.5" />
                Buyer Information
                </h3>
                <div className="space-y-2">
                <div>
                    <p className="text-xs font-medium">{payment.buyer.name}</p>
                    <p className="text-[11px] text-muted-foreground">{payment.buyer.email}</p>
                </div>
                {payment.billing && (
                    <div className="pt-2 border-t">
                    <p className="text-[11px] text-muted-foreground">Billing Address:</p>
                    <p className="text-xs">{payment.billing.address}</p>
                    <p className="text-xs">
                        {payment.billing.city}, {payment.billing.postalCode}
                    </p>
                    <p className="text-xs">{payment.billing.country}</p>
                    </div>
                )}
                </div>
            </div>
            </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button className="px-6 py-2 rounded-lg text-[11px] text-white font-medium bg-black">
              Download Receipt
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsModal;
