// hooks/useStripeTip.ts
import { loadStripe } from "@stripe/stripe-js";
import apiClient from "@/utils/apiClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

export function useStripeTip() {
  const createStripeSession = async (amount: string, artistId: string, artId: string) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const senderId = localStorage.getItem("user_id");

      const { data } = await apiClient.post("/stripe/create-session/", {
        amount,
        sender_id: senderId,
        receiver_id: artistId,
        art_id: artId,
      });

      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("Stripe session URL missing");
      }
    } catch (err) {
      console.error("Stripe error:", err);
      throw err;
    }
  };

  const verifyStripePayment = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    if (!sessionId) return null;

    try {
      const { data } = await apiClient.post("/stripe/verify-payment/", {
        session_id: sessionId,
      });
      console.log("✅ Payment verified:", data);
      return data;
    } catch (err) {
      console.error("❌ Verification failed:", err);
      throw err;
    }
  };

  return { createStripeSession, verifyStripePayment };
}
