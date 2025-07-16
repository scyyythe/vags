import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShippingDetails from "../shipping_address/ShippingDetails";
import useAllAddresses from "@/hooks/users/address/useAllAddresses";
import ShippingSkeleton from "@/components/skeletons/ShippingSkeleton";
const ShippingPage = () => {
  const navigate = useNavigate();

  const {
    data: addresses = [],
    isLoading,
    isError,
    error,
  } = useAllAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.is_default || a.isDefault);
      setSelectedAddressId(defaultAddress?.id || addresses[0].id);
    }
  }, [addresses]);

  if (isLoading) return <ShippingSkeleton />;
  if (isError)
    return (
      <p className="text-center mt-10 text-sm text-red-600">
        {error?.message || "Failed to load addresses."}
      </p>
    );

  return (
    <ShippingDetails
      addresses={addresses}
      selectedAddressId={selectedAddressId}
      onSelectAddress={setSelectedAddressId}
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
