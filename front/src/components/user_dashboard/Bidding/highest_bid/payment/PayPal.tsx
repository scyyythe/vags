import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePayPalAuction } from "@/hooks/paypal/usePayPalAuction";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

export const PayPalPayment = ({
  artId,
  auctionId,
  artistId,
  amount,
  default_paypal_email,
}: {
  artId: string;
  auctionId: string;
  artistId: string;
  amount: string;
  default_paypal_email: string;
}) => {
  const [success, setSuccess] = useState(false);
  const [paypalContainer, setPaypalContainer] = useState<HTMLDivElement | null>(null);
  const [showPaypalOverlay, setShowPaypalOverlay] = useState(false);
  const [readyToRender, setReadyToRender] = useState(false);
  const { language } = useLanguage();

  // Translation hooks
  const paymentSuccessfulText = useAutoTranslation("Payment successful!", language);
  const paymentFailedText = useAutoTranslation("Payment failed. Please try again.", language);
  const unavailableText = useAutoTranslation("Unavailable", language);
  const ownerNoPaypalText = useAutoTranslation("Owner has not provided a PayPal account.", language);
  const tryDifferentMethodText = useAutoTranslation("Please try a different payment method.", language);
  const paypalPaymentText = useAutoTranslation("PayPal Payment", language);
  const paypalEmailText = useAutoTranslation("PayPal Email", language);
  const redirectNoticeText = useAutoTranslation("You'll be redirected to PayPal checkout outside this modal.", language);
  const payWithPaypalText = useAutoTranslation("Pay with PayPal", language);

  const { paypalRef, startPayment } = usePayPalAuction({
    amount,
    default_paypal_email,
    artistId,
    artId,
    auctionId,
    onSuccess: () => {
      setSuccess(true);
      toast.success(paymentSuccessfulText);
      setShowPaypalOverlay(false);
      if (paypalContainer) paypalContainer.remove();
    },
    onError: () => {
      toast.error(paymentFailedText);
      setShowPaypalOverlay(false);
    },
  });

  // Create PayPal container once
  useEffect(() => {
    const div = document.createElement("div");
    div.id = "paypal-global-container";
    document.body.appendChild(div);
    setPaypalContainer(div);

    return () => {
      div.remove();
    };
  }, []);

  // Start payment AFTER overlay mounts
  useEffect(() => {
    if (showPaypalOverlay && readyToRender) {
      startPayment();
    }
  }, [showPaypalOverlay, readyToRender]);

  const handleOpenPayPal = () => {
    if (!paypalContainer) return;
    setShowPaypalOverlay(true);
    setTimeout(() => setReadyToRender(true), 100);
  };

  const handleClosePayPal = () => {
    setShowPaypalOverlay(false);
    setReadyToRender(false);
  };

  if (success)
    return (
      <div className="text-center p-4 text-green-600 text-[11px]">
        {paymentSuccessfulText}
      </div>
    );

  // If no PayPal email available
  if (!default_paypal_email) {
    return (
      <div className="py-5 px-2 text-center">
        <p className="text-md font-semibold text-red-700 mb-3">{unavailableText}</p>
        <p className="text-xs font-medium text-gray-800">
          {ownerNoPaypalText}
        </p>
        <p className="text-[10px] text-gray-500 mt-2">
          {tryDifferentMethodText}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Original layout */}
      <div className="overflow-hidden relative">
        <div className="p-4 text-center text-xs text-gray-900 font-semibold border-none -mb-6">
          {paypalPaymentText}
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="paypalEmail" className="text-gray-700 text-[11px]">
              {paypalEmailText}
            </Label>
            <div
              id="paypalEmail"
              className="flex h-8 items-center text-gray-800"
              style={{ fontSize: "10px" }}
            >
              <TranslatedText text={default_paypal_email} />
            </div>
          </div>

          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 rounded-xl p-4 w-full text-center">
              <p className="text-[10px] text-gray-600">
                {redirectNoticeText}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleOpenPayPal}
            className="w-full h-9 bg-blue-700 hover:bg-blue-600 rounded-full text-[11px]"
          >
            {payWithPaypalText}
          </Button>
        </div>
      </div>

      {/* PayPal SDK Overlay */}
      {showPaypalOverlay &&
        paypalContainer &&
        createPortal(
          <div 
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
            onClick={handleClosePayPal}
          >
            <div 
              className="relative bg-white rounded-xl p-6 shadow-xl w-full max-w-md"
            >
              {/* Cancel (X) button */}
              <button
                onClick={handleClosePayPal}
                className="absolute top-0.5 right-1 text-black rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>

              {/* PayPal SDK renders here */}
              <div ref={paypalRef}></div>
            </div>
          </div>,
          paypalContainer
        )}
    </>
  );
};
