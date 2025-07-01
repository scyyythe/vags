import apiClient from "@/utils/apiClient";

interface ContributionPayload {
  exhibit: string;
  contributor: string;
  artwork: string;
}

export const submitContribution = async (data: ContributionPayload) => {
  try {
    const response = await apiClient.post("/exhibit-contributions/", data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data);
      throw new Error(error.response.data?.detail || "Failed to submit contribution");
    }
    throw error;
  }
};
