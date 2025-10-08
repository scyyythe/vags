import React, { useState } from "react"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, X } from "lucide-react";

interface GCashPaymentProps {
  onClosePreviousModal: () => void; // function to close the parent modal
}

export const GCashPayment: React.FC<GCashPaymentProps> = ({ onClosePreviousModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);

  const gcashNumber = "09XX XXX XXXX";
  const qrCodeUrl = "/pics/qr.jpg";

  const handlePaidClick = () => {
    // Close the parent modal
    onClosePreviousModal();

    // Show the receipt popup
    setShowReceiptPopup(true);

    // Auto-close after
    setTimeout(() => setShowReceiptPopup(false), 8000);
  };

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
              <p className="text-[13px] font-semibold text-black">{gcashNumber}</p>
              <p className="text-gray-700 text-[10px]">GCash Mobile Number</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-0 z-50 flex justify-center items-center overflow-hidden">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-6 z-[60] bg-white rounded-full p-1.5 shadow-md transition-colors duration-200"
            aria-label="Close expanded QR"
          >
            <X className="w-4 h-4 text-gray-900" />
          </button>

          <div className="relative w-full h-full px-4 py-16 flex justify-center items-center">
            <img
              src={qrCodeUrl}
              alt="Expanded QR Code"
              className="max-h-[80vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};
