import { useNavigate, useParams } from "react-router-dom";
import AddAddressForm from "../shipping_address/AddAddressForm";
import { useAddress } from "@/hooks/users/address/useAddress";
import { useQueryClient } from "@tanstack/react-query";
const AddAddressPage = ({ isEditing }: { isEditing: boolean }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { address, saveAddress, error, loading } = useAddress(id);
  const queryClient = useQueryClient();
  const parseInitialData = () => {
    if (!address) return undefined;

    return {
      fullName: address.name || "",
      country: address.country || "Philippines",
      address: address.address || "",
      apartment: address.addressLine2 || "",
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

      navigate("/shipping");
    } catch (err) {
      alert("Failed to save address.");
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
