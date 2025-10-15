import { useNavigate, useParams } from "react-router-dom";
import AddAddressForm from "../shipping_address/AddAddressForm";
import { useAddress } from "@/hooks/users/address/useAddress";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
const AddAddressPage = ({ isEditing }: { isEditing: boolean }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { address, saveAddress, error, loading } = useAddress(id);
  const queryClient = useQueryClient();
  const parseInitialData = () => {
    if (!address) return undefined;

    // Parse the concatenated address to separate main address from apartment
    let mainAddress = address.address || "";
    let apartment = "";

    // Check if address contains apartment info (looks for pattern: "Main Address, Apt/Floor/Suite info")
    if (mainAddress.includes(", ")) {
      const parts = mainAddress.split(", ");
      // Assume the last part after comma is apartment info
      apartment = parts[parts.length - 1];
      mainAddress = parts.slice(0, -1).join(", ");
    }

    return {
      fullName: address.name || "",
      country: address.country || "Philippines",
      address: mainAddress,
      apartment: apartment,
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postal_code || "",
      phoneNumber: address.phone || "",
      setAsDefault: !!address.is_default,
    };
  };

  const handleSave = async (formData: any) => {
    try {
      await saveAddress(formData);

      queryClient.invalidateQueries({ queryKey: ["allAddresses"] });

      toast.success(isEditing ? "Address updated successfully!" : "Address added successfully!");

      navigate("/shipping");
    } catch (err) {
      toast.error("Failed to save address.");
    }
  };

  return (
    <AddAddressForm
      onBack={() => navigate("/shipping")}
      onSave={handleSave}
      initialData={parseInitialData()}
      isEditing={isEditing}
      loading={loading}
      error={error}
      addressId={id}
    />
  );
};

export default AddAddressPage;
