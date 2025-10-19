import { useRef, useEffect } from "react";

type PaypalDetails = Record<string, any>;

export function usePayPalPurchaseOrder({
  amount,
  defaultPayPalEmail,
  onSuccess,
  onError,
}: {
  amount: number | string;
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
            // Don't call the old verification endpoint - let the parent handle the success
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
