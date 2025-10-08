import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const GCashPayment = () => {
  // Example data — replace with actual data if needed
  const gcashNumber = "09XX XXX XXXX";
  const qrCodeUrl = "/path-to-your-qr-code-image.png"; 

  const gcashLink = "https://www.gcash.com/"; 

  const handlePayNow = () => {
    window.open(gcashLink, "_blank"); // Opens GCash in a new tab/window
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-4 space-y-3 text-center">
        <div className="text-sm font-semibold text-gray-900">
          GCash Payment
        </div>

        <div className="pb-2.5">
          <p className="text-gray-700 text-[11px] mb-2">
            Scan to Pay via QR Code
          </p>
          <div className="flex justify-center mb-2.5">
            <img
              src={qrCodeUrl}
              alt="GCash QR Code"
              className="w-48 h-48 object-cover rounded-md border border-gray-200 text-xs"
            />
          </div>

          <div>
            <p className="text-[13px] font-medium text-black">{gcashNumber}</p>
            <p className="text-gray-700 text-[10px]">
              GCash Mobile Number
            </p>
          </div>

        </div>

        <Button
          onClick={handlePayNow}
          className="w-full h-9 bg-blue-700 hover:bg-blue-600 rounded-full text-[11px]"
        >
          Pay Now
        </Button>
      </CardContent>
    </Card>
  );
};
