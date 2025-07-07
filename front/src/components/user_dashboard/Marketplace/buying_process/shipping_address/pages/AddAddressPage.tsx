import { useNavigate, useParams } from "react-router-dom"
import AddAddressForm from "../AddAddressForm"
import { useAddressContext } from "../AddressContext"

const AddAddressPage = ({ isEditing }: { isEditing: boolean }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getAddressById, addOrUpdateAddress } = useAddressContext()

  const existing = id ? getAddressById(id) : undefined

  const parseInitialData = () => {
    if (!existing) return undefined
    const addressParts = existing.address.split(", ")
    const cityParts = existing.city.split(", ")
    return {
      fullName: existing.name,
      country: cityParts[2] || "Philippines",
      address: addressParts[0],
      apartment: addressParts[1] || "",
      city: cityParts[0],
      state: cityParts[1],
      postalCode: cityParts[3],
      phoneNumber: existing.phone,
      setAsDefault: existing.isDefault || false,
    }
  }

  const handleSave = (formData) => {
    addOrUpdateAddress({
      id: existing?.id || Date.now().toString(),
      name: formData.fullName,
      address: `${formData.address}${formData.apartment ? ", " + formData.apartment : ""}`,
      city: `${formData.city}, ${formData.state}, ${formData.country}, ${formData.postalCode}`,
      phone: formData.phoneNumber,
      postalCode: formData.postalCode,
      isDefault: formData.setAsDefault,
    })
    navigate("/shipping")
  }

  return (
    <AddAddressForm
      onBack={() => navigate("/shipping")}
      onSave={handleSave}
      initialData={parseInitialData()}
      isEditing={isEditing}
    />
  )
}

export default AddAddressPage
