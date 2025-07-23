import React from "react";
import { X, CreditCard, Calendar, CheckCircle, DollarSign, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    transactionId: string;
    paymentDate: string;
    processingFee: number;
    netAmount: number;
    buyer: {
      name: string;
      email: string;
    };
    billing?: {
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Details</span>
            <Badge className={`${getStatusColor(payment.status)} text-white`}>
              {payment.status.replace(/_/g, " ").toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <span className="text-sm font-mono">{payment.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-sm font-semibold">
                  ₱{payment.amount >= 1000 ? `${(payment.amount / 1000).toFixed(1)}k` : payment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Processing Fee</span>
                <span className="text-sm">
                  -₱{payment.processingFee >= 1000 ? `${(payment.processingFee / 1000).toFixed(1)}k` : payment.processingFee.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Net Amount</span>
                  <span className="text-lg font-bold text-green-600">
                    ₱{payment.netAmount >= 1000 ? `${(payment.netAmount / 1000).toFixed(1)}k` : payment.netAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Method
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{payment.paymentMethod}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(payment.paymentDate), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Buyer Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">{payment.buyer.name}</p>
                <p className="text-xs text-muted-foreground">{payment.buyer.email}</p>
              </div>
              {payment.billing && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Billing Address:</p>
                  <p className="text-sm">{payment.billing.address}</p>
                  <p className="text-sm">
                    {payment.billing.city}, {payment.billing.postalCode}
                  </p>
                  <p className="text-sm">{payment.billing.country}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1">
              Download Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsModal;