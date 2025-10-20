import { useEffect, useRef } from "react";
import apiClient from "@/utils/apiClient";
import { useQueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    paypal: any;
  }
}

type PaypalDetails = Record<string, unknown>;
export function usePayPalTip({
  amount,
  default_paypal_email,
  artistId,
  id,
  onSuccess,
  onError,
}: {
  amount: string;
  default_paypal_email: string;
  artistId: string;
  id: string;
  onSuccess: (details: PaypalDetails) => void;
  onError?: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const paypalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const paypalElement = paypalRef.current;
    if (!window.paypal || !paypalElement) return;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || !default_paypal_email) return;

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: amount, currency_code: "PHP" },
                payee: { email_address: default_paypal_email },
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
              receiver_email: default_paypal_email,
              receiver_id: artistId,
              art_id: id,
            };

            await apiClient.post("paypal/verify/", payload);

            // Invalidate all tip and marketplace queries for real-time updates
            queryClient.invalidateQueries({
              predicate: (query) => {
                const queryKey = query.queryKey;
                return (
                  Array.isArray(queryKey) &&
                  (queryKey.includes("tips") ||
                    queryKey.includes("notifications") ||
                    queryKey.includes("marketplace-art-cards") ||
                    queryKey.includes("trending-artworks") ||
                    queryKey.includes("followedArtworks") ||
                    queryKey.includes("artworks") ||
                    queryKey.includes("popularArtworks") ||
                    queryKey.includes("popular-artworks-light") ||
                    queryKey.includes("top-artworks") ||
                    queryKey.includes("top-sellers") ||
                    queryKey.includes("my-purchases") ||
                    queryKey.includes("buyer-activity") ||
                    queryKey.includes("my-sold-artworks") ||
                    queryKey.includes("user-sold-artworks") ||
                    queryKey.includes("purchase-orders") ||
                    queryKey.includes("purchase-order") ||
                    queryKey.includes("exhibits") ||
                    queryKey.includes("exhibit-cards") ||
                    queryKey.includes("my-exhibit-cards") ||
                    queryKey.includes("auctions") ||
                    queryKey.includes("biddingArtworks") ||
                    queryKey.includes("followedAuctions") ||
                    queryKey.includes("myAuctionArtworks"))
                );
              },
            });

            onSuccess(details);
          } catch (err: any) {
            console.error("❌ Error:", err);
            if (onError) onError(err);
          }
          console.log("Created PayPal Order:", data.orderID);
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
  }, [amount, default_paypal_email, artistId, id, onSuccess, onError]);

  return paypalRef;
}
