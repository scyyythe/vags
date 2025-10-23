import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Header from "@/components/user_dashboard/navbar/Header";
import countries from "@/components/data/countries";
import { useShippingAddresses } from "@/hooks/shipping/useShippingAddresses";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating country names
const TranslatedCountry: React.FC<{ countryName: string }> = ({ countryName }) => {
  const { language } = useLanguage();
  const translatedCountry = useAutoTranslation(countryName, language);
  return <>{translatedCountry}</>;
};

interface AddressFormData {
  fullName: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  setAsDefault: boolean;
}

interface AddAddressFormProps {
  onBack: () => void;
  onSave: (addressData: AddressFormData) => void;
  onDelete?: (addressId: string) => void;
  initialData?: Partial<AddressFormData>;
  addressId?: string;
  isEditing?: boolean;
  loading?: boolean;
  error?: string | null;
}

const AddAddressForm: React.FC<AddAddressFormProps> = ({
  onBack,
  onSave,
  onDelete,
  initialData,
  addressId,
  isEditing = false,
  loading = false,
  error = null,
}) => {
  const { deleteAddress } = useShippingAddresses();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: initialData?.fullName || "",
    country: initialData?.country || "Philippines",
    address: initialData?.address || "",
    apartment: initialData?.apartment || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postalCode: initialData?.postalCode || "",
    phoneNumber: initialData?.phoneNumber || "",
    setAsDefault: initialData?.setAsDefault || false,
  });

  // Language and translation
  const { language } = useLanguage();
  
  // Translate fetched address data (for editing mode)
  const translatedFullName = useAutoTranslation(initialData?.fullName || "", language);
  const translatedAddress = useAutoTranslation(initialData?.address || "", language);
  const translatedApartment = useAutoTranslation(initialData?.apartment || "", language);
  const translatedCity = useAutoTranslation(initialData?.city || "", language);
  const translatedState = useAutoTranslation(initialData?.state || "", language);
  
  // Page text translations
  const shippingDetailsText = useAutoTranslation("Shipping Details", language);
  const editAddressText = useAutoTranslation("Edit Address", language);
  const addAddressText = useAutoTranslation("Add Address", language);
  const deleteText = useAutoTranslation("Delete", language);
  const failedToDeleteAddressText = useAutoTranslation("Failed to delete address.", language);
  
  // Form labels
  const fullNameText = useAutoTranslation("Full name", language);
  const countryText = useAutoTranslation("Country", language);
  const addressText = useAutoTranslation("Address", language);
  const stateRegionProvinceText = useAutoTranslation("State, Region or Province", language);
  const aptFloorSuiteText = useAutoTranslation("Apt, floor, suite, etc.", language);
  const zipPostalCodeText = useAutoTranslation("ZIP/Postal Code", language);
  const cityText = useAutoTranslation("City", language);
  const phoneNumberText = useAutoTranslation("Phone Number", language);
  const setAsDefaultText = useAutoTranslation("Set as default", language);
  
  // Placeholders
  const enterFullNameText = useAutoTranslation("Enter full name", language);
  const addressLine1Text = useAutoTranslation("Address line 1", language);
  const stateRegionPlaceholderText = useAutoTranslation("State, region/province", language);
  const aptFloorPlaceholderText = useAutoTranslation("Apt, floor, suite, etc.", language);
  const zipPostalPlaceholderText = useAutoTranslation("ZIP/Postal code", language);
  const enterCityText = useAutoTranslation("Enter city", language);
  const enterPhoneText = useAutoTranslation("Enter phone no.", language);
  
  // Button text
  const savingText = useAutoTranslation("Saving...", language);
  const saveText = useAutoTranslation("Save", language);
  
  // Protection text
  const purchaseProtectedText = useAutoTranslation("Your purchase is protected.", language);
  const learnMoreText = useAutoTranslation("Learn more about Worxist's buyer protection", language);
  
  // Delete popup
  const deleteAddressQuestionText = useAutoTranslation("Delete Address?", language);
  const deletedAddressCantRecoverText = useAutoTranslation("Deleted address can't be recovered.", language);
  const keepText = useAutoTranslation("Keep", language);
  
  // Validation messages
  const fullNameRequiredText = useAutoTranslation("Full name is required.", language);
  const validFullNameText = useAutoTranslation("Please enter a valid full name (letters, spaces, hyphens, and apostrophes only).", language);
  const addressRequiredText = useAutoTranslation("Address is required.", language);
  const validAddressText = useAutoTranslation("Please enter a valid address (minimum 5 characters).", language);
  const validApartmentText = useAutoTranslation("Please enter a valid apartment/floor/suite information.", language);
  const cityRequiredText = useAutoTranslation("City is required.", language);
  const validCityText = useAutoTranslation("Please enter a valid city name.", language);
  const stateRequiredText = useAutoTranslation("State/Region is required.", language);
  const validStateText = useAutoTranslation("Please enter a valid state/region name.", language);
  const postalRequiredText = useAutoTranslation("Postal code is required.", language);
  const validPostalText = useAutoTranslation("Please enter a valid postal code (3-10 characters).", language);
  const phoneRequiredText = useAutoTranslation("Phone number is required.", language);
  const validPhoneText = useAutoTranslation("Please enter a valid phone number (e.g., +639XXXXXXXXX, 09123456789, +1234567890).", language);

  const validateForm = (): boolean => {
    const nameRegex = /^[A-Za-z][A-Za-z\s\-'\.]*[A-Za-z]$|^[A-Za-z]$/;
    const cityRegex = /^[A-Za-z][A-Za-z\s\-'.,]*[A-Za-z0-9]$|^[A-Za-z]$/;
    const stateRegex = /^[A-Za-z][A-Za-z\s\-'.,]*[A-Za-z0-9]$|^[A-Za-z]$/;
    const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
    const phoneRegex = /^(\+\d{1,3})?[\d\s\-()]{7,15}$/;
    const addressRegex = /^[A-Za-z0-9\s.,'\-/()]{5,}$/;
    const apartmentRegex = /^[A-Za-z0-9\s.,'\-/()]*$/;

    // Validate full name
    if (!formData.fullName.trim()) {
      toast.error(fullNameRequiredText);
      return false;
    }
    if (!nameRegex.test(formData.fullName.trim())) {
      toast.error(validFullNameText);
      return false;
    }

    // Validate address
    if (!formData.address.trim()) {
      toast.error(addressRequiredText);
      return false;
    }
    if (!addressRegex.test(formData.address.trim())) {
      toast.error(validAddressText);
      return false;
    }

    // Validate apartment (optional field)
    if (formData.apartment.trim() && !apartmentRegex.test(formData.apartment.trim())) {
      toast.error(validApartmentText);
      return false;
    }

    // Validate city
    if (!formData.city.trim()) {
      toast.error(cityRequiredText);
      return false;
    }
    if (!cityRegex.test(formData.city.trim())) {
      toast.error(validCityText);
      return false;
    }

    // Validate state
    if (!formData.state.trim()) {
      toast.error(stateRequiredText);
      return false;
    }
    if (!stateRegex.test(formData.state.trim())) {
      toast.error(validStateText);
      return false;
    }

    // Validate postal code
    if (!formData.postalCode.trim()) {
      toast.error(postalRequiredText);
      return false;
    }
    if (!postalCodeRegex.test(formData.postalCode.trim())) {
      toast.error(validPostalText);
      return false;
    }

    // Validate phone number
    if (!formData.phoneNumber.trim()) {
      toast.error(phoneRequiredText);
      return false;
    }
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      toast.error(validPhoneText);
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData((prev) => ({
        ...prev,
        fullName: translatedFullName || initialData.fullName || "",
        country: initialData.country || "Philippines",
        address: translatedAddress || initialData.address || "",
        apartment: translatedApartment || initialData.apartment || "",
        city: translatedCity || initialData.city || "",
        state: translatedState || initialData.state || "",
        postalCode: initialData.postalCode || "",
        phoneNumber: initialData.phoneNumber || "",
        setAsDefault: initialData.setAsDefault || false,
      }));
    }
  }, [initialData, isEditing, translatedFullName, translatedAddress, translatedApartment, translatedCity, translatedState]);

  const navigate = useNavigate();

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  // Disable scrollbar when delete popup is visible
  useEffect(() => {
    if (showDeletePopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeletePopup]);

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSave(formData);
  };

  const handleDelete = async (addressId: string) => {
    try {
      deleteAddress(addressId);
      queryClient.invalidateQueries({ queryKey: ["shippingAddresses"] });
      navigate("/shipping");
    } catch (err) {
      toast.error(failedToDeleteAddressText);
    }
  };
  const isFormValid =
    formData.fullName && formData.address && formData.city && formData.postalCode && formData.phoneNumber;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold dark:text-gray-100">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            {shippingDetailsText}
          </button>
        </div>

        <div className="px-6 py-3 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-medium text-gray-900 dark:text-gray-100">{isEditing ? editAddressText : addAddressText}</h2>
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowDeletePopup(true)}
                className="text-xs text-red-600 dark:text-red-400 font-medium hover:text-red-800 dark:hover:text-red-300"
              >
                {deleteText}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name and Country Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{fullNameText}</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder={enterFullNameText}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{countryText}</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors text-left flex items-center justify-between"
                    style={{ fontSize: "10px" }}
                  >
                    <span><TranslatedCountry countryName={formData.country} /></span>
                    <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  </button>
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => {
                            handleInputChange("country", country);
                            setIsCountryDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-[10px] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-100 first:rounded-t-lg last:rounded-b-lg"
                        >
                          <TranslatedCountry countryName={country} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address and State Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{addressText}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder={addressLine1Text}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{stateRegionProvinceText}</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder={stateRegionPlaceholderText}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
            </div>

            {/* Apartment and Postal Code Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{aptFloorSuiteText}</label>
                <input
                  type="text"
                  value={formData.apartment}
                  onChange={(e) => handleInputChange("apartment", e.target.value)}
                  placeholder={aptFloorPlaceholderText}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{zipPostalCodeText}</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  placeholder={zipPostalPlaceholderText}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
            </div>

            {/* City and Phone Number Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{cityText}</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder={enterCityText}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{phoneNumberText}</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder={enterPhoneText}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
            </div>

            {/* Set as Default Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="setAsDefault"
                checked={formData.setAsDefault}
                onChange={(e) => handleInputChange("setAsDefault", e.target.checked)}
                className="w-3 h-3 text-red-800 dark:text-red-400 border-gray-300 dark:border-gray-600 rounded focus:ring-red-800 dark:focus:ring-red-400"
              />
              <label htmlFor="setAsDefault" className="text-[11px] text-gray-700 dark:text-gray-300">
                {setAsDefaultText}
              </label>
            </div>

            {/* Buyer Protection */}
            <div className="flex items-center space-x-2 text-[10px] text-gray-600 dark:text-gray-400">
              <i className="bx bxs-check-circle text-black dark:text-green-400 text-sm"></i>
              <span>{purchaseProtectedText}</span>
              <button type="button" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300">
                {learnMoreText}
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="bg-red-800 dark:bg-red-700 text-white text-[11px] px-10 py-1.5 rounded-full font-medium hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? savingText : saveText}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Popup - Fixed overlay that prevents scrolling */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80">
            <p className="text-center text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">{deleteAddressQuestionText}</p>
            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mb-5">{deletedAddressCantRecoverText}</p>
            <div className="flex justify-between space-x-3">
              <button
                className="w-full px-4 py-1.5 text-[11px] rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowDeletePopup(false)}
              >
                {keepText}
              </button>
              <button
                className="w-full px-4 py-1.5 text-[11px] rounded-full bg-red-800 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600"
                onClick={() => addressId && handleDelete(addressId)}
              >
                {deleteText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAddressForm;
