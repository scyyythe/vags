import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface ExhibitRequest {
  id: string;
  exhibitTitle: string;
  status: string;
  exhibitId: string;
  isOwner?: boolean;
  type: "pending" | "review" | "ready" | "published";
  collaboratorsSubmitted?: number;
  totalCollaborators?: number;
}

export const usePendingRequests = () => {
  return useQuery<ExhibitRequest[]>({
    queryKey: ["pending-requests"],
    queryFn: async () => {
      const res = await apiClient.get("exhibit/my-pending-requests/");
      console.log("✅ pendingRequests response:", res.data);
      return res.data;
    },
  });
};
