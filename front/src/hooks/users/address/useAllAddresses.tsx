
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchAddresses = async () => {
  const response = await apiClient.get("/address/");
  return response.data; 
};

const useAllAddresses = () => {
  return useQuery({
    queryKey: ["allAddresses"],
    queryFn: fetchAddresses,
    staleTime: 1000 * 30, 
  });
};

export default useAllAddresses;
