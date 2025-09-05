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
  slot_artwork_map: Record<number, string>;
  slot_owner_map: Record<number, string>;
}

export const createExhibit = async (data: ExhibitPayload) => {
  if (!data.banner) {
    console.error("❌ Banner is required (still null at this point).");
    throw new Error("Banner is required");
  }

  const formData = new FormData();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedStart = new Date(data.start_time);

  if (selectedStart < today) {
    throw new Error("Start time cannot be in the past.");
  }
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("owner", data.owner);

  const formattedType = data.exhibit_type.toLowerCase() === "solo" ? "Solo" : "Collaborative";
  formData.append("exhibit_type", formattedType);

  formData.append("start_time", data.start_time);
  formData.append("end_time", data.end_time);
  formData.append("chosen_env", data.chosen_env);
  formData.append("slot_artwork_map", JSON.stringify(data.slot_artwork_map));
  formData.append("slot_owner_map", JSON.stringify(data.slot_owner_map));

  data.collaborators.forEach((id) => formData.append("collaborators", id));
  data.artworks.forEach((id) => formData.append("artworks", id));
  formData.append("banner", data.banner);

  for (const [key, value] of formData.entries()) {
    console.log(`   ${key}:`, value);
  }

  try {
    const response = await apiClient.post("/exhibits/create/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("🎉 Exhibit created successfully!", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      console.error("⚠️ Backend validation errors:", error.response.data);
    } else {
      console.error("❌ Request error:", error.message);
    }
    throw error;
  }
};
