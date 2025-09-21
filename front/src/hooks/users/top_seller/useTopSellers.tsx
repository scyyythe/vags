import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

interface TopSeller {
  id: string;
  name: string;
  profile_picture: string;
  rating: number;
  sold_count: number;
  art_count: number;
}

const fetchTopSellers = async (): Promise<TopSeller[]> => {
  const { data } = await apiClient.get("/top-sellers/");
  return data;
};

const useTopSellers = () => {
  return useQuery<TopSeller[]>({
    queryKey: ["top-sellers"],
    queryFn: fetchTopSellers,
  });
};

export default useTopSellers;
