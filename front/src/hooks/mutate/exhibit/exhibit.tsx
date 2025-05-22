import apiClient from "@/utils/apiClient";
export interface ExhibitPayload {
  title: string;
  description: string;
  category: string;
  artworkStyle: string;
  exhibitType: string;
  startDate: string;
  endDate: string;
  collaborators: string[];
  environment: string;
  artworks: string[];
  bannerImage: File | null;
}
export const createExhibit = async (data: ExhibitPayload) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("artworkStyle", data.artworkStyle);
  formData.append("exhibitType", data.exhibitType);
  formData.append("startDate", data.startDate);
  formData.append("endDate", data.endDate);
  formData.append("environment", data.environment);

  data.collaborators.forEach((id) => formData.append("collaborators", id));
  data.artworks.forEach((id) => formData.append("artworks", id));

  if (data.bannerImage) {
    formData.append("bannerImage", data.bannerImage);
  }

  const response = await apiClient.post("/exhibits/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
