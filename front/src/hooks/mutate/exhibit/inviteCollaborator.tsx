import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface InvitePayload {
  exhibit: string;
  inviter: string;
  invitee: string;
}

export const inviteCollaborator = async (data: InvitePayload) => {
  try {
    const response = await apiClient.post("/exhibit-invitations/", data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data);
      throw new Error(error.response.data?.detail || "Failed to send invitation");
    }
    throw error;
  }
};
