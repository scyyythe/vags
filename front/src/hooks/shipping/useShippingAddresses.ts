import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { useToast } from "@/hooks/use-toast";
import {
  ShippingAddress,
  NewShippingAddressState,
} from "@/components/user_dashboard/Settings/components/tab/accounts_setup/types/shipping";

const API_BASE = "/address/";

const transformAddress = (addr: any): ShippingAddress => {
  const rawCreated = addr.created_at || addr.createdAt;
  const createdAt = rawCreated ? new Date(rawCreated).toLocaleDateString("en-PH") : "N/A";

  return {
    id: addr.id || addr._id?.$oid || addr._id,
    name: addr.name,
    addressLine1: addr.address,
    addressLine2: addr.addressLine2 || "",
    city: addr.city,
    state: addr.state,
    zipCode: addr.postal_code || addr.zipCode,
    country: addr.country,
    phone: addr.phone,
    isDefault: !!addr.is_default,
    createdAt,
  };
};

export const useShippingAddresses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery<ShippingAddress[]>({
    queryKey: ["shippingAddresses"],
    queryFn: async () => {
      const res = await apiClient.get(API_BASE);

      return res.data.map(transformAddress);
    },
  });

  const addOrUpdateMutation = useMutation({
    mutationFn: async ({ newAddress, editing }: { newAddress: NewShippingAddressState; editing?: ShippingAddress }) => {
      if (
        !newAddress.name ||
        !newAddress.addressLine1 ||
        !newAddress.city ||
        !newAddress.country ||
        !newAddress.phone
      ) {
        throw new Error("Please fill in all required fields");
      }

      const payload = {
        name: newAddress.name,
        address: newAddress.addressLine1,
        addressLine2: newAddress.addressLine2 || "",
        city: newAddress.city,
        state: newAddress.state,
        postal_code: newAddress.zipCode,
        country: newAddress.country,
        phone: newAddress.phone,
        is_default: newAddress.isDefault,
        ...(editing ? { id: editing.id } : {}),
      };

      if (editing) {
        await apiClient.patch(`${API_BASE}${editing.id}/`, payload);
      } else {
        await apiClient.post(API_BASE, payload);
      }
    },
    onSuccess: (_, { editing }) => {
      queryClient.invalidateQueries({ queryKey: ["shippingAddresses"] });
      toast({
        title: editing ? "Updated" : "Added",
        description: editing ? "Address updated successfully" : "Address added successfully",
        variant: "default",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to save address",
        variant: "destructive",
      });
    },
  });

  // ✅ Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_BASE}${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingAddresses"] });
      toast({ title: "Deleted", description: "Address removed", variant: "default" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    },
  });

  // ✅ Set default
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const address = addresses.find((addr) => addr.id === id);
      if (!address) return;

      const newAddressState: NewShippingAddressState = {
        name: address.name,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
        isDefault: true,
      };

      await addOrUpdateMutation.mutateAsync({ newAddress: newAddressState, editing: address });
    },
  });

  return {
    addresses,
    isLoading,
    addOrUpdateAddress: addOrUpdateMutation.mutate,
    deleteAddress: deleteMutation.mutate,
    setDefaultAddress: setDefaultMutation.mutate,
  };
};
