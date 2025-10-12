import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { Exhibit } from "@/components/types/exhibit";

const fetchUserExhibits = async (userId: string): Promise<Exhibit[]> => {
  const response = await apiClient.get(`/exhibits/user/${userId}/`);
  return response.data;
};

const useUserExhibits = (userId: string) => {
  return useQuery({
    queryKey: ["user-exhibits", userId],
    queryFn: () => fetchUserExhibits(userId),
    enabled: !!userId,
  });
};

export default useUserExhibits;
