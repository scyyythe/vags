import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, X } from "lucide-react";
import { useArtistPaymentAccounts } from "@/hooks/accounts/useArtistPaymentAccounts";
import { usePayment } from "@/context/PaymentContext";
import { toast } from "sonner";
interface GCashPaymentProps {
  artistId: string;
  onClosePreviousModal: () => void;
}

export const GCashPayment: React.FC<GCashPaymentProps> = ({ artistId, onClosePreviousModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const { confirmPurchase } = usePayment();
  const { accounts, loading, error } = useArtistPaymentAccounts(artistId);

  const gcashAccount = accounts.find((acc) => acc?.type?.toLowerCase() === "gcash");

  const handlePaidClick = async () => {
    try {
      onClosePreviousModal();
      await confirmPurchase("gcash");

      setShowReceiptPopup(true);
      setTimeout(() => setShowReceiptPopup(false), 8000);
    } catch (error) {
      console.error("GCash payment failed:", error);
    }
  };

  if (loading) return <p className="text-center text-xs text-gray-500">Loading GCash info...</p>;

  if (error) return <p className="text-center text-xs text-red-500">{error}</p>;

  if (!gcashAccount)
    return (
      <Card className="border-none shadow-none">
        <CardContent className="p-4 text-center text-gray-500 text-sm">
          No GCash account linked for this artist.
        </CardContent>
      </Card>
    );

  const accountInfo = gcashAccount.account_info;
  const accountNumber = typeof accountInfo === "string" ? accountInfo : accountInfo?.accountNumber || "N/A";

  const accountName = gcashAccount.name || "Unknown";

  const qrCodeUrl = gcashAccount.qr_image_url || "/placeholder-qr.png";

  return (
    <>
      <Card className="border-none shadow-none">
        <CardContent className="p-4 space-y-3 text-center">
          <div className="text-sm font-semibold text-gray-900">GCash Payment</div>

          <div className="pb-2.5">
            <p className="text-gray-700 text-[11px] mb-2">Scan to Pay via QR Code</p>

            <div className="flex justify-center mb-2.5">
              <div className="relative inline-block group">
                <img
                  src={qrCodeUrl}
                  alt="GCash QR Code"
                  className="w-48 h-48 object-cover rounded-md border border-gray-200 text-xs"
                />
                <button
                  onClick={() => setIsExpanded(true)}
                  aria-label="Expand QR"
                  className={
                    "absolute bottom-2 right-2 rounded-full p-2 bg-black shadow-xl text-white " +
                    "opacity-0 scale-95 pointer-events-none transition-all duration-200 " +
                    "group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
                  }
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-black">{accountNumber}</p>
              <p className="text-gray-700 text-[10px]">{accountName}</p>
            </div>
          </div>

          <Button
            className="w-full h-9 bg-blue-700 hover:bg-blue-600 rounded-full text-[11px]"
            onClick={handlePaidClick}
          >
            Paid
          </Button>
        </CardContent>
      </Card>

      {/* Expanded QR */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-6 z-[60] bg-white rounded-full p-1.5 shadow-md transition-colors duration-200"
            aria-label="Close expanded QR"
          >
            <X className="w-4 h-4 text-gray-900" />
          </button>
          <img src={qrCodeUrl} alt="Expanded QR Code" className="max-h-[80vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </>
  );
};
