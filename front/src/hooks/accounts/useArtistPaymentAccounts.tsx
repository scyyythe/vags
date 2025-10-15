import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";

export interface PaymentAccount {
  type: "gcash" | "paypal" | "stripe" | "creditCard";
  accountName?: string;
  accountNumber?: string;
  email?: string;
  account_info?: {
    accountName?: string;
    accountNumber?: string;
    email?: string;
  };
  qr_image_url?: string | null;
  is_default?: boolean;
  verified?: boolean;
  name?: string;
}

/**
 * Fetches an artist's payment accounts by artist ID.
 * @param artistId - The unique ID of the artist.
 */
export const useArtistPaymentAccounts = (artistId: string | undefined) => {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) return;

    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/payment/accounts/artist/${artistId}/`);

        const formatted = (response.data || []).map((acc: any) => ({
          type: acc.type,
          accountName: acc.account_info?.accountName,
          accountNumber: acc.account_info?.accountNumber,
          email: acc.account_info?.email,
          qr_image_url: acc.qr_image_url,
          is_default: acc.is_default,
          name: acc.name,
          account_info: acc.account_info,
        }));

        setAccounts(formatted);
      } catch (err: any) {
        console.error("Failed to fetch artist payment accounts:", err);
        setError(err.response?.data?.detail || "Failed to load artist payment accounts.");
      } finally {
        setLoading(false);
      }
    };

    if (!artistId) return;
    fetchAccounts();
  }, [artistId]);

  return { accounts, loading, error };
};
