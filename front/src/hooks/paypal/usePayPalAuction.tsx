import { useRef } from "react";
import apiClient from "@/utils/apiClient";

declare global {
  interface Window {
    paypal: any;
  }
}

type PaypalDetails = Record<string, unknown>;

export function usePayPalAuction({
  amount,
  default_paypal_email,
  artistId,
  artId,
  auctionId,
  onSuccess,
  onError,
}: {
  amount: string;
  default_paypal_email: string;
  artistId: string;
  artId: string;
  auctionId: string;
  onSuccess: (details: PaypalDetails) => void;
  onError?: (error: unknown) => void;
}) {
  const paypalRef = useRef<HTMLDivElement | null>(null);
  const isRendered = useRef(false);

  const startPayment = () => {
    if (!window.paypal || !paypalRef.current) {
      console.error("❌ PayPal SDK not loaded or container missing");
      return;
    }

    if (isRendered.current) return; // already rendered

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount) {
      console.error("❌ Invalid amount:", amount);
      return;
    }
    if (!default_paypal_email) {
      console.error("❌ Receiver has no default PayPal email!");
      return;
    }

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: amount, currency_code: "PHP" },
                payee: { email_address: default_paypal_email },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            await apiClient.post("paypal/verify-auction/", {
              orderID: data.orderID,
              amount: parsedAmount,
              sender_id: localStorage.getItem("user_id"),
              receiver_email: default_paypal_email,
              receiver_id: artistId,
              art_id: artId,
              auction_id: auctionId,
            });
            onSuccess(details);
          } catch (err: any) {
            if (onError) onError(err);
          }
        },
        onError: (err: any) => {
          if (onError) onError(err);
        },
      })
      .render(paypalRef.current);

    isRendered.current = true;
  };

  return { paypalRef, startPayment };
}
