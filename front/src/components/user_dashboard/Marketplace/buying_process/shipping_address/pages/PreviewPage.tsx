import PreviewModal from "../../preview/PreviewModal"
import { useNavigate } from "react-router-dom"
import { useAddressContext } from "../AddressContext"

const PreviewPage = () => {
  const navigate = useNavigate()
  const { addresses } = useAddressContext()

  const sampleArtwork = {
    artworkImage: "/placeholder.svg?height=128&width=144",
    title: "Abstract Composition",
    artist: "Jane Doe",
    medium: "Oil on Canvas",
    style: "Abstract",
    edition: "Limited",
    size: "24x36 inches",
    yearCreated: 2023,
    price: 2500,
  }

  const handleProceed = () => {
    if (addresses.length === 0) {
      navigate("/add-address")
    } else {
      navigate("/shipping")
    }
  }

  return (
    <PreviewModal
      isOpen={true}
      onClose={() => navigate("/")}
      onProceedToCheckout={handleProceed}
      artwork={sampleArtwork}
    />
  )
}

export default PreviewPage
