import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Exhibit } from "@/components/types/exhibit";

const fetchExhibits = async (userId: string): Promise<Exhibit[]> => {
  const response = await axios.get(`/api/exhibits?userId=${userId}`);
  return response.data;
};

const useExhibits = (userId: string) => {
  return useQuery({
    queryKey: ["exhibits", userId],
    queryFn: () => fetchExhibits(userId),
    enabled: !!userId,
  });
};

export default useExhibits;
