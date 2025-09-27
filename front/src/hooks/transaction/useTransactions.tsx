import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";

export interface Transaction {
  id: string;
  transaction_type: string;

  sender_first_name: string | null;
  sender_last_name: string | null;
  sender_profile_picture: string | null;

  receiver_first_name: string | null;
  receiver_last_name: string | null;
  receiver_profile_picture: string | null;

  amount: string;
  currency: string;
  payment_method: string;
  payment_status: string; // now "Success" if Completed
  transaction_id: string;
  extra_data: Record<string, any>;
  timestamp: string;

  activity: string;
}

interface TransactionFilters {
  userId?: string;
  type?: string;
  currency?: string;
  startDate?: string;
  endDate?: string;
}

const fetchTransactions = async (filters?: TransactionFilters): Promise<Transaction[]> => {
  try {
    const response = await apiClient.get<Transaction[]>("/transactions/", {
      params: {
        user_id: filters?.userId,
        type: filters?.type,
        currency: filters?.currency,
        start_date: filters?.startDate,
        end_date: filters?.endDate,
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error((axiosError.response?.data as { detail?: string })?.detail || "Failed to fetch transactions");
  }
};

const useTransactionsQuery = (filters?: TransactionFilters) => {
  return useQuery<Transaction[], Error>({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
    staleTime: 60 * 1000,
  });
};

export default useTransactionsQuery;
