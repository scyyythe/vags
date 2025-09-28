import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayPalAuction } from "@/hooks/paypal/usePayPalAuction";
import { toast } from "sonner";

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
  const [paypalEmail, setPaypalEmail] = useState("");

  useEffect(() => {
    if (default_paypal_email) {
      setPaypalEmail(default_paypal_email);
    }
  }, [default_paypal_email]);

  const paypalRef = usePayPalAuction({
    amount,
    default_paypal_email,
    artistId,
    artId,
    auctionId,
    onSuccess: (details) => {
      setSuccess(true);
      toast("Payment successful!");
    },
    onError: (err) => {
      console.error(err);
      toast("Payment failed. Please try again.");
    },
  });

  const handlePayClick = () => {
    // Trigger the hidden PayPal button programmatically
    const btn = paypalRef.current?.querySelector<HTMLButtonElement>("button");
    if (btn) {
      btn.click();
    } else {
      toast("PayPal button not ready yet. Please wait a moment.");
    }
  };

  if (success) return <div className="text-center p-4 text-green-600 text-[11px]">Payment successful!</div>;

  return (
    <div className="overflow-hidden">
      <div className="p-4 text-center text-xs text-gray-900 font-semibold border-none -mb-6">PayPal Payment</div>

      <div className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="paypalEmail" className="text-gray-700 text-[11px]">
            PayPal Email
          </Label>
          <Input
            id="paypalEmail"
            type="email"
            required
            value={default_paypal_email || ""}
            readOnly
            className="border-gray-300 rounded-full h-8"
            style={{ fontSize: "10px" }}
          />
        </div>

        <div className="flex items-center justify-center my-4">
          <div className="bg-gray-100 rounded-xl p-4 w-full text-center">
            <p className="text-[10px] text-gray-600">
              You'll be redirected to PayPal to complete your payment securely.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handlePayClick}
          className="w-full h-9 bg-blue-700 hover:bg-blue-600 rounded-full text-[11px]"
        >
          Pay with PayPal
        </Button>
      </div>

      {/* Hidden PayPal button container */}
      <div ref={paypalRef} style={{ minHeight: "40px", opacity: 0, pointerEvents: "none" }} />
    </div>
  );
};
