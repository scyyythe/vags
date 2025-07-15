// src/hooks/users/address/useAddress.tsx
import { useState, useEffect } from "react";
import axios from "@/utils/apiClient";

export function useAddress(addressId?: string) {
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const payload = {
      name: formData.fullName,
      address: `${formData.address}${formData.apartment ? `, ${formData.apartment}` : ""}`,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      phone: formData.phoneNumber,
      postal_code: formData.postalCode,
      is_default: formData.setAsDefault,
    };

    try {
      if (addressId) {
        await axios.patch(`/address/${addressId}/`, payload);
      } else {
        const res = await axios.post("/address/", payload);
        return res.data.id;
      }
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
