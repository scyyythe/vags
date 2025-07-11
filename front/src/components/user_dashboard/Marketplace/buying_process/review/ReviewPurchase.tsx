import type React from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/user_dashboard/navbar/Header";

interface ReviewPurchaseProps {
  onBack: () => void
  onSubmit: () => void
  selectedAddress?: {
    name: string
    address: string
    city: string
  }
  selectedPaymentMethod?: {
    type: string
    details: string
  }
  artwork?: {
    artworkImage: string
    title: string
    artist: string
    size: string
    style: string
    medium: string
    edition: string
    yearCreated: number
    price: number
  }
}

const ReviewPurchase: React.FC<ReviewPurchaseProps> = ({
  onBack,
  onSubmit,
  selectedAddress,
  selectedPaymentMethod,
  artwork,
}) => {
  const navigate = useNavigate()

  const handleAddressChange = () => {
    navigate("/shipping")
  }

  const handlePaymentMethodChange = () => {
    navigate("/payment-method")
  }

  const handleSubmit = () => {
    onSubmit()
  }

  // Default data if not provided
  const defaultAddress = selectedAddress || {
    name: "Jamaica Anuba",
    address: "Sitio Cabutoy",
    city: "Talisay, Cebu City, Philippines",
  }

  const defaultPaymentMethod = selectedPaymentMethod || {
    type: "PayPal",
    details: "(display the major short details of the payment method)",
  }

  const defaultArtwork = artwork || {
    artworkImage: "/placeholder.svg?height=200&width=200",
    title: "Butterfly",
    artist: "Angie Canete",
    size: "11 x 8.5 inches",
    style: "Painting",
    medium: "Canvas",
    edition: "Limited Edition",
    yearCreated: 2025,
    price: 100000,
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
              Review Purchase
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6">
          {/* Left Column - Address and Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-900">Address [{defaultAddress.city}]</h3>
                <button
                  onClick={handleAddressChange}
                  className="text-xs font-medium text-gray-900 underline hover:text-gray-700"
                >
                  Change
                </button>
              </div>
              <p className="text-[11px] text-gray-600">
                After your order is confirmed, a specialist will contact you to coordinate your purchase.
              </p>
            </div>

            {/* Payment Method Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-900">Payment Method</h3>
                <button
                  onClick={handlePaymentMethodChange}
                  className="text-xs font-medium text-gray-900 underline hover:text-gray-700"
                >
                  Change
                </button>
              </div>

              <div className="flex items-center space-x-3 mb-3">
                {defaultPaymentMethod.type === "PayPal" && (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/pics/paypal.png" alt="paypal" />
                  </div>
                )}
                {defaultPaymentMethod.type === "GCash" && (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/pics/gcash.png" alt="paypal" />
                  </div>
                )}
                {defaultPaymentMethod.type === "Stripe" && (
                  <div className="w-8 h-8 items-center justify-center">
                    <img src="/pics/stripe.png" alt="paypal" />
                  </div>
                )}
                {defaultPaymentMethod.type === "Credit Card" && (
                  <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="https://img.icons8.com/skeuomorphism/96/bank-card-back-side.png" />
                    </svg>
                  </div>
                )}
                <span className="text-xs font-medium">{defaultPaymentMethod.type}</span>
              </div>

              <p className="text-[11px] text-gray-600">{defaultPaymentMethod.details}</p>
            </div>

            {/* Buyer Protection */}
            <div className="flex items-center space-x-2 text-[11px] text-gray-600">
              <i className='bx bxs-check-circle text-black text-sm'></i>
              <span>Your purchase is protected.</span>
              <button className="text-blue-600 underline hover:text-blue-700">
                Learn more about Worxist's buyer protection
              </button>
            </div>
          </div>

          {/* Right Column - Artwork Details */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg py-8 px-10 space-y-4">
              {/* Artwork Image */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-black rounded-lg overflow-hidden">
                  <img
                    src={defaultArtwork.artworkImage || "/placeholder.svg"}
                    alt={defaultArtwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Artwork Title and Artist */}
              <div className="text-center mb-4">
                <h3 className="text-md font-semibold text-gray-900">{defaultArtwork.title}</h3>
                <p className="text-xs text-gray-600">by {defaultArtwork.artist}</p>
              </div>

              {/* Artwork Details */}
              <div className="space-y-2 text-xs pt-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Size</span>
                  <span className="font-medium">{defaultArtwork.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Style</span>
                  <span className="font-medium">{defaultArtwork.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medium</span>
                  <span className="font-medium">{defaultArtwork.medium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Edition</span>
                  <span className="font-medium">{defaultArtwork.edition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Created</span>
                  <span className="font-medium">{defaultArtwork.yearCreated}</span>
                </div>
              </div>

              {/* Price */}
              <div className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">PRICE</span>
                  <span className="text-xl font-bold text-red-800">
                    ₱{defaultArtwork.price >= 1000 ? `${defaultArtwork.price / 1000}k` : defaultArtwork.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-6 py-8">
          <div className="flex flex-col items-start space-y-4">
            <button
              onClick={handleSubmit}
              className="bg-red-800 text-white text-[11px] px-16 py-2.5 rounded-full font-medium hover:bg-red-700 transition-colors"
            >
              Submit
            </button>
            <p className="text-[11px] text-gray-500 text-center max-w-md whitespace-nowrap">
              By clicking Submit, I agree to Worxist's{" "}
              <button className="text-blue-600 underline hover:text-blue-700">
                General Terms and Conditions of Sale
              </button>
            </p>
          </div>
        </div>
      </div>
    </div> 
  )
}

export default ReviewPurchase
