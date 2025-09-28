import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const paypalElement = paypalRef.current;
    if (!window.paypal || !paypalElement) return;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || !default_paypal_email) return;

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

            const payload = {
              orderID: data.orderID,
              amount: parsedAmount,
              sender_id: localStorage.getItem("user_id"),
              receiver_email: default_paypal_email,
              receiver_id: artistId,
              art_id: artId,
              auction_id: auctionId,
            };

            await apiClient.post("paypal/verify-auction//", payload);

            onSuccess(details);
          } catch (err: any) {
            console.error("❌ Auction PayPal Error:", err);
            if (onError) onError(err);
          }
        },
        onError: (err: any) => {
          console.error("PayPal Button Error:", err);
          if (onError) onError(err);
        },
      })
      .render(paypalElement);

    return () => {
      paypalElement.innerHTML = "";
    };
  }, [amount, default_paypal_email, artistId, artId, auctionId, onSuccess, onError]);

  return paypalRef;
}
