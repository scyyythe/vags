import PreviewModal from "../preview/PreviewModal"
import { useNavigate } from "react-router-dom"
import { useAddressContext } from "../shipping_address/AddressContext"
import { useLanguage } from "@/context/LanguageContext"
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation"

const PreviewPage = () => {
  const navigate = useNavigate()
  const { addresses } = useAddressContext()

  // Language and translation
  const { language } = useLanguage()
  const abstractCompositionText = useAutoTranslation("Abstract Composition", language)
  const janeDoeText = useAutoTranslation("Jane Doe", language)
  const oilOnCanvasText = useAutoTranslation("Oil on Canvas", language)
  const abstractText = useAutoTranslation("Abstract", language)
  const limitedText = useAutoTranslation("Limited", language)
  const sizeText = useAutoTranslation("24x36 inches", language)

  const sampleArtwork = {
    id: "sample-artwork-1",
    artworkImage: "/placeholder.svg?height=128&width=144",
    title: abstractCompositionText,
    artist: janeDoeText,
    medium: oilOnCanvasText,
    style: abstractText,
    edition: limitedText,
    size: sizeText,
    yearCreated: "2023",
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PreviewModal
        isOpen={true}
        onClose={() => navigate("/")}
        onProceedToCheckout={handleProceed}
        artwork={sampleArtwork}
      />
    </div>
  )
}

export default PreviewPage
