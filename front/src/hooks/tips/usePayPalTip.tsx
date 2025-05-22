import { useEffect, useRef } from "react";
import apiClient from "@/utils/apiClient";
declare global {
  interface Window {
    paypal: any;
  }
}

type PaypalDetails = Record<string, unknown>;
export function usePayPalTip({
  amount,
  artistId,
  id,
  onSuccess,
  onError,
}: {
  amount: string;
  artistId: string;
  id: string;
  onSuccess: (details: PaypalDetails) => void;
  onError?: (error: unknown) => void;
}) {
  const paypalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const paypalElement = paypalRef.current;
    if (!window.paypal || !paypalElement) return;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount,
                  currency_code: "PHP",
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          try {
            const details = await actions.order.capture();

            const payload = {
              orderID: data.orderID,
              amount: parseFloat(amount),
              sender_id: localStorage.getItem("user_id"),
              receiver_id: artistId,
              art_id: id,
            };

            console.log("💰 PayPal Tip Payload:", payload);

            await apiClient.post("paypal/verify/", payload);

            onSuccess(details);
          } catch (err: any) {
            if (err.response) {
              console.error("🔴 PayPal verification failed:");
              console.error("Status:", err.response.status);
              console.error("Data:", err.response.data);
              console.error("Headers:", err.response.headers);
            } else if (err.request) {
              console.error("❗ No response received:", err.request);
            } else {
              console.error("❌ Error:", err.message);
            }

            if (onError) onError(err);
          }
        },
        onError: (err) => {
          console.error("PayPal button error:", err);
          if (onError) onError(err);
        },
      })
      .render(paypalElement);

    return () => {
      paypalElement.innerHTML = "";
    };
  }, [amount, artistId, id, onSuccess, onError]);

  return paypalRef;
}
