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

      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error("Stripe error:", err);
      throw err;
    }
  };

  return { createStripeSession };
}
