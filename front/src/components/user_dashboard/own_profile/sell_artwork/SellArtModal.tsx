import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { usePaymentAccounts } from "@/hooks/accounts/usePaymentAccounts";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface SellArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSellArtwork: (data: SellArtworkData) => void;
  artworkTitle?: string;
  resetTrigger?: number;
}

export interface SellArtworkData {
  additionalImages: File[];
  price: string;
  yearCreated: string;
  edition: string;
  quantity: string;
}

interface ValidationErrors {
  price?: string;
  yearCreated?: string;
  quantity?: string;
}

const SellArtworkModal: React.FC<SellArtworkModalProps> = ({
  isOpen,
  onClose,
  onSellArtwork,
  artworkTitle = "TITLE/HEADER",
}) => {
  const [formData, setFormData] = useState<SellArtworkData>({
    additionalImages: [],
    price: "",
    yearCreated: "",
    edition: "Original (1 of 1)",
    quantity: "1",
  });

  const [imageSlots, setImageSlots] = useState<(File | null)[]>([null, null, null, null]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { accounts: paymentAccounts } = usePaymentAccounts();
  const navigate = useNavigate();

  // Language and translation
  const { language } = useLanguage();
  const setArtworkDetailsText = useAutoTranslation("Set your artwork details and pricing", language);
  const addMorePicturesText = useAutoTranslation("Add more pictures (Optional)", language);
  const removeText = useAutoTranslation("Remove", language);
  const setPriceText = useAutoTranslation("Set price", language);
  const enterAmountText = useAutoTranslation("Enter amount (e.g., 1000)", language);
  const yearCreatedText = useAutoTranslation("Year Created", language);
  const enterYearText = useAutoTranslation("Enter year (e.g., 2023)", language);
  const selectEditionText = useAutoTranslation("Select Edition", language);
  const original1of1Text = useAutoTranslation("Original (1 of 1)", language);
  const limitedEditionText = useAutoTranslation("Limited Edition", language);
  const openEditionText = useAutoTranslation("Open Edition", language);
  const setQuantityText = useAutoTranslation("Set quantity", language);
  const listArtworkForSaleText = useAutoTranslation("List Artwork for Sale", language);
  const setupPaymentAccountFirstText = useAutoTranslation("Set up payment account first", language);
  const needPaymentAccountText = useAutoTranslation("You need to set up a payment account to receive payments", language);
  const setupPaymentAccountLinkText = useAutoTranslation("Set up payment account →", language);
  
  // Validation error messages
  const priceRequiredText = useAutoTranslation("Price is required", language);
  const validPriceText = useAutoTranslation("Please enter a valid price (positive number, max 2 decimals, ≤", language);
  const yearRequiredText = useAutoTranslation("Year created is required", language);
  const validYearText = useAutoTranslation("Please enter a valid year", language);
  const quantityRequiredText = useAutoTranslation("Quantity is required", language);
  const quantityAtLeast1Text = useAutoTranslation("Quantity must be at least 1", language);
  
  // Toast messages
  const setupPaymentBeforeListingText = useAutoTranslation("Please set up a payment account before listing artwork for sale", language);
  const fixErrorsText = useAutoTranslation("Please fix the errors before submitting", language);

  // Translation for fetched artwork title
  const translatedArtworkTitle = useAutoTranslation(artworkTitle || "", language);

  // Disable background scrolling when modal is open
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

  if (!isOpen) return null;

  const isQuantityVisible = formData.edition !== "Original (1 of 1)";

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Price validation
    if (!formData.price.trim()) {
      newErrors.price = priceRequiredText;
    } else {
      const priceNumber = Number(formData.price);
      const priceRegex = /^\d+(\.\d{1,2})?$/;
      const MAX_PRICE = 1000000;

      if (
        isNaN(priceNumber) ||
        priceNumber <= 0 ||
        priceNumber > MAX_PRICE ||
        !priceRegex.test(formData.price.trim())
      ) {
        newErrors.price = `${validPriceText} ${MAX_PRICE})`;
      }
    }

    // Year validation
    if (!formData.yearCreated.trim()) {
      newErrors.yearCreated = yearRequiredText;
    } else {
      const year = Number(formData.yearCreated);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear) {
        newErrors.yearCreated = `${validYearText} (1000-${currentYear})`;
      }
    }

    // Quantity validation (only if visible)
    if (isQuantityVisible) {
      if (!formData.quantity.trim()) {
        newErrors.quantity = quantityRequiredText;
      } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 1) {
        newErrors.quantity = quantityAtLeast1Text;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (index: number, file: File | null) => {
    const newSlots = [...imageSlots];
    newSlots[index] = file;
    setImageSlots(newSlots);

    setFormData((prev) => ({
      ...prev,
      additionalImages: newSlots.filter((slot) => slot !== null) as File[],
    }));
  };

  const handleSubmit = () => {
    if (paymentAccounts.length === 0) {
      toast.error(setupPaymentBeforeListingText, {
        closeButton: true,
      });
      return;
    }

    if (validateForm()) {
      onSellArtwork(formData);
    } else {
      toast.error(fixErrorsText, {
        closeButton: true,
      });
    }
  };

  const handleInputChange = (field: keyof SellArtworkData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEditionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      edition: value,
      quantity: value === "Original (1 of 1)" ? "1" : prev.quantity,
    }));
    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: undefined }));
    }
  };

  const handleSetupAccount = () => {
    onClose(); // Close the modal first
    navigate("/settings/billing"); // Navigate to billing settings
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg px-10 py-6 w-ful max-w-sm relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={15} />
        </button>

        {/* Header */}
        <div className="text-left mb-6">
          <p className="text-lg text-black font-bold text-left">{translatedArtworkTitle}</p>
          <p className="text-[10px] text-black mt-1">{setArtworkDetailsText}</p>
        </div>

        {/* Add more pictures */}
        <div className="mb-6">
          <h3 className="text-[11px] font-medium text-gray-900 mb-3">{addMorePicturesText}</h3>

          <div className="grid grid-cols-4 gap-3">
            {imageSlots.map((slot, index) => (
              <div
                key={index}
                className="relative w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (!file || !file.type.startsWith("image/")) return;
                  handleImageUpload(index, file);
                }}
                onClick={() => document.getElementById(`file-input-${index}`)?.click()}
              >
                {slot ? (
                  <>
                    <img
                      src={URL.createObjectURL(slot)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {/* Show only on this hovered container */}
                    <div
                      className="absolute inset-0 bg-black bg-opacity-60 text-white text-[9px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageUpload(index, null);
                      }}
                    >
                      {removeText}
                    </div>
                  </>
                ) : (
                  <i className="bx bx-images text-gray-300 text-2xl"></i>
                )}

                <input
                  id={`file-input-${index}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleImageUpload(index, file);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Set price */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-gray-900 mb-2">{setPriceText}</label>
          <Input
            type="text"
            placeholder={enterAmountText}
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            className={`w-full h-8 ${errors.price ? "" : ""}`}
            style={{ fontSize: "10px" }}
          />
          {errors.price && <p className="text-red-500 mt-1 text-[10px]">{errors.price}</p>}
        </div>

        {/* Year Created */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-gray-900 mb-2">{yearCreatedText}</label>
          <Input
            type="text"
            placeholder={enterYearText}
            value={formData.yearCreated}
            onChange={(e) => handleInputChange("yearCreated", e.target.value)}
            className={`w-full h-8 ${errors.yearCreated ? "" : ""}`}
            style={{ fontSize: "10px" }}
          />
          {errors.yearCreated && <p className="text-red-500 text-[10px] mt-1">{errors.yearCreated}</p>}
        </div>

        {/* Edition and Quantity */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-[11px] font-medium text-gray-900 mb-2">{selectEditionText}</label>
            <Select value={formData.edition} onValueChange={handleEditionChange}>
              <SelectTrigger className="w-full text-[10px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Original (1 of 1)" className="text-[10px]">
                  {original1of1Text}
                </SelectItem>
                <SelectItem value="Limited Edition" className="text-[10px]">
                  {limitedEditionText}
                </SelectItem>
                <SelectItem value="Open Edition" className="text-[10px]">
                  {openEditionText}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isQuantityVisible && (
            <div>
              <label className="block text-[11px] font-medium text-gray-900 mb-2">{setQuantityText}</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className={`w-full h-8 ${errors.quantity ? "border-red-500" : ""}`}
                min="1"
                style={{ fontSize: "10px" }}
              />
              {errors.quantity && <p className="text-red-500 text-[10px] mt-1">{errors.quantity}</p>}
            </div>
          )}
        </div>

        {/* Sell Artwork Button */}
        <Button
          onClick={handleSubmit}
          disabled={paymentAccounts.length === 0}
          className={`w-full h-8 text-white text-xs py-3 rounded-full ${
            paymentAccounts.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-red-800 hover:bg-red-700"
          }`}
        >
          {paymentAccounts.length === 0 ? setupPaymentAccountFirstText : listArtworkForSaleText}
        </Button>

        {/* Payment account warning and setup button */}
        {paymentAccounts.length === 0 && (
          <div className="mt-2 text-center">
            <p className="text-[9px] text-red-500 mb-2">{needPaymentAccountText}</p>
            <button onClick={handleSetupAccount} className="text-[9px] text-blue-600 hover:text-blue-800 underline">
              {setupPaymentAccountLinkText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellArtworkModal;
