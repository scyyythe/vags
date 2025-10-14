import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAddressContext } from "../shipping_address/AddressContext";
import useAllAddresses from "@/hooks/users/address/useAllAddresses";
import { usePurchase } from "@/context/PurchaseContext";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: {
    id: string;
    artworkImage: string;
    title: string;
    artist: string;
    medium: string;
    style: string;
    edition: string;
    size: string;
    yearCreated: string;
    price: number;
    default_paypal_email?: string;
    quantity?: number;
    availableQuantity?: number;
  };
  onProceedToCheckout: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, artwork, onProceedToCheckout }) => {
  // ALL HOOKS MUST BE CALLED AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const navigate = useNavigate();
  const { data: addresses = [], isLoading, error: addressesError } = useAllAddresses();
  const { setArtwork } = usePurchase();

  // Disable scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  if (!isOpen) return null;

  // Validate artwork object
  if (!artwork || typeof artwork !== "object") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl w-[300px] md:w-[330px] py-6 px-8 relative">
          <button onClick={onClose} className="absolute right-6 top-5 text-xl font-bold text-gray-800">
            <i className="bx bx-x"></i>
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Invalid Data</h2>
            <p className="text-sm text-gray-600 mb-4">Artwork data is invalid or missing.</p>
            <button
              onClick={onClose}
              className="bg-red-800 text-white rounded-full py-2 px-4 text-sm font-medium hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleProceed = () => {
    if (isLoading) return;

    // Calculate total price based on quantity
    const quantity = artwork.quantity || 1;
    const totalPrice = artwork.price * quantity;

    setArtwork({
      ...artwork,
      id: artwork.id,
      yearCreated: Number(artwork.yearCreated),
      quantity: quantity,
      price: totalPrice, // Pass the total price
      originalPrice: artwork.price, // Keep original price for reference
      availableQuantity: artwork.availableQuantity || 1,
    });

    const hasAddress = Array.isArray(addresses) && addresses.length > 0;
    navigate(hasAddress ? "/shipping" : "/add-address");
  };

  try {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className="bg-white rounded-2xl w-[300px] md:w-[330px] py-6 px-8 relative animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* X button */}
          <button onClick={onClose} className="absolute right-6 top-5 text-xl font-bold text-gray-800">
            <i className="bx bx-x"></i>
          </button>

          {/* Logo */}
          <img src="/pics/wx.png" alt="Logo" className="h-5 w-6 mb-4" />

          {/* Image */}
          <div className="flex justify-center">
            <img
              src={artwork.artworkImage || "/images/placeholder.jpg"}
              alt={artwork.title || "Artwork"}
              className="w-36 h-32 object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder.jpg";
              }}
            />
          </div>

          {/* Title & Artist */}
          <h2 className="text-[14px] font-semibold text-center mt-4">{artwork.title || "Untitled"}</h2>
          <p className="text-[10px] text-center text-gray-500 mt-1">by {artwork.artist || "Unknown Artist"}</p>

          {/* Grid Details */}
          <div className="my-4">
            <div className="border-t border-gray-100 w-[87%] mx-auto" />
            <div className="grid grid-cols-2 text-[10px] text-center py-5">
              <div>
                <h4 className="text-gray-500">Size</h4>
                <p className="font-medium">{artwork.size || "Unknown"}</p>
              </div>
              <div>
                <h4 className="text-gray-500">Style</h4>
                <p className="font-medium">
                  {artwork.style ? artwork.style.charAt(0).toUpperCase() + artwork.style.slice(1) : "Unknown"}
                </p>
              </div>
              <div className="pt-2 col-span-1">
                <h4 className="text-gray-500">Medium</h4>
                <p className="font-medium">
                  {artwork.medium ? artwork.medium.charAt(0).toUpperCase() + artwork.medium.slice(1) : "Unknown"}
                </p>
              </div>

              <div className="pt-2 col-span-1">
                <h4 className="text-gray-500">Edition</h4>
                <p className="font-medium">{artwork.edition || "Unknown"}</p>
              </div>
              <div className="pt-2 col-span-2">
                <h4 className="text-gray-500">Year Created</h4>
                <p className="font-medium">{artwork.yearCreated || "Unknown"}</p>
              </div>
            </div>
            <div className="border-b border-gray-100 w-[87%] mx-auto" />
          </div>

          {/* Price & Button */}
          <div className="text-center">
            <div className="flex justify-between my-4">
              <p className="text-[15px] font-semibold relative top-1.5">
                {artwork.edition === "Open Edition" && artwork.quantity && artwork.quantity > 1
                  ? "TOTAL PRICE"
                  : "PRICE"}
              </p>
              <div className="text-right">
                {artwork.edition === "Open Edition" && artwork.quantity && artwork.quantity > 1 ? (
                  <>
                    <p className="text-xl font-bold text-red-800">
                      ₱
                      {artwork.price * artwork.quantity >= 1000
                        ? `${(artwork.price * artwork.quantity) / 1000}k`
                        : artwork.price * artwork.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      ({artwork.quantity} × ₱{artwork.price >= 1000 ? `${artwork.price / 1000}k` : artwork.price})
                    </p>
                  </>
                ) : (
                  <p className="text-xl font-bold text-red-800">
                    ₱{artwork.price && artwork.price >= 1000 ? `${artwork.price / 1000}k` : artwork.price || 0}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleProceed}
              disabled={isLoading}
              className="w-full bg-red-800 text-white rounded-full py-2.5 text-[11px] font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "proceed to checkout →"}
            </button>

            <p className="text-[9px] text-gray-400 mt-2 italic">
              Shipping is handled directly by the seller after purchase.
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl w-[300px] md:w-[330px] py-6 px-8 relative">
          <button onClick={onClose} className="absolute right-6 top-5 text-xl font-bold text-gray-800">
            <i className="bx bx-x"></i>
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-sm text-gray-600 mb-4">Something went wrong loading the preview.</p>
            <button
              onClick={onClose}
              className="bg-red-800 text-white rounded-full py-2 px-4 text-sm font-medium hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default PreviewModal;
