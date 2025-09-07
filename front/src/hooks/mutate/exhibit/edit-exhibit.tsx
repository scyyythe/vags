import apiClient from "@/utils/apiClient";
import { ExhibitPayload } from "./exhibit";

export const updateExhibit = async (id: string, data: ExhibitPayload) => {
  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  if (data.category) formData.append("category", data.category);
  if (data.exhibit_type) formData.append("exhibit_type", data.exhibit_type);
  if (data.start_time) formData.append("start_time", data.start_time);
  if (data.end_time) formData.append("end_time", data.end_time);
  if (data.chosen_env) formData.append("chosen_env", data.chosen_env.toString());
  if (data.owner) formData.append("owner", data.owner);

  data.collaborators?.forEach((id) => formData.append("collaborators", id));
  data.artworks?.forEach((id) => formData.append("artworks", id));
  if (data.banner) formData.append("banner", data.banner);

  formData.append("slot_artwork_map", JSON.stringify(data.slot_artwork_map || {}));
  formData.append("slot_owner_map", JSON.stringify(data.slot_owner_map || {}));

  try {
    const response = await apiClient.put(`/exhibits/${id}/update/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
