import { useRef } from "react";
import apiClient from "@/utils/apiClient";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
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

            // Invalidate all purchase and marketplace queries for real-time updates
            queryClient.invalidateQueries({
              predicate: (query) => {
                const queryKey = query.queryKey;
                return (
                  Array.isArray(queryKey) &&
                  (queryKey.includes("marketplace-art-cards") ||
                    queryKey.includes("trending-artworks") ||
                    queryKey.includes("followedArtworks") ||
                    queryKey.includes("my-sell-art-cards") ||
                    queryKey.includes("artworks") ||
                    queryKey.includes("popular-artworks") ||
                    queryKey.includes("popularArtworks") ||
                    queryKey.includes("popular-artworks-light") ||
                    queryKey.includes("top-artworks") ||
                    queryKey.includes("top-sellers") ||
                    queryKey.includes("my-purchases") ||
                    queryKey.includes("my-sold-artworks") ||
                    queryKey.includes("user-sold-artworks") ||
                    queryKey.includes("buyer-activity") ||
                    queryKey.includes("purchase-orders") ||
                    queryKey.includes("purchase-order") ||
                    queryKey.includes("notifications") ||
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
