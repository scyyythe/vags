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
