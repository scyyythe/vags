import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export type FlaggedContentItem = {
  id: string;
  type: "artwork" | "comment" | "user" | "auction" | "exhibit" | "unknown";
  title: string;
  description: string;
  flagged_reason: string;
  reported_by: string;
  date_flagged: string;
  status: string;
  report_description: string;
  content_id: string;
  content_data: {
    title?: string;
    artist?: string;
    category?: string;
    description?: string;
    image_url?: string;
    text?: string;
    author?: string;
    created_at?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    artwork_title?: string;
    start_bid?: number;
    status?: string;
  };
};

export type FlaggedContentResponse = {
  flaggedContent: FlaggedContentItem[];
};

const fetchFlaggedContent = async (): Promise<FlaggedContentResponse> => {
  const res = await apiClient.get("/moderator/flagged-content/");
  return res.data;
};

export default function useFlaggedContent() {
  return useQuery<FlaggedContentResponse, Error>({
    queryKey: ["flaggedContent"],
    queryFn: fetchFlaggedContent,
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
