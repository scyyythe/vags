import type React from "react"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";

interface Address {
  id: string
  name: string
  address: string
  city: string
  postalCode: string
  phone: string
  isDefault?: boolean
}

interface ShippingDetailsProps {
  addresses: Address[]
  selectedAddressId: string | null
  onSelectAddress: (addressId: string) => void
  onAddNewAddress: () => void
  onEditAddress: (addressId: string) => void
  onBack: () => void
  onContinue: () => void
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

  const handleContinue = () => {
    if (selectedAddressId) {
      navigate("/payment-method");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        <div className="mb-2">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
              Shipping Details
          </button>
        </div>

      <div className="px-6 py-4 mx-auto">
        <h2 className="text-xs font-medium text-gray-900 mb-6">Delivery Address</h2>

        {/* Address List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-gray-200 rounded-lg py-4 px-8 cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => onSelectAddress(address.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <input
                      type="radio"
                      checked={selectedAddressId === address.id}
                      onChange={() => onSelectAddress(address.id)}
                      className="w-3 h-3 accent-red-800"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-[13px] mt-1.5">{address.name}</h3>
                    <p className="text-[11px] text-gray-600 mb-1">{address.address}</p>
                    <p className="text-[11px] text-gray-600 mb-1">
                      {address.city}
                    </p>
                    <p className="text-[11px] text-gray-600">{address.phone}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditAddress(address.id)
                  }}
                  className="text-blue-700 text-xs font-semibold hover:text-blue-800 underline mt-1.5"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Address */}
        <button
          onClick={onAddNewAddress}
          className="text-gray-900 text-xs font-medium underline hover:text-gray-700 mb-8"
        >
          Add a new address
        </button>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!selectedAddressId}
            className="bg-red-800 text-white text-[11px] px-10 py-2.5 rounded-full font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save and Continue
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default ShippingDetails
