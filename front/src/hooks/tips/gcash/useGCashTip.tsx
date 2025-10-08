import apiClient from "@/utils/apiClient";
import { useState } from "react";
import { toast } from "sonner";

interface UseGCashTipProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useGCashTip = ({ onSuccess, onError }: UseGCashTipProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [artistGCash, setArtistGCash] = useState<any>(null);

  /**
   * Step 1: Fetch artist GCash details (to show QR / number)
   */
  const getArtistGCashInfo = async (artistId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/payment/gcash/${artistId}/`);
      setArtistGCash(response.data);
      return response.data;
    } catch (error: any) {
      toast.error("Failed to load artist GCash info.");
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: User submits manual proof after sending payment
   */
  const submitGCashProof = async ({
    amount,
    artistId,
    artId,
    proofImage,
    referenceNumber,
    note,
  }: {
    amount: string;
    artistId: string;
    artId: string;
    proofImage?: string; // base64 or URL
    referenceNumber?: string;
    note?: string;
  }) => {
    try {
      setLoading(true);
      const senderId = localStorage.getItem("user_id");

      const payload = {
        amount,
        artist_id: artistId,
        art_id: artId,
        sender_id: senderId,
        proof_image: proofImage || "",
        reference_number: referenceNumber || "",
        note: note || "",
      };

      const response = await apiClient.post("/payment/gcash/submit/", payload);
      toast.success("Proof submitted successfully! Awaiting verification.");
      if (onSuccess) onSuccess();
      return response.data;
    } catch (error: any) {
      console.error("GCash proof submission failed:", error);
      toast.error("Failed to submit GCash proof.");
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    artistGCash,
    getArtistGCashInfo,
    submitGCashProof,
  };
};
