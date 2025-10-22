import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export type ModeratorOverviewStats = {
  value: number;
  trend: number;
  positive: boolean;
};

export type RecentAlert = {
  id: string;
  type: "high" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  icon: "red" | "amber" | "blue";
};

export type ModeratorOverview = {
  pendingReports: ModeratorOverviewStats;
  resolvedReports7d: ModeratorOverviewStats;
  usersWarned7d: ModeratorOverviewStats;
  removedContent7d: ModeratorOverviewStats;
  recentAlerts: RecentAlert[];
};

const fetchModeratorOverview = async (): Promise<ModeratorOverview> => {
  const res = await apiClient.get("/moderator/overview/");
  return res.data;
};

export default function useModeratorOverview() {
  return useQuery<ModeratorOverview, Error>({
    queryKey: ["moderatorOverview"],
    queryFn: fetchModeratorOverview,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: false,
  });
}
