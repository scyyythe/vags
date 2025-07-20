import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchAddresses = async () => {
  const response = await apiClient.get("/address/");
  return response.data;
};

const useAllAddresses = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: ["allAddresses"],
    queryFn: fetchAddresses,
    enabled,
    staleTime: 1000 * 30,
  });
};

export default useAllAddresses;
