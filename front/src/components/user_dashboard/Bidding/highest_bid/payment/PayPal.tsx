import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePayPalAuction } from "@/hooks/paypal/usePayPalAuction";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { X } from "lucide-react"; 

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

  const { paypalRef, startPayment } = usePayPalAuction({
    amount,
    default_paypal_email,
    artistId,
    artId,
    auctionId,
    onSuccess: () => {
      setSuccess(true);
      toast.success("Payment successful!");
      setShowPaypalOverlay(false);
      if (paypalContainer) paypalContainer.remove();
    },
    onError: () => {
      toast.error("Payment failed. Please try again.");
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
        Payment successful!
      </div>
    );

  // If no PayPal email available
  if (!default_paypal_email) {
    return (
      <div className="py-5 px-2 text-center">
        <p className="text-md font-semibold text-red-700 mb-3">Unavailable</p>
        <p className="text-xs font-medium text-gray-800">
          Owner has not provided a PayPal account.
        </p>
        <p className="text-[10px] text-gray-500 mt-2">
          Please try a different payment method.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Original layout */}
      <div className="overflow-hidden relative">
        <div className="p-4 text-center text-xs text-gray-900 font-semibold border-none -mb-6">
          PayPal Payment
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="paypalEmail" className="text-gray-700 text-[11px]">
              PayPal Email
            </Label>
            <div
              id="paypalEmail"
              className="flex h-8 items-center text-gray-800"
              style={{ fontSize: "10px" }}
            >
              {default_paypal_email}
            </div>
          </div>

          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 rounded-xl p-4 w-full text-center">
              <p className="text-[10px] text-gray-600">
                You'll be redirected to PayPal checkout outside this modal.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleOpenPayPal}
            className="w-full h-9 bg-blue-700 hover:bg-blue-600 rounded-full text-[11px]"
          >
            Pay with PayPal
          </Button>
        </div>
      </div>

      {/* PayPal SDK Overlay */}
      {showPaypalOverlay &&
        paypalContainer &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="relative bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
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
