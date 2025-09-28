import { useRef } from "react";
import apiClient from "@/utils/apiClient";

declare global {
  interface Window {
    paypal: any;
  }
}

type PaypalDetails = Record<string, any>;

export function usePayPalPurchase({
  amount,
  buyerId,
  artworkId,
  defaultPayPalEmail,
  onSuccess,
  onError,
}: {
  amount: number | string;
  buyerId: string;
  artworkId: string;
  defaultPayPalEmail: string;
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

    if (isRendered.current) return;

    if (!defaultPayPalEmail) {
      console.error("❌ Receiver has no PayPal email!");
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
                payee: { email_address: defaultPayPalEmail },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();

            await apiClient.post("/paypal/verify-purchase/", {
              orderID: data.orderID,
              buyer_id: buyerId,
              artwork_id: artworkId,
              amount: parseFloat(amount as string),
            });

            onSuccess(details);
          } catch (err) {
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
