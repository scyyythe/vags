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
}

export const useCollaboratorExhibitView = (id: string | undefined) => {
  return useQuery<CollaboratorExhibitViewResponse>({
    queryKey: ["collaborator-exhibit-view", id],
    queryFn: async () => {
      if (!id) throw new Error("No exhibit ID");

      try {
        const response = await apiClient.get(`/exhibits/${id}/collaborator-view/`);
        const data = response.data;

        console.log("📦 Collaborator Exhibit View Response:", data);
        console.log("🧩 slotOwnerMap:", data.slotOwnerMap);
        console.log("🖼️ slotArtworkMap:", data.slotArtworkMap);
        console.log("🙋‍♂️ Collaborators:", data.collaborators);
        console.log("👑 Owner:", data.owner);

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
