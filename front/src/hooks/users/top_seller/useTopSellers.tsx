
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

interface TopSeller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  art_count: number;
}

const fetchTopSellers = async (): Promise<TopSeller[]> => {
  const response = await apiClient.get("/top-sellers/");
  return response.data;
};

const useTopSellers = () => {
  return useQuery<TopSeller[]>({
    queryKey: ["top-sellers"],
    queryFn: fetchTopSellers,
  });
};

export default useTopSellers;
