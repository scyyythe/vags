import { useState } from "react";
import apiClient from "@/utils/apiClient";
export const useClaimArtwork = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimArtwork = async ({
    artId,
    amount,
    currency = "PHP",
    paymentMethod,
    transactionId,
    receiverId,
    senderId,
  }: {
    artId: string;
    amount: number;
    currency?: string;
    paymentMethod: "gcash" | "stripe" | "credit_card" | "paypal";
    transactionId: string;
    receiverId: string;
    senderId: string;
  }) => {
    setLoading(true);
    setError(null);

    const payload = {
      art_id: artId,
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
      currency,
      payment_method: paymentMethod,
      transaction_id: transactionId,
    };

    try {
      const response = await apiClient.post("/artwork/claim/", payload);
      setLoading(false);

      return response.data;
    } catch (err: any) {
      setLoading(false);
      console.error("Claim Artwork Error:", err.response || err);
      setError(err?.response?.data?.error || err.message || "Something went wrong");
      throw err;
    }
  };

  return { claimArtwork, loading, error };
};
