import type React from "react"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom";

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

  const handleAddNewAddress = () => {
    navigate("/add-address");
  };

  const handleEditAddress = (id) => {
    navigate(`/edit-address/${id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-6 border-b border-gray-100">
        <button onClick={onBack} className="mr-4">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Shipping Details</h1>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <h2 className="text-base font-medium text-gray-900 mb-6">Delivery Address</h2>

        {/* Address List */}
        <div className="space-y-4 mb-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => onSelectAddress(address.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <input
                      type="radio"
                      checked={selectedAddressId === address.id}
                      onChange={() => onSelectAddress(address.id)}
                      className="w-4 h-4 text-red-800 border-gray-300 focus:ring-red-800"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{address.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      {address.city}, {address.postalCode}
                    </p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditAddress(address.id)
                  }}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
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
          className="text-gray-900 text-sm font-medium underline hover:text-gray-700 mb-8"
        >
          Add a new address
        </button>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={onContinue}
            disabled={!selectedAddressId}
            className="bg-red-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails
