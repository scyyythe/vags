import { useNavigate, useParams } from "react-router-dom";
import AddAddressForm from "../shipping_address/AddAddressForm";
import { useAddress } from "@/hooks/users/address/useAddress";

const AddAddressPage = ({ isEditing }: { isEditing: boolean }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { address, saveAddress, error, loading } = useAddress(id);

  const parseInitialData = () => {
    if (!address) return undefined;
    const addressParts = address.address?.split(", ") || [];
    const cityParts = address.city?.split(", ") || [];
    return {
      fullName: address.name,
      country: cityParts[2] || "Philippines",
      address: addressParts[0] || "",
      apartment: addressParts[1] || "",
      city: cityParts[0] || "",
      state: cityParts[1] || "",
      postalCode: cityParts[3] || "",
      phoneNumber: address.phone,
      setAsDefault: address.is_default || false,
    };
  };

 const handleSave = async (formData: any) => {
  try {
    const newId = await saveAddress(formData);

    if (isEditing) {
      navigate("/shipping");
    } else {
      navigate("/shipping"); 
    }
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
    />
  );
};

export default AddAddressPage;
