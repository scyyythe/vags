import apiClient from "@/utils/apiClient";

export function useStripeConnect() {
  const connectStripe = async () => {
    try {
      const { data } = await apiClient.get("/stripe/connect/");
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe connect URL missing");
      }
    } catch (err) {
      console.error("Stripe Connect error:", err);
      throw err;
    }
  };

  return { connectStripe };
}
