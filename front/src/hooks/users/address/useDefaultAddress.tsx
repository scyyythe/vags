import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchDefaultAddress = async () => {
  const response = await apiClient.get("address-default/");
  return response.data;
};

const useDefaultAddress = () => {
  return useQuery({
    queryKey: ["defaultAddress"],
    queryFn: fetchDefaultAddress,
    retry: false,
    staleTime: 1000 * 30,
  });
};

export default useDefaultAddress;
