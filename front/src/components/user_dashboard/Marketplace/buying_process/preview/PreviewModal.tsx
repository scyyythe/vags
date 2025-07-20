import React from "react";
import { useNavigate } from "react-router-dom";
import { useAddressContext } from "../shipping_address/AddressContext";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: {
    artworkImage: string;
    title: string;
    artist: string;
    medium: string;
    style: string;
    edition: string;
    size: string;
    yearCreated: string;
    price: number;
  };
  onProceedToCheckout: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, artwork, onProceedToCheckout }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();
  const { addresses } = useAddressContext();

  const handleProceed = () => {
    const hasDefaultAddress = addresses.length > 0;
    if (hasDefaultAddress) {
      navigate("/shipping");
    } else {
      navigate("/add-address");
    }
  };

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
          <img src={artwork.artworkImage} alt={artwork.title} className="w-36 h-32 object-cover rounded-md" />
        </div>

        {/* Title & Artist */}
        <h2 className="text-[14px] font-semibold text-center mt-4">{artwork.title}</h2>
        <p className="text-[10px] text-center text-gray-500 mt-1">by {artwork.artist}</p>

        {/* Grid Details */}
        <div className="my-4">
          <div className="border-t border-gray-100 w-[87%] mx-auto" />
          <div className="grid grid-cols-2 text-[10px] text-center py-5">
            <div>
              <h4 className="text-gray-500">Size</h4>
              <p className="font-medium">{artwork.size}</p>
            </div>
            <div>
              <h4 className="text-gray-500">Style</h4>
              <p className="font-medium">
                {artwork.style ? artwork.style.charAt(0).toUpperCase() + artwork.style.slice(1) : ""}
              </p>
            </div>
            <div className="pt-2 col-span-1">
              <h4 className="text-gray-500">Medium</h4>
              <p className="font-medium">
                {artwork.medium ? artwork.medium.charAt(0).toUpperCase() + artwork.medium.slice(1) : ""}
              </p>
            </div>

            <div className="pt-2 col-span-1">
              <h4 className="text-gray-500">Edition</h4>
              <p className="font-medium">{artwork.edition}</p>
            </div>
            <div className="pt-2 col-span-2">
              <h4 className="text-gray-500">Year Created</h4>
              <p className="font-medium">{artwork.yearCreated}</p>
            </div>
          </div>
          <div className="border-b border-gray-100 w-[87%] mx-auto" />
        </div>

        {/* Price & Button */}
        <div className="text-center">
          <div className="flex justify-between my-4">
            <p className="text-[15px] font-semibold relative top-1.5">PRICE</p>
            <p className="text-xl font-bold text-red-800">
              ₱{artwork.price >= 1000 ? `${artwork.price / 1000}k` : artwork.price}
            </p>
          </div>

          <button
            className="w-full bg-red-800 text-white rounded-full py-2.5 text-[11px] font-medium hover:bg-red-700"
            onClick={handleProceed}
          >
            proceed to checkout →
          </button>

          <p className="text-[9px] text-gray-400 mt-2 italic">
            Shipping is handled directly by the seller after purchase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
