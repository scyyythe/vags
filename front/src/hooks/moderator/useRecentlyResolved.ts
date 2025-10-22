import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export type RecentlyResolvedItem = {
  id: string;
  content_type: "artwork" | "comment" | "user" | "auction" | "exhibit" | "Unknown";
  content_title: string;
  content_id: string;
  action_taken: string;
  time_ago: string;
  category: string;
  resolved_at: string;
};

export type RecentlyResolvedResponse = {
  recentlyResolved: RecentlyResolvedItem[];
};

const fetchRecentlyResolved = async (): Promise<RecentlyResolvedResponse> => {
  const res = await apiClient.get("/moderator/recently-resolved/");
  return res.data;
};

export default function useRecentlyResolved() {
  return useQuery<RecentlyResolvedResponse, Error>({
    queryKey: ["recentlyResolved"],
    queryFn: fetchRecentlyResolved,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: false,
  });
}
