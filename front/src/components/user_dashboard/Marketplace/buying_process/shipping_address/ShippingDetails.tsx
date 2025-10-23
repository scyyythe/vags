import type React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating address fields
const TranslatedAddressField: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text || "", language);
  return <>{translatedText}</>;
};

interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
}

interface ShippingDetailsProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  onAddNewAddress: () => void;
  onEditAddress: (addressId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const ShippingDetails: React.FC<ShippingDetailsProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
  onBack,
  onContinue,
}) => {
  const navigate = useNavigate();

  // Language and translation
  const { language } = useLanguage();
  const shippingDetailsText = useAutoTranslation("Shipping Details", language);
  const deliveryAddressText = useAutoTranslation("Delivery Address", language);
  const editText = useAutoTranslation("Edit", language);
  const addNewAddressText = useAutoTranslation("Add a new address", language);
  const saveAndContinueText = useAutoTranslation("Save and Continue", language);

  const handleContinue = () => {
    if (selectedAddressId) {
      const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
      navigate("/payment-method", { state: { selectedAddress } });
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-white dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        <div className="mb-2">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold dark:text-gray-100">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            {shippingDetailsText}
          </button>
        </div>

        <div className="px-6 py-4 mx-auto">
          <h2 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-6">{deliveryAddressText}</h2>

          {/* Address List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg py-4 px-8 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                onClick={() => onSelectAddress(address.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <input
                        type="radio"
                        checked={selectedAddressId === address.id}
                        onChange={() => onSelectAddress(address.id)}
                        className="w-3 h-3 accent-red-800 dark:accent-red-400"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-[13px] mt-1.5">
                        <TranslatedAddressField text={address.name} />
                      </h3>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-1">
                        <TranslatedAddressField text={address.address} />
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-1">
                        <TranslatedAddressField text={address.city} />
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400">{address.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAddress(address.id);
                    }}
                    className="text-blue-700 dark:text-blue-400 text-xs font-semibold hover:text-blue-800 dark:hover:text-blue-300 underline mt-1.5"
                  >
                    {editText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Address */}
          <button
            onClick={onAddNewAddress}
            className="text-gray-900 dark:text-gray-100 text-xs font-medium underline hover:text-gray-700 dark:hover:text-gray-300 mb-8"
          >
            {addNewAddressText}
          </button>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedAddressId}
              className="bg-red-800 dark:bg-red-700 text-white text-[11px] px-10 py-2.5 rounded-full font-medium hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {saveAndContinueText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingDetails;
