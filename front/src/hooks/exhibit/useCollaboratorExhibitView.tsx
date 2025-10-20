import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export interface CollaboratorExhibitViewResponse {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  environment: number;
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
  collaborators: {
    id: string;
    name: string;
    avatar: string;
  }[];
  slotOwnerMap: Record<number, string>;
  slotArtworkMap: Record<number, string>;
  slots: {
    contributor: {
      id: string;
      name: string;
      profile_picture: string;
    };
    artwork: {
      id: string;
      title: string;
      image_url: string | string[];
      artist: string;
      [key: string]: any;
    };
    slot_number: number;
    contributed_at: string;
  }[];
}

export const useCollaboratorExhibitView = (id: string | undefined) => {
  return useQuery<CollaboratorExhibitViewResponse>({
    queryKey: ["collaborator-exhibit-view", id],
    queryFn: async () => {
      if (!id) throw new Error("No exhibit ID");

      try {
        const response = await apiClient.get(`/exhibits/${id}/collaborator-view/`);
        const data = response.data;

        return data;
      } catch (error: any) {
        console.error("Collaborator view fetch error:", error);
        toast.error("Failed to fetch exhibit collaborator view");
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for collaborator view updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
