import { useNavigate, useParams } from "react-router-dom";
import AddAddressForm from "../shipping_address/AddAddressForm";
import { useAddress } from "@/hooks/users/address/useAddress";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
const AddAddressPage = ({ isEditing }: { isEditing: boolean }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { address, saveAddress, error, loading } = useAddress(id);
  const queryClient = useQueryClient();

  // Language and translation
  const { language } = useLanguage();
  const addressUpdatedText = useAutoTranslation("Address updated successfully!", language);
  const addressAddedText = useAutoTranslation("Address added successfully!", language);
  const addressSetAsDefaultText = useAutoTranslation("Address set as default successfully!", language);
  const failedToSaveAddressText = useAutoTranslation("Failed to save address.", language);

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

      // Show appropriate success message
      if (formData.setAsDefault) {
        toast.success(addressSetAsDefaultText);
      } else {
        toast.success(isEditing ? addressUpdatedText : addressAddedText);
      }

      navigate("/shipping");
    } catch (err) {
      toast.error(failedToSaveAddressText);
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
