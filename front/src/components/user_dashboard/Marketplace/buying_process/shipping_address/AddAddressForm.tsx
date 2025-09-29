import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Header from "@/components/user_dashboard/navbar/Header";
import countries from "@/components/data/countries";
import { useShippingAddresses } from "@/hooks/shipping/useShippingAddresses";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

  const validateForm = (): boolean => {
    const nameRegex = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/;
    const cityRegex = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/;
    const stateRegex = /^(?=.*[A-Za-z])[A-Z][A-Za-z0-9 ]*$/;
    const postalCodeRegex = /^\d{4,10}$/;
    const phoneRegex = /^(\+63|0)9\d{9}$/;
    const addressRegex = /^[A-Za-z\s.,'-]{3,}[0-9A-Za-z\s.,'-]*$/;
    const apartmentRegex = /^[A-Za-z\s.,'-]{3,}[0-9A-Za-z\s.,'-]*$/;

    if (!nameRegex.test(formData.fullName.trim())) {
      toast.error("Full name must start with capital letters and contain only letters and spaces.");
      return false;
    }

    if (!addressRegex.test(formData.address.trim())) {
      toast.error("Address must include a number and a valid street name.");
      return false;
    }

    if (formData.apartment && !apartmentRegex.test(formData.apartment.trim())) {
      toast.error("Apartment/floor/suite must be valid.");
      return false;
    }

    if (!cityRegex.test(formData.city.trim())) {
      toast.error("City must start with a capital letter and contain only letters and spaces.");
      return false;
    }

    if (!stateRegex.test(formData.state.trim())) {
      toast.error("State/Region must start with a capital letter and can contain letters, numbers, and spaces.");
      return false;
    }

    if (!postalCodeRegex.test(formData.postalCode.trim())) {
      toast.error("Postal code must contain only numbers and be 4-10 digits long.");
      return false;
    }

    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      toast.error("Phone number must be a valid Philippine number, e.g., +639XXXXXXXXX or 09XXXXXXXXX.");
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

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
      alert("Failed to delete address.");
    }
  };
  const isFormValid =
    formData.fullName && formData.address && formData.city && formData.postalCode && formData.phoneNumber;

  return (
    <div className="min-h-screen bg-white relative">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            Shipping Details
          </button>
        </div>

        <div className="px-6 py-3 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-medium text-gray-900">{isEditing ? "Edit Address" : "Add Address"}</h2>
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowDeletePopup(true)}
                className="text-xs text-red-600 font-medium hover:text-red-800"
              >
                Delete
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name and Country Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Full name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Country</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors text-left flex items-center justify-between"
                    style={{ fontSize: "10px" }}
                  >
                    <span>{formData.country}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => {
                            handleInputChange("country", country);
                            setIsCountryDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-[10px] hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {country}
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
                <label className="block text-xs font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Address line 1"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">State, Region or Province</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State, region/province"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
            </div>

            {/* Apartment and Postal Code Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Apt, floor, suite, etc.</label>
                <input
                  type="text"
                  value={formData.apartment}
                  onChange={(e) => handleInputChange("apartment", e.target.value)}
                  placeholder="Apt, floor, suite, etc."
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  placeholder="ZIP/Postal code"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
            </div>

            {/* City and Phone Number Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors"
                  style={{ fontSize: "10px" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="Enter phone no."
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors"
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
                className="w-3 h-3 text-red-800 border-gray-300 rounded focus:ring-red-800"
              />
              <label htmlFor="setAsDefault" className="text-[11px] text-gray-700">
                Set as default
              </label>
            </div>

            {/* Buyer Protection */}
            <div className="flex items-center space-x-2 text-[10px] text-gray-600">
              <i className="bx bxs-check-circle text-black text-sm"></i>
              <span>Your purchase is protected.</span>
              <button type="button" className="text-blue-600 underline hover:text-blue-700">
                Learn more about Worxist's buyer protection
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="bg-red-800 text-white text-[11px] px-10 py-1.5 rounded-full font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Popup - Fixed overlay that prevents scrolling */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <p className="text-center text-sm font-semibold text-gray-800 mb-2">Delete Address?</p>
            <p className="text-center text-xs text-gray-600 mb-5">Deleted address can't be recovered.</p>
            <div className="flex justify-between space-x-3">
              <button
                className="w-full px-4 py-1.5 text-[11px] rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDeletePopup(false)}
              >
                Keep
              </button>
              <button
                className="w-full px-4 py-1.5 text-[11px] rounded-full bg-red-800 text-white hover:bg-red-700"
                onClick={() => addressId && handleDelete(addressId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAddressForm;
