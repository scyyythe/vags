import ShippingDetails from "../ShippingDetails"
import { useNavigate } from "react-router-dom"
import { useAddressContext } from "../AddressContext"

const ShippingPage = () => {
  const navigate = useNavigate()
  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
  } = useAddressContext()

  return (
    <ShippingDetails
      addresses={addresses}
      selectedAddressId={selectedAddressId}
      onSelectAddress={setSelectedAddressId}
      onAddNewAddress={() => navigate("/add-address")}
      onEditAddress={(id) => navigate(`/edit-address/${id}`)}
      onBack={() => navigate("/")}
      onContinue={() => console.log("Continue with", selectedAddressId)}
    />
  )
}

export default ShippingPage
