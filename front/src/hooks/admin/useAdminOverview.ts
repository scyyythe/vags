import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export type AdminOverview = {
  totalUsers: number;
  activeListings: number;
  salesVolume7d: number;
};

const fetchAdminOverview = async (): Promise<AdminOverview> => {
  const res = await apiClient.get("/admin/overview/");
  return res.data;
};

export default function useAdminOverview() {
  return useQuery<AdminOverview, Error>({
    queryKey: ["adminOverview"],
    queryFn: fetchAdminOverview,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}


