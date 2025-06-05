import apiClient from "@/utils/apiClient";

export interface ExhibitPayload {
  title: string;
  description: string;
  category: string;
  exhibit_type: string;
  start_time: string;
  end_time: string;
  collaborators: string[];
  chosen_env: string;
  artworks: string[];
  banner: File | null;
  owner: string;
}

export const createExhibit = async (data: ExhibitPayload) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("owner", data.owner);
  formData.append("exhibit_type", data.exhibit_type.charAt(0).toUpperCase() + data.exhibit_type.slice(1));
  formData.append("start_time", data.start_time);
  formData.append("end_time", data.end_time);
  formData.append("chosen_env", data.chosen_env);

  data.collaborators.forEach((id) => formData.append("collaborators", id));
  data.artworks.forEach((id) => formData.append("artworks", id));

  if (data.banner) {
    formData.append("banner", data.banner);
  }

  try {
    const response = await apiClient.post("/exhibits/create/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    // axios error object
    if (error.response) {
      console.error("Backend validation errors:", error.response.data);
    } else {
      console.error("Request error:", error.message);
    }
    // Optionally re-throw or return a specific error object
    throw error;
  }
};
