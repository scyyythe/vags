import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CloudUpload } from "lucide-react";
import Header from "@/components/user_dashboard/navbar/Header";
import useSellArtwork from "@/hooks/artworks/sell/useSellArtwork";
import { usePaymentAccounts } from "@/hooks/accounts/usePaymentAccounts";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { ART_STYLES } from "@/components/user_dashboard/Explore/create_post/ArtworkStyles";
const SellArtwork = () => {
  const navigate = useNavigate();
  const [artworkTitle, setArtworkTitle] = useState("");
  const [yearCreated, setYearCreated] = useState("");
  const [artworkStyle, setArtworkStyle] = useState("");
  const [medium, setMedium] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<(File | null)[]>([null, null, null, null]);
  const [isUploading, setIsUploading] = useState(false);

  const [price, setPrice] = useState("");
  const [edition, setEdition] = useState("Original (1 of 1)");
  const [quantity, setQuantity] = useState("1");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const { sellArtwork } = useSellArtwork();
  const { accounts } = usePaymentAccounts();

  // Translation hooks
  const { language } = useLanguage();
  const sellAnArtworkText = useAutoTranslation("Sell an Artwork", language);
  const fileSizeErrorText = useAutoTranslation("File size must be less than 20MB", language);
  const imageFilesOnlyText = useAutoTranslation("Please upload only image files", language);
  const paymentAccountErrorText = useAutoTranslation(
    "You cannot sell artwork without setting up a payment account. Please add a bank account, PayPal, or other payment method in your account settings to receive payments.",
    language
  );
  const enterTitleErrorText = useAutoTranslation("Please enter an artwork title.", language);
  const uploadImageErrorText = useAutoTranslation("Please upload an image of your artwork.", language);
  const enterPriceErrorText = useAutoTranslation("Please enter a price for your artwork.", language);
  const listingArtworkText = useAutoTranslation("Listing artwork for sale...", language);
  const artworkListedSuccessText = useAutoTranslation("Artwork listed successfully!", language);
  const failedToListText = useAutoTranslation("Failed to list artwork", language);
  const setupPaymentAccountText = useAutoTranslation(
    "You must set up a payment account before selling artwork.",
    language
  );
  const titleRequiredText = useAutoTranslation("Please enter an artwork title.", language);
  const titleMinLengthText = useAutoTranslation("Title should be at least 2 characters long.", language);
  const titleMaxLengthText = useAutoTranslation("Title should be less than 100 characters.", language);
  const yearRequiredText = useAutoTranslation("Please enter the year the artwork was created.", language);
  const validYearText = useAutoTranslation("Please enter a valid year between 1000 and", language);
  const selectStyleText = useAutoTranslation("Please select an artwork style.", language);
  const enterMediumText = useAutoTranslation("Please enter the medium used for this artwork.", language);
  const mediumMaxLengthText = useAutoTranslation("Medium description should be less than 100 characters.", language);
  const enterHeightText = useAutoTranslation("Please enter the height of your artwork.", language);
  const heightValidText = useAutoTranslation("Height must be a positive number between 1-10000 cm.", language);
  const enterWidthText = useAutoTranslation("Please enter the width of your artwork.", language);
  const widthValidText = useAutoTranslation("Width must be a positive number between 1-10000 cm.", language);
  const priceRequiredText = useAutoTranslation("Please enter a price for your artwork.", language);
  const pricePositiveText = useAutoTranslation("Price must be a positive number.", language);
  const priceTooHighText = useAutoTranslation("Price seems too high. Please enter a reasonable amount.", language);
  const quantityRequiredText = useAutoTranslation("Please enter the quantity for this edition.", language);
  const quantityPositiveText = useAutoTranslation("Quantity must be a positive number.", language);
  const quantityMaxText = useAutoTranslation("Quantity cannot exceed 10000.", language);
  const descriptionRequiredText = useAutoTranslation("Please enter a description for your artwork.", language);
  const descriptionMaxText = useAutoTranslation("Description cannot exceed 1000 characters.", language);
  const uploadMainImageText = useAutoTranslation("Please upload a main image of your artwork.", language);
  const mainImageSizeText = useAutoTranslation("Main image file size must be less than 20MB.", language);
  const additionalImageValidText = useAutoTranslation("must be a valid image file.", language);
  const additionalImageSizeText = useAutoTranslation("file size must be less than 20MB.", language);
  const chooseFileText = useAutoTranslation("Choose a file or drag and drop it here", language);
  const chooseFileButtonText = useAutoTranslation("Choose File", language);
  const recommendFilesText = useAutoTranslation("We recommend using high quality .jpg files less than 20MB", language);
  const addMorePicturesText = useAutoTranslation("Add more pictures (Optional)", language);
  const removeText = useAutoTranslation("Remove", language);
  const provideDetailsText = useAutoTranslation("Provide artwork details.", language);
  const artworkTitleLabelText = useAutoTranslation("Artwork Title", language);
  const enterArtworkTitleText = useAutoTranslation("Enter artwork title", language);
  const yearCreatedLabelText = useAutoTranslation("Year Created", language);
  const enterYearText = useAutoTranslation("Enter year", language);
  const artworkStyleLabelText = useAutoTranslation("Artwork Style", language);
  const selectArtworkStyleText = useAutoTranslation("Select artwork style", language);
  const mediumLabelText = useAutoTranslation("Medium", language);
  const enterMediumUsedText = useAutoTranslation("Enter medium used", language);
  const dimensionsLabelText = useAutoTranslation("Dimensions (cm)", language);
  const heightLabelText = useAutoTranslation("Height", language);
  const widthLabelText = useAutoTranslation("Width", language);
  const priceLabelText = useAutoTranslation("Price", language);
  const enterPriceText = useAutoTranslation("Enter price for artwork", language);
  const editionLabelText = useAutoTranslation("Edition", language);
  const original1of1Text = useAutoTranslation("Original (1 of 1)", language);
  const limitedEditionText = useAutoTranslation("Limited Edition", language);
  const openEditionText = useAutoTranslation("Open Edition", language);
  const quantityLabelText = useAutoTranslation("Quantity", language);
  const aboutArtworkText = useAutoTranslation("About this Artwork", language);
  const addDescriptionText = useAutoTranslation("Add a description", language);
  const paymentAccountRequiredText = useAutoTranslation("Payment Account Required", language);
  const setupPaymentAccountDescText = useAutoTranslation(
    "Set up a payment account to receive payments before selling.",
    language
  );
  const setupPaymentAccountButtonText = useAutoTranslation("Set up payment account →", language);
  const listingText = useAutoTranslation("Listing...", language);
  const sellNowText = useAutoTranslation("Sell Now", language);

  // Helper component for translating style names in SelectItems
  const TranslatedStyleOption: React.FC<{ styleName: string }> = ({ styleName }) => {
    const translatedStyle = useAutoTranslation(styleName, language);
    return <>{translatedStyle}</>;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(fileSizeErrorText, {
          closeButton: true,
        });
        return;
      }
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleAdditionalImageChange = (index: number, file: File | null) => {
    const newImages = [...additionalImages];
    newImages[index] = file;
    setAdditionalImages(newImages);
  };

  const handleAdditionalImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAdditionalImageDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error(fileSizeErrorText, {
          closeButton: true,
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(imageFilesOnlyText, {
          closeButton: true,
        });
        return;
      }
      handleAdditionalImageChange(index, file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error(fileSizeErrorText, {
          closeButton: true,
        });
        return;
      }
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user has payment accounts set up
    if (!accounts || accounts.length === 0) {
      toast.error(paymentAccountErrorText, {
        closeButton: true,
        duration: 6000,
      });
      return;
    }

    if (!validateForm()) {
      return;
    }
    if (!artworkTitle.trim()) {
      toast.error(enterTitleErrorText, {
        closeButton: true,
      });
      return;
    }

    if (!selectedFile) {
      toast.error(uploadImageErrorText, {
        closeButton: true,
      });
      return;
    }

    if (!price) {
      toast.error(enterPriceErrorText, {
        closeButton: true,
      });
      return;
    }

    setIsUploading(true);
    toast.loading(listingArtworkText, { id: "upload" });

    try {
      // Simulate API call
      await sellArtwork({
        title: artworkTitle,
        year_created: yearCreated,
        style: artworkStyle,
        medium,
        height,
        width,
        description,
        price,
        edition,
        quantity,
        mainImage: selectedFile,
        additionalImages,
      });
      toast.success(artworkListedSuccessText, {
        id: "upload",
        closeButton: true,
      });
      navigate("/marketplace");
    } catch (error) {
      toast.error(failedToListText, {
        id: "upload",
        closeButton: true,
      });
    } finally {
      setIsUploading(false);
    }
  };
  const validateForm = (): boolean => {
    const currentYear = new Date().getFullYear();

    // Payment Account Check
    if (!accounts || accounts.length === 0) {
      toast.error(setupPaymentAccountText, {
        closeButton: true,
        duration: 5000,
      });
      return false;
    }

    // Title - More lenient validation
    if (!artworkTitle.trim()) {
      toast.error(titleRequiredText);
      return false;
    }
    if (artworkTitle.trim().length < 2) {
      toast.error(titleMinLengthText);
      return false;
    }
    if (artworkTitle.trim().length > 100) {
      toast.error(titleMaxLengthText);
      return false;
    }

    // Year - Required
    if (!yearCreated) {
      toast.error(yearRequiredText);
      return false;
    }
    const year = Number(yearCreated);
    if (isNaN(year) || year > currentYear || year < 1000) {
      toast.error(`${validYearText} ${currentYear}.`);
      return false;
    }

    // Style - Required
    if (!artworkStyle) {
      toast.error(selectStyleText);
      return false;
    }

    // Medium - Required
    if (!medium.trim()) {
      toast.error(enterMediumText);
      return false;
    }
    if (medium.trim().length > 100) {
      toast.error(mediumMaxLengthText);
      return false;
    }

    // Dimensions - Required
    if (!height) {
      toast.error(enterHeightText);
      return false;
    }
    const h = Number(height);
    if (isNaN(h) || h <= 0 || h > 10000) {
      toast.error(heightValidText);
      return false;
    }

    if (!width) {
      toast.error(enterWidthText);
      return false;
    }
    const w = Number(width);
    if (isNaN(w) || w <= 0 || w > 10000) {
      toast.error(widthValidText);
      return false;
    }

    // Price - Essential field
    if (!price) {
      toast.error(priceRequiredText);
      return false;
    }
    const p = Number(price);
    if (isNaN(p) || p <= 0) {
      toast.error(pricePositiveText);
      return false;
    }
    if (p > 10000000) {
      toast.error(priceTooHighText);
      return false;
    }

    // Quantity - Only validate if edition requires it
    if (edition !== "Original (1 of 1)") {
      if (!quantity) {
        toast.error(quantityRequiredText);
        return false;
      }
      const q = Number(quantity);
      if (isNaN(q) || q <= 0) {
        toast.error(quantityPositiveText);
        return false;
      }
      if (q > 10000) {
        toast.error(quantityMaxText);
        return false;
      }
    }

    // Description - Required
    if (!description.trim()) {
      toast.error(descriptionRequiredText);
      return false;
    }
    if (description.length > 1000) {
      toast.error(descriptionMaxText);
      return false;
    }

    // Main image - Essential
    if (!selectedFile) {
      toast.error(uploadMainImageText);
      return false;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error(mainImageSizeText);
      return false;
    }

    // Additional images - Optional but if provided, validate
    for (let i = 0; i < additionalImages.length; i++) {
      const file = additionalImages[i];
      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error(`Additional image ${i + 1} ${additionalImageValidText}`);
          return false;
        }
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`Additional image ${i + 1} ${additionalImageSizeText}`);
          return false;
        }
      }
    }

    return true;
  };

  const isQuantityVisible = edition !== "Original (1 of 1)";

  const handleEditionChange = (value: string) => {
    setEdition(value);
    if (value === "Original (1 of 1)") {
      setQuantity("1");
    } else if (value === "Limited Edition" || value === "Open Edition") {
      // Set default quantity to 1 if not already set
      if (!quantity || quantity === "1") {
        setQuantity("1");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back button and title */}
        <div className="mt-12 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            {sellAnArtworkText}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left side - Image upload */}
          <div className="space-y-6">
            {/* Main image upload */}
            <div
              className="bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-8 h-[313px]"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <img src={previewUrl} alt="Artwork preview" className="w-full h-full object-contain rounded-lg" />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div>
                    <div className="bg-white p-4 rounded-full inline-block">
                      <CloudUpload size={30} className="text-gray-600 animate-pulse" />
                    </div>
                  </div>
                  <p className="mb-2 text-xs font-medium text-gray-900 dark:text-gray-100">{chooseFileText}</p>
                  <label
                    htmlFor="fileInput"
                    className="cursor-pointer hover:bg-white dark:hover:bg-gray-700 inline-block mb-6 border border-gray-300 dark:border-gray-600 rounded-[6px] px-2 py-1 text-[11px] text-gray-900 dark:text-gray-100"
                  >
                    {chooseFileButtonText}
                    <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <p className="relative top-10 text-[11px] text-gray-500 dark:text-gray-400">{recommendFilesText}</p>
                </div>
              )}
            </div>

            {/* Additional images */}
            <div>
              <h3 className="text-[11px] font-medium text-gray-900 dark:text-gray-100 mb-3">{addMorePicturesText}</h3>
              <div className="grid grid-cols-4 gap-4">
                {additionalImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 cursor-pointer overflow-hidden group"
                    onDragOver={handleAdditionalImageDragOver}
                    onDrop={(e) => handleAdditionalImageDrop(index, e)}
                    onClick={() => document.getElementById(`additionalFileInput-${index}`)?.click()}
                  >
                    {image ? (
                      <>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Additional ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div
                          className="absolute inset-0 bg-black bg-opacity-60 text-white text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdditionalImageChange(index, null);
                          }}
                        >
                          {removeText}
                        </div>
                      </>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    )}
                    <input
                      id={`additionalFileInput-${index}`}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleAdditionalImageChange(index, file);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xs text-gray-600 dark:text-gray-300 mb-6">{provideDetailsText}</h2>

                {/* Title and Year */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-2">{artworkTitleLabelText}</label>
                    <Input
                      placeholder={enterArtworkTitleText}
                      value={artworkTitle}
                      onChange={(e) => setArtworkTitle(e.target.value)}
                      className="h-9"
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-2">{yearCreatedLabelText}</label>
                    <Input
                      placeholder={enterYearText}
                      value={yearCreated}
                      onChange={(e) => setYearCreated(e.target.value)}
                      className="h-9"
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                </div>

                {/* Style, Medium, Size */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label htmlFor="style" className="block mb-2 text-[11px] text-gray-700 dark:text-gray-300">
                      {artworkStyleLabelText}
                    </label>
                    <Select value={artworkStyle} onValueChange={setArtworkStyle}>
                      <SelectTrigger className="w-full text-[10px] h-9">
                        <SelectValue placeholder={selectArtworkStyleText} />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-y-auto">
                        {ART_STYLES.map((style) => (
                          <SelectItem key={style} value={style.toLowerCase()} className="text-[10px]">
                            <TranslatedStyleOption styleName={style} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-2">{mediumLabelText}</label>
                    <Input
                      placeholder={enterMediumUsedText}
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="h-9"
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-2">{dimensionsLabelText}</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-9"
                        style={{ fontSize: "10px" }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">×</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="h-9"
                        style={{ fontSize: "10px" }}
                      />
                    </div>
                    <div className="flex justify-between px-6 pt-2">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{heightLabelText}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{widthLabelText}</span>
                    </div>
                  </div>
                </div>

                {/* Price, Edition, Quantity */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-2">{priceLabelText}</label>
                    <Input
                      type="number"
                      placeholder={enterPriceText}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-9"
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-2">{editionLabelText}</label>
                    <Select value={edition} onValueChange={handleEditionChange}>
                      <SelectTrigger className="w-full text-[10px] h-9">
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
                      <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-2">{quantityLabelText}</label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="h-9"
                        style={{ fontSize: "10px" }}
                        min="1"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-2">{aboutArtworkText}</label>
                  <Textarea
                    placeholder={addDescriptionText}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] h-9"
                    style={{ fontSize: "10px" }}
                  />
                </div>

                {/* Payment Account Warning */}
                {(!accounts || accounts.length === 0) && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-2">
                        <h3 className="text-[11px] font-medium text-yellow-800 dark:text-yellow-200">{paymentAccountRequiredText}</h3>
                        <div className="mt-1 text-[10px] text-yellow-700 dark:text-yellow-300">
                          <p>{setupPaymentAccountDescText}</p>
                          <button
                            onClick={() => navigate("/settings")}
                            className="mt-2 text-[11px] font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 underline"
                          >
                            {setupPaymentAccountButtonText}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="text-right">
                  <Button
                    type="submit"
                    disabled={isUploading || !accounts || accounts.length === 0}
                    className="bg-red-800 hover:bg-red-700 text-white text-xs px-8 h-8 rounded-full font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        {listingText}
                      </span>
                    ) : (
                      sellNowText
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellArtwork;
