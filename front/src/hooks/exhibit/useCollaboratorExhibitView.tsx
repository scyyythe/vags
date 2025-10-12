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
    staleTime: 5 * 60 * 1000,
  });
};
