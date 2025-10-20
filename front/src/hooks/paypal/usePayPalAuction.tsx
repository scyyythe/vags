import { useRef } from "react";
import apiClient from "@/utils/apiClient";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
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

            // Invalidate all auction and marketplace queries for real-time updates
            queryClient.invalidateQueries({
              predicate: (query) => {
                const queryKey = query.queryKey;
                return (
                  Array.isArray(queryKey) &&
                  (queryKey.includes("auctions") ||
                    queryKey.includes("biddingArtworks") ||
                    queryKey.includes("followedAuctions") ||
                    queryKey.includes("myAuctionArtworks") ||
                    queryKey.includes("bid-history") ||
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
                    queryKey.includes("my-exhibit-cards"))
                );
              },
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
