import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "@/utils/apiClient";

export function useAddress(addressId?: string) {
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const fetchAddress = async () => {
    if (!addressId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/address/${addressId}/`);
      setAddress(res.data);
    } catch (err) {
      console.error("Error fetching address", err);
      setError("Failed to load address.");
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (formData: any): Promise<string | void> => {
    // Create a clean address string by properly concatenating main address and apartment
    let fullAddress = formData.address.trim();
    if (formData.apartment && formData.apartment.trim()) {
      // Only add apartment if it's not empty and not already part of the address
      const apartment = formData.apartment.trim();
      if (!fullAddress.includes(apartment)) {
        fullAddress = `${fullAddress}, ${apartment}`;
      }
    }

    const payload = {
      name: formData.fullName,
      address: fullAddress,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      phone: formData.phoneNumber,
      postal_code: formData.postalCode,
      is_default: formData.setAsDefault,
    };

    try {
      let savedAddressId;

      if (addressId) {
        // Update existing address
        await axios.patch(`/address/${addressId}/`, payload);
        savedAddressId = addressId;
      } else {
        // Create new address
        const res = await axios.post("/address/", payload);
        savedAddressId = res.data.id;
      }

      // If this address is set as default, we need to unset all other addresses as default
      if (formData.setAsDefault) {
        try {
          // First, get all addresses for the user
          const allAddressesResponse = await axios.get("/address/");
          const allAddresses = allAddressesResponse.data;

          // Unset all other addresses as default (except the current one)
          const addressesToUpdate = allAddresses.filter(
            (addr) => addr.id !== savedAddressId && addr.is_default === true
          );

          // Update each address to set is_default to false
          for (const addr of addressesToUpdate) {
            await axios.patch(`/address/${addr.id}/`, { is_default: false });
          }
        } catch (err) {
          console.warn("Warning: Could not unset other default addresses:", err);
          // Don't throw here as the main address was saved successfully
        }
      }

      // Invalidate all address-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["allAddresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });

      return savedAddressId;
    } catch (err) {
      console.error("Error saving address", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [addressId]);

  return { address, saveAddress, loading, error };
}
