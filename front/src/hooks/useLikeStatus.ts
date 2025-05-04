import { useQuery } from "react-query";
import apiClient from "@/utils/apiClient";

const fetchLikeStatus = async (id: string) => {
  const response = await apiClient.get(`/likes/${id}/status/`);
  return response.data;
};

const useLikeStatus = (id: string) => {
  return useQuery(["likeStatus", id], () => fetchLikeStatus(id), {
    onError: (error) => {
      console.error("Failed to fetch like status:", error);
    },
  });
};

export default useLikeStatus;
