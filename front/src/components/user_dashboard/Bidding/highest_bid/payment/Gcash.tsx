import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, X } from "lucide-react";
import { useArtistPaymentAccounts } from "@/hooks/accounts/useArtistPaymentAccounts";
import { usePayment } from "@/context/PaymentContext";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

interface GCashPaymentProps {
  artistId: string;
  onClosePreviousModal: () => void;
}

export const GCashPayment: React.FC<GCashPaymentProps> = ({ artistId, onClosePreviousModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const { confirmPurchase } = usePayment();
  const { accounts, loading, error } = useArtistPaymentAccounts(artistId);
  const { language } = useLanguage();

  // Translation hooks
  const loadingGCashInfoText = useAutoTranslation("Loading GCash info...", language);
  const noGCashAccountText = useAutoTranslation("No GCash account linked for this artist.", language);
  const gcashPaymentText = useAutoTranslation("GCash Payment", language);
  const scanToPayText = useAutoTranslation("Scan to Pay via QR Code", language);
  const paidText = useAutoTranslation("Paid", language);
  const unknownText = useAutoTranslation("Unknown", language);

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

  if (loading) return <p className="text-center text-xs text-gray-500">{loadingGCashInfoText}</p>;

  if (error) return <p className="text-center text-xs text-red-500">{error}</p>;

  if (!gcashAccount)
    return (
      <Card className="border-none shadow-none">
        <CardContent className="p-4 text-center text-gray-500 text-sm">
          {noGCashAccountText}
        </CardContent>
      </Card>
    );

  const accountInfo = gcashAccount.account_info;
  const accountNumber = typeof accountInfo === "string" ? accountInfo : accountInfo?.accountNumber || "N/A";

  const accountName = gcashAccount.name || unknownText;

  const qrCodeUrl = gcashAccount.qr_image_url || "/placeholder-qr.png";

  return (
    <>
      <Card className="border-none shadow-none">
        <CardContent className="p-4 space-y-3 text-center">
          <div className="text-sm font-semibold text-gray-900">{gcashPaymentText}</div>

          <div className="pb-2.5">
            <p className="text-gray-700 text-[11px] mb-2">{scanToPayText}</p>

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
              <p className="text-gray-700 text-[10px]">
                {gcashAccount.name ? <TranslatedText text={gcashAccount.name} /> : unknownText}
              </p>
            </div>
          </div>

          <Button
            className="w-full h-9 bg-blue-700 hover:bg-blue-600 rounded-full text-[11px]"
            onClick={handlePaidClick}
          >
            {paidText}
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
