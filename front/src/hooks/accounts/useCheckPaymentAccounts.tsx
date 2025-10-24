import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";

export const useCheckPaymentAccounts = () => {
  const [hasPaymentAccounts, setHasPaymentAccounts] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentAccounts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/accounts/");
        const accounts = response.data || [];
        setHasPaymentAccounts(accounts.length > 0);
      } catch (error) {
        console.error("Failed to check payment accounts:", error);
        setHasPaymentAccounts(false);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentAccounts();
  }, []);

  return { hasPaymentAccounts, loading };
};
