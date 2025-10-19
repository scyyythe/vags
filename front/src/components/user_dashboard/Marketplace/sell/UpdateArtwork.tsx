import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ART_STYLES } from "@/components/user_dashboard/Explore/create_post/ArtworkStyles";
import Header from "@/components/user_dashboard/navbar/Header";
import useUpdateArtwork from "@/hooks/artworks/sell/useUpdateArtwork";
import { useParams, useLocation } from "react-router-dom";
import apiClient from "@/utils/apiClient";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
interface ArtworkUpdateState {
  id: string;
  title: string;
  year_created: string;
  style: string;
  medium: string;
  height: string;
  width: string;
  description: string;
  price: string;
  edition: string;
  quantity: number;
  mainImageUrl: string;
  additionalImagesUrls?: string[];
}

// Helper component for translating style names in SelectItems
const TranslatedStyleOption: React.FC<{ styleName: string }> = ({ styleName }) => {
  const { language } = useLanguage();
  const translatedStyle = useAutoTranslation(styleName, language);
  return <>{translatedStyle}</>;
};

const UpdateArtwork = () => {
  const navigate = useNavigate();

  const { id: artworkId } = useParams();
  const location = useLocation();
  const artworkData = location.state as ArtworkUpdateState;
  const { updateArtwork } = useUpdateArtwork();

  const [artworkTitle, setArtworkTitle] = useState(artworkData?.title || "");
  const [yearCreated, setYearCreated] = useState(artworkData?.year_created || "");
  const [artworkStyle, setArtworkStyle] = useState(artworkData?.style || "");
  const [medium, setMedium] = useState(artworkData?.medium || "");
  const [description, setDescription] = useState(artworkData?.description || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(artworkData?.mainImageUrl || null);
  const [additionalImages, setAdditionalImages] = useState<(File | string | null)[]>(
    artworkData?.additionalImagesUrls?.length
      ? [...artworkData.additionalImagesUrls, ...Array(4 - artworkData.additionalImagesUrls.length).fill(null)]
      : [null, null, null, null]
  );
  const [price, setPrice] = useState(artworkData?.price || "");
  const [edition, setEdition] = useState(artworkData?.edition || "Original (1 of 1)");
  const [quantity, setQuantity] = useState(artworkData?.quantity || "1");
  const [height, setHeight] = useState(artworkData?.height || "");
  const [width, setWidth] = useState(artworkData?.width || "");
  const [isUploading, setIsUploading] = useState(false);

  // Language and translation
  const { language } = useLanguage();
  
  // Translate fetched artwork data (only fields that don't need exact value matching)
  const translatedFetchedTitle = useAutoTranslation(artworkData?.title || "", language);
  const translatedFetchedMedium = useAutoTranslation(artworkData?.medium || "", language);
  const translatedFetchedDescription = useAutoTranslation(artworkData?.description || "", language);
  
  // UI text translations
  const updateArtworkText = useAutoTranslation("Update Artwork", language);
  const uploadMainImageText = useAutoTranslation("Upload the main artwork image", language);
  const addMorePicturesText = useAutoTranslation("Add more pictures (Optional)", language);
  const removeText = useAutoTranslation("Remove", language);
  const editArtworkDetailsText = useAutoTranslation("Edit artwork details.", language);
  const artworkTitleText = useAutoTranslation("Artwork Title", language);
  const yearCreatedText = useAutoTranslation("Year Created", language);
  const styleText = useAutoTranslation("Style", language);
  const mediumText = useAutoTranslation("Medium", language);
  const dimensionsText = useAutoTranslation("Dimensions (cm)", language);
  const priceText = useAutoTranslation("Price", language);
  const editionText = useAutoTranslation("Edition", language);
  const quantityText = useAutoTranslation("Quantity", language);
  const descriptionText = useAutoTranslation("Description", language);
  const updatingText = useAutoTranslation("Updating...", language);
  const updatingArtworkText = useAutoTranslation("Updating artwork...", language);
  const artworkUpdatedSuccessText = useAutoTranslation("Artwork updated successfully!", language);
  const failedToUpdateText = useAutoTranslation("Failed to update artwork", language);
  const imageRemovedText = useAutoTranslation("Image removed successfully", language);
  const failedToDeleteImageText = useAutoTranslation("Failed to delete image", language);
  
  // Edition options translations
  const originalEditionText = useAutoTranslation("Original (1 of 1)", language);
  const limitedEditionText = useAutoTranslation("Limited Edition", language);
  const openEditionText = useAutoTranslation("Open Edition", language);
  
  // Validation messages
  const titleValidationText = useAutoTranslation("Title must start with a capital letter and be 3-100 characters.", language);
  const yearValidationText = useAutoTranslation("Year must be a valid number not in the future", language);
  const artworkStyleRequiredText = useAutoTranslation("Artwork style is required.", language);
  const mediumValidationText = useAutoTranslation("Medium must be proper name(s), start with a capital letter, letters only.", language);
  const dimensionsValidationText = useAutoTranslation("Dimensions must be positive numbers ≤ 1000 cm.", language);
  const priceValidationText = useAutoTranslation("Price must be a valid number up to 10 digits.", language);
  const quantityValidationText = useAutoTranslation("Quantity must be a positive number ≤ 1000.", language);
  const descriptionValidationText = useAutoTranslation("Description must be less than 500 characters.", language);
  const uploadMainImageValidationText = useAutoTranslation("Please upload a main artwork image.", language);
  const mainImageSizeText = useAutoTranslation("Main image must be ≤ 20MB.", language);
  const additionalImageMustBeImageText = useAutoTranslation("Additional image", language);
  const mustBeImageFileText = useAutoTranslation("must be an image file.", language);
  const mustBeLess20MBText = useAutoTranslation("must be ≤ 20MB.", language);
  const enterArtworkTitleText = useAutoTranslation("Please enter an artwork title", language);
  const enterPriceText = useAutoTranslation("Please enter a price", language);
  const fileSizeLimitText = useAutoTranslation("File size must be less than 20MB", language);

  const validateForm = (): boolean => {
    const titleRegex = /^[A-Z][A-Za-z0-9\s.,'-]{2,99}$/; // Proper title
    const mediumRegex = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/; // Proper medium names
    const currentYear = new Date().getFullYear();

    // Title
    if (!artworkTitle.trim() || !titleRegex.test(artworkTitle.trim())) {
      toast.error(titleValidationText);
      return false;
    }

    // Year
    const year = Number(yearCreated);
    if (!yearCreated || isNaN(year) || year > currentYear || year < 1000) {
      toast.error(`${yearValidationText} (≤ ${currentYear}).`);
      return false;
    }

    // Style
    if (!artworkStyle) {
      toast.error(artworkStyleRequiredText);
      return false;
    }

    // Medium
    if (!medium.trim() || !mediumRegex.test(medium.trim())) {
      toast.error(mediumValidationText);
      return false;
    }

    // Dimensions
    const h = Number(height);
    const w = Number(width);
    if ((height && (isNaN(h) || h <= 0 || h > 1000)) || (width && (isNaN(w) || w <= 0 || w > 1000))) {
      toast.error(dimensionsValidationText);
      return false;
    }

    // Price
    const p = Number(price);
    if (!price || isNaN(p) || p <= 0 || price.length > 10) {
      toast.error(priceValidationText);
      return false;
    }

    // Quantity
    if (edition !== "Original (1 of 1)") {
      const q = Number(quantity);
      if (!quantity || isNaN(q) || q <= 0 || q > 1000) {
        toast.error(quantityValidationText);
        return false;
      }
    }

    // Description
    if (description && description.length > 500) {
      toast.error(descriptionValidationText);
      return false;
    }

    // Main image
    if (!selectedFile && !previewUrl) {
      toast.error(uploadMainImageValidationText);
      return false;
    }
    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
      toast.error(mainImageSizeText);
      return false;
    }

    // Additional images
    for (let i = 0; i < additionalImages.length; i++) {
      const file = additionalImages[i];
      if (file instanceof File) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${additionalImageMustBeImageText} ${i + 1} ${mustBeImageFileText}`);
          return false;
        }
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${additionalImageMustBeImageText} ${i + 1} ${mustBeLess20MBText}`);
          return false;
        }
      }
    }

    return true;
  };

  useEffect(() => {
    if (edition === "Original (1 of 1)") setQuantity("1");
  }, [edition]);

  // Update form fields with translated values when they're ready
  useEffect(() => {
    if (translatedFetchedTitle && artworkData?.title) {
      setArtworkTitle(translatedFetchedTitle);
    }
  }, [translatedFetchedTitle, artworkData?.title]);

  useEffect(() => {
    if (translatedFetchedMedium && artworkData?.medium) {
      setMedium(translatedFetchedMedium);
    }
  }, [translatedFetchedMedium, artworkData?.medium]);

  useEffect(() => {
    if (translatedFetchedDescription && artworkData?.description) {
      setDescription(translatedFetchedDescription);
    }
  }, [translatedFetchedDescription, artworkData?.description]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error(fileSizeLimitText);
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAdditionalImageChange = (index: number, file: File | null) => {
    const newImages = [...additionalImages];
    newImages[index] = file;
    setAdditionalImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!artworkTitle.trim()) return toast.error(enterArtworkTitleText);
    if (!price) return toast.error(enterPriceText);

    setIsUploading(true);
    toast.loading(updatingArtworkText, { id: "upload" });

    try {
      const size = height && width ? `${height}x${width}` : "";

      await updateArtwork(artworkData.id, {
        title: artworkTitle,
        year_created: yearCreated,
        style: artworkStyle,
        medium,
        height,
        width,
        description,
        price,
        edition,
        quantity: String(quantity),
        mainImage: selectedFile,
        additionalImages: additionalImages.filter((img): img is File => img instanceof File),
        removeExistingImages: false, // Don't remove existing images, just add new ones
      });

      toast.success(artworkUpdatedSuccessText, { id: "upload" });
      navigate("/marketplace");
    } catch (error) {
      toast.error(failedToUpdateText, { id: "upload" });
    } finally {
      setIsUploading(false);
    }
  };

  const isQuantityVisible = edition !== "Original (1 of 1)";
  const handleEditionChange = (value: string) => {
    setEdition(value);
    if (value === "Original (1 of 1)") setQuantity("1");
  };
  const handleRemoveAdditionalImage = async (index: number, isMain = false) => {
    if (isMain) {
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      const imageToRemove = additionalImages[index];

      if (typeof imageToRemove === "string") {
        // It's an existing URL - need to delete from backend
        try {
          // Find the actual index in the backend (accounting for main image at index 0)
          const backendIndex = index + 1; // Additional images start at index 1
          await apiClient.delete(`/art/${artworkData.id}/images/${backendIndex}/`);
          toast.success(imageRemovedText);
        } catch (err: any) {
          toast.error(err.response?.data?.error || failedToDeleteImageText);
          return;
        }
      }

      // Update local state
      const newImages = [...additionalImages];
      newImages[index] = null;
      setAdditionalImages(newImages);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mt-12 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            {updateArtworkText}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left side - Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4 h-[320px] relative">
              {previewUrl ? (
                <img src={previewUrl} alt="Main artwork" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center text-[11px] text-gray-500">{uploadMainImageText}</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title=""
              />
              {previewUrl && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full px-1 shadow-md hover:bg-gray-100"
                >
                  ×
                </button>
              )}
            </div>

            {/* Additional Images */}

            <div>
              <h3 className="text-[11px] font-medium text-gray-900 mb-3">{addMorePicturesText}</h3>
              <div className="grid grid-cols-4 gap-4">
                {additionalImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 cursor-pointer overflow-hidden group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files[0]) handleAdditionalImageChange(idx, e.dataTransfer.files[0]);
                    }}
                    onClick={() => document.getElementById(`additionalFileInput-${idx}`)?.click()}
                  >
                    {img ? (
                      <>
                        <img
                          src={typeof img === "string" ? img : URL.createObjectURL(img)}
                          alt={`Additional ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div
                          className="absolute inset-0 bg-black bg-opacity-60 text-white text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAdditionalImage(idx);
                          }}
                        >
                          {removeText}
                        </div>
                      </>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    )}
                    <input
                      id={`additionalFileInput-${idx}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      title=""
                      onChange={(e) => handleAdditionalImageChange(idx, e.target.files?.[0] || null)}
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
                <h2 className="text-xs text-gray-600 mb-6">{editArtworkDetailsText}</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">{artworkTitleText}</label>
                    <Input
                      value={artworkTitle}
                      onChange={(e) => setArtworkTitle(e.target.value)}
                      className="h-9"
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">{yearCreatedText}</label>
                    <Input
                      value={yearCreated}
                      onChange={(e) => setYearCreated(e.target.value)}
                      className="h-9"
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">{styleText}</label>
                    <Select value={artworkStyle} onValueChange={setArtworkStyle}>
                      <SelectTrigger className="w-full text-[10px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ART_STYLES.map((style) => (
                          <SelectItem key={style} value={style.toLowerCase()} className="text-[10px]">
                            <TranslatedStyleOption styleName={style} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">{mediumText}</label>
                    <Input value={medium} onChange={(e) => setMedium(e.target.value)} className="h-9" style={{ fontSize: "10px" }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">{dimensionsText}</label>
                    <div className="flex items-center space-x-2">
                      <Input value={height} onChange={(e) => setHeight(e.target.value)} className="h-9" style={{ fontSize: "10px" }} />
                      <span className="text-sm font-medium">×</span>
                      <Input value={width} onChange={(e) => setWidth(e.target.value)} className="h-9" style={{ fontSize: "10px" }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">{priceText}</label>
                    <Input value={price} onChange={(e) => setPrice(e.target.value)} className="h-9" style={{ fontSize: "10px" }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">{editionText}</label>
                    <Select value={edition} onValueChange={handleEditionChange}>
                      <SelectTrigger className="w-full h-9 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Original (1 of 1)" className="text-[10px]">
                          {originalEditionText}
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
                      <label className="block text-[11px] font-medium text-gray-700 mb-2">{quantityText}</label>
                      <Input
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="h-9" 
                        style={{ fontSize: "10px" }}
                        min={1}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <label className="block text-[11px] font-medium text-gray-700 mb-2">{descriptionText}</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] text-[10px]"
                  />
                </div>

                <div className="text-right">
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="bg-red-800 hover:bg-red-700 text-white text-xs px-8 h-8 rounded-full font-medium"
                  >
                    {isUploading ? updatingText : updateArtworkText}
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

export default UpdateArtwork;
