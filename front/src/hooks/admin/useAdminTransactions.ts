import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export type AdminTransaction = {
  id: string;
  timestamp: string;
  type: string;
  amount: number;
  status: string;
  from_user?: { id: string; name: string } | null;
  to_user?: { id: string; name: string } | null;
  artworkId?: string | null;
  artworkTitle?: string | null;
};

type AdminTransactionsResponse = {
  results: AdminTransaction[];
};

const fetchAdminTransactions = async (params?: { last_n_days?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.last_n_days) query.set("last_n_days", String(params.last_n_days));
  if (params?.limit) query.set("limit", String(params.limit));
  const url = `/admin/transactions/${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await apiClient.get(url);
  return res.data as AdminTransactionsResponse;
};

export default function useAdminTransactions(params?: { last_n_days?: number; limit?: number }) {
  return useQuery<AdminTransactionsResponse, Error>({
    queryKey: ["adminTransactions", params?.last_n_days ?? 7, params?.limit ?? 50],
    queryFn: () => fetchAdminTransactions(params),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}


