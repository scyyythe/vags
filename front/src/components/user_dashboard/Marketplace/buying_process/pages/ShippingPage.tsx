import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShippingDetails from "../shipping_address/ShippingDetails";
import useAllAddresses from "@/hooks/users/address/useAllAddresses";
import ShippingSkeleton from "@/components/skeletons/shipping/ShippingSkeleton";
import useSetDefaultAddress from "@/hooks/users/address/useSetDefaultAddress";
import { getLoggedInUserId } from "@/auth/decode";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
const ShippingPage = () => {
  const navigate = useNavigate();
  const { mutate: makeDefaultAddress } = useSetDefaultAddress();
  const userId = getLoggedInUserId();

  // Language and translation
  const { language } = useLanguage();
  const failedToLoadAddressesText = useAutoTranslation("Failed to load addresses.", language);

  const { data: addresses = [], isLoading, isError, error, refetch } = useAllAddresses({ enabled: !!userId });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    makeDefaultAddress(addressId);
  };

  // Update selected address when addresses data changes (including when default changes)
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.is_default || a.isDefault);
      const newSelectedId = defaultAddress?.id || addresses[0].id;

      // Always update if we have a new default address or if no address is currently selected
      if (newSelectedId !== selectedAddressId) {
        setSelectedAddressId(newSelectedId);
      }
    }
  }, [addresses, selectedAddressId]);

  // Refetch addresses when page becomes visible (user returns from AddAddressPage)
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  if (isLoading) return <ShippingSkeleton />;
  if (isError)
    return <p className="text-center mt-10 text-sm text-red-600">{error?.message || failedToLoadAddressesText}</p>;

  return (
    <ShippingDetails
      addresses={addresses}
      selectedAddressId={selectedAddressId}
      onSelectAddress={handleSelectAddress}
      onAddNewAddress={() => navigate("/add-address")}
      onEditAddress={(id) => navigate(`/edit-address/${id}`)}
      onBack={() => navigate("/")}
      onContinue={() => {
        if (selectedAddressId) {
          navigate("/payment-method");
        }
      }}
    />
  );
};

export default ShippingPage;
