import { useEffect, useRef } from "react";

declare global {
  interface Window {
    paypal: any;
  }
}

type PaypalDetails = Record<string, unknown>;

export function usePayPalTip({
  amount,
  onSuccess,
  onError,
}: {
  amount: string;
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
          const details = await actions.order.capture();
          onSuccess(details);
        },
        onError: (err) => {
          if (onError) onError(err);
        },
      })
      .render(paypalElement);

    return () => {
      paypalElement.innerHTML = "";
    };
  }, [amount, onSuccess, onError]);

  return paypalRef;
}
