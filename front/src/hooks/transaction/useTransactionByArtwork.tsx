import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";
import { Transaction } from "./useTransactions";

interface UseTransactionByArtworkOptions {
  artworkId?: string;
  purchaseId?: string;
  enabled?: boolean;
}

interface PurchaseData {
  _id: string;
  buyer: string;
  artwork: string;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    phone: string;
  };
  payment_method: string;
  is_paid: boolean;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CombinedTransactionData {
  transaction: Transaction;
  purchase: PurchaseData;
}

const fetchTransactionByArtwork = async (
  artworkId?: string,
  purchaseId?: string
): Promise<CombinedTransactionData | null> => {
  try {
    if (!artworkId && !purchaseId) {
      return null;
    }

    const userId = localStorage.getItem("user_id");

    let purchase: any = null;
    if (artworkId) {
      try {
        const soldArtworksResponse = await apiClient.get<any[]>(`/my-sold-artworks/`);

        purchase =
          soldArtworksResponse.data.find((sale) => {
            return (
              sale.artwork_id === artworkId ||
              sale.artwork?._id === artworkId ||
              sale.artwork?.id === artworkId ||
              sale.id === artworkId
            );
          }) || null;

        if (!purchase) {
          const purchaseResponse = await apiClient.get<any[]>(`/my-purchases/`);
          purchase =
            purchaseResponse.data.find(
              (p) => p.artwork?._id === artworkId || p.artwork?.id === artworkId || p.artwork_id === artworkId
            ) || null;
        }
      } catch (purchaseError) {
        console.warn("Could not fetch purchase data:", purchaseError);
      }
    }

    const searchPurchaseId = purchase?._id || purchase?.id || purchaseId;

    if (!searchPurchaseId) {
      return null;
    }

    const transactionParams = new URLSearchParams({
      user_id: userId || "",
    });

    const transactionResponse = await apiClient.get<Transaction[]>("/transactions/", {
      params: Object.fromEntries(transactionParams),
    });

    const purchaseTransactions = transactionResponse.data.filter((transaction) => {
      const isPurchase = transaction.transaction_type?.toLowerCase() === "purchase";

      const hasPurchaseId = transaction.extra_data?.purchase_id === searchPurchaseId;

      const hasArtMatch = artworkId && (transaction as any).art === artworkId;

      return isPurchase && (hasPurchaseId || hasArtMatch);
    });

    const transaction = purchaseTransactions.length > 0 ? purchaseTransactions[0] : null;

    if (!transaction) {
      return null;
    }

    if (!purchase) {
      purchase = {
        _id: searchPurchaseId,
        shipping_address: {
          name:
            transaction.receiver_first_name && transaction.receiver_last_name
              ? `${transaction.receiver_first_name} ${transaction.receiver_last_name}`
              : transaction.receiver_first_name || "Unknown Buyer",
          address: "Address not available",
          city: "City not available",
          state: "State not available",
          country: "Philippines",
          postal_code: "0000",
          phone: "Phone not available",
        },
        payment_method: transaction.payment_method,
        total_price: parseFloat(transaction.amount),
      };
    }

    return {
      transaction,
      purchase,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Failed to fetch transaction by artwork:", axiosError.response?.data);
    return null;
  }
};

export const useTransactionByArtwork = ({ artworkId, purchaseId, enabled = true }: UseTransactionByArtworkOptions) => {
  return useQuery<CombinedTransactionData | null, Error>({
    queryKey: ["transaction-by-artwork", artworkId, purchaseId],
    queryFn: () => fetchTransactionByArtwork(artworkId, purchaseId),
    enabled: enabled && (!!artworkId || !!purchaseId),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};

export default useTransactionByArtwork;
export type { CombinedTransactionData, PurchaseData };
