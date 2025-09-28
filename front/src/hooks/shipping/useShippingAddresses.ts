import { useState } from "react";
import { ShippingAddress, NewShippingAddressState } from "@/components/user_dashboard/Settings/components/tab/accounts_setup/types/shipping";

export const useShippingAddresses = () => {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([
    {
      id: "1",
      name: "John Doe",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
      phone: "+1 (555) 123-4567",
      isDefault: true,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2", 
      name: "Jane Smith",
      addressLine1: "456 Oak Avenue",
      addressLine2: "",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "United States", 
      phone: "+1 (555) 987-6543",
      isDefault: false,
      createdAt: new Date("2024-02-20"),
    },
    {
      id: "3",
      name: "Mike Johnson",
      addressLine1: "789 Pine Road",
      addressLine2: "Suite 200",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "United States",
      phone: "+1 (555) 456-7890",
      isDefault: false,
      createdAt: new Date("2024-03-10"),
    },
  ]);

  const addOrUpdateAddress = async (
    newAddressData: NewShippingAddressState,
    editingAddress?: ShippingAddress | null
  ): Promise<boolean> => {
    try {
      if (editingAddress) {
        // Update existing address
        setAddresses((prev) =>
          prev.map((address) =>
            address.id === editingAddress.id
              ? {
                  ...address,
                  ...newAddressData,
                }
              : newAddressData.isDefault ? { ...address, isDefault: false } : address
          )
        );
      } else {
        // Add new address
        const newAddress: ShippingAddress = {
          id: Date.now().toString(),
          ...newAddressData,
          createdAt: new Date(),
        };

        setAddresses((prev) => {
          if (newAddress.isDefault) {
            return [newAddress, ...prev.map((address) => ({ ...address, isDefault: false }))];
          }
          return [newAddress, ...prev];
        });
      }
      return true;
    } catch (error) {
      console.error("Error adding/updating address:", error);
      return false;
    }
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    try {
      setAddresses((prev) => prev.filter((address) => address.id !== addressId));
      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  };

  const setDefaultAddress = async (addressId: string): Promise<boolean> => {
    try {
      setAddresses((prev) =>
        prev.map((address) => ({
          ...address,
          isDefault: address.id === addressId,
        }))
      );
      return true;
    } catch (error) {
      console.error("Error setting default address:", error);
      return false;
    }
  };

  return {
    addresses,
    addOrUpdateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};