import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const setDefaultAddress = async (addressId: string) => {
  const response = await apiClient.post(`/address/${addressId}/set-default/`);
  return response.data;
};

const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAddresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
  });
};

export default useSetDefaultAddress;
