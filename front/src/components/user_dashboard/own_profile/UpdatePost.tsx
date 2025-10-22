import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { ART_STYLES } from "@/components/user_dashboard/Explore/create_post/ArtworkStyles";
import { useFetchArtworkById } from "@/hooks/artworks/fetch_artworks/useArtworkDetails";
import useUpdateArtwork from "@/hooks/mutate/artwork/useArtworkMutate";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { validatePostData } from "@/hooks/artworks/usePostSubmission";
import { useQueryClient } from "@tanstack/react-query";

// Validation function matching SellArtwork.tsx
const validateUpdateForm = (
  title: string,
  medium: string,
  height: string,
  width: string,
  category: string,
  description: string,
  selectedFile: File | null,
  hasExistingImage: boolean,
  translatedMessages: {
    titleRequired: string;
    titleMinLength: string;
    titleMaxLength: string;
    enterMedium: string;
    mediumMaxLength: string;
    enterHeight: string;
    heightValid: string;
    enterWidth: string;
    widthValid: string;
    selectStyle: string;
    descriptionRequired: string;
    descriptionMax: string;
    uploadMainImage: string;
    mainImageSize: string;
  }
): { isValid: boolean; errorMessage?: string } => {
  // Title validation - More lenient validation
  if (!title.trim()) {
    return { isValid: false, errorMessage: translatedMessages.titleRequired };
  }
  if (title.trim().length < 2) {
    return { isValid: false, errorMessage: translatedMessages.titleMinLength };
  }
  if (title.trim().length > 100) {
    return { isValid: false, errorMessage: translatedMessages.titleMaxLength };
  }

  // Medium validation - Required
  if (!medium.trim()) {
    return { isValid: false, errorMessage: translatedMessages.enterMedium };
  }
  if (medium.trim().length > 100) {
    return { isValid: false, errorMessage: translatedMessages.mediumMaxLength };
  }

  // Dimensions validation - Required
  if (!height) {
    return { isValid: false, errorMessage: translatedMessages.enterHeight };
  }
  const h = Number(height);
  if (isNaN(h) || h <= 0 || h > 10000) {
    return { isValid: false, errorMessage: translatedMessages.heightValid };
  }

  if (!width) {
    return { isValid: false, errorMessage: translatedMessages.enterWidth };
  }
  const w = Number(width);
  if (isNaN(w) || w <= 0 || w > 10000) {
    return { isValid: false, errorMessage: translatedMessages.widthValid };
  }

  // Style validation - Required
  if (!category) {
    return { isValid: false, errorMessage: translatedMessages.selectStyle };
  }

  // Description validation - Required
  if (!description.trim()) {
    return { isValid: false, errorMessage: translatedMessages.descriptionRequired };
  }
  if (description.length > 1000) {
    return { isValid: false, errorMessage: translatedMessages.descriptionMax };
  }

  // Image validation - For updates: require either a new file OR existing image
  if (!selectedFile && !hasExistingImage) {
    return { isValid: false, errorMessage: translatedMessages.uploadMainImage };
  }
  if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
    return { isValid: false, errorMessage: translatedMessages.mainImageSize };
  }

  return { isValid: true };
};

const UpdatePost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [artworkTitle, setArtworkTitle] = useState("");
  const [artworkStyle, setArtworkStyle] = useState("");
  const [medium, setMedium] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [currentPage, setCurrentPage] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [category, setCategory] = useState("landscape");
  
  // Add dimensions for validation
  const [artworkHeight, setArtworkHeight] = useState("");
  const [artworkWidth, setArtworkWidth] = useState("");

  const { data: artwork } = useFetchArtworkById(id);
  const { mutate: updateArtwork } = useUpdateArtwork(currentPage, isActive, category, visibility);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Language and translation
  const { language } = useLanguage();
  const updatePostText = useAutoTranslation("Update Post", language);
  const artworkPreviewText = useAutoTranslation("Artwork preview", language);
  const chooseFileOrDragText = useAutoTranslation("Choose a file or drag and drop it here", language);
  const chooseFileText = useAutoTranslation("Choose File", language);
  const recommendationText = useAutoTranslation("We recommend using high quality .jpg files less than 20MB", language);
  const updateArtworkInfoText = useAutoTranslation("Update your artwork information.", language);
  const artworkTitleLabelText = useAutoTranslation("Artwork Title", language);
  const enterArtworkTitleText = useAutoTranslation("Enter artwork title", language);
  const artworkStyleLabelText = useAutoTranslation("Artwork Style", language);
  const selectArtworkStyleText = useAutoTranslation("Select artwork style", language);
  const mediumLabelText = useAutoTranslation("Medium", language);
  const enterMediumUsedText = useAutoTranslation("Enter medium used", language);
  const visibilityLabelText = useAutoTranslation("Visibility", language);
  const publicText = useAutoTranslation("Public", language);
  const privateText = useAutoTranslation("Private", language);
  const unlistedText = useAutoTranslation("Unlisted", language);
  const descriptionLabelText = useAutoTranslation("Description", language);
  const addDescriptionText = useAutoTranslation("Add a description", language);
  const updatingText = useAutoTranslation("Updating...", language);
  const updateArtworkText = useAutoTranslation("Update Artwork", language);
  
  // Validation messages
  const fileSizeErrorText = useAutoTranslation("File size must be less than 20MB", language);
  const artworkUpdatedSuccessText = useAutoTranslation("Artwork updated successfully!", language);
  const updateFailedErrorText = useAutoTranslation("Failed to update artwork.", language);
  
  // Additional validation messages matching SellArtwork
  const titleRequiredText = useAutoTranslation("Please enter an artwork title.", language);
  const titleMinLengthText = useAutoTranslation("Title should be at least 2 characters long.", language);
  const titleMaxLengthText = useAutoTranslation("Title should be less than 100 characters.", language);
  const enterMediumText = useAutoTranslation("Please enter the medium used for this artwork.", language);
  const mediumMaxLengthText = useAutoTranslation("Medium description should be less than 100 characters.", language);
  const enterHeightText = useAutoTranslation("Please enter the height of your artwork.", language);
  const heightValidText = useAutoTranslation("Height must be a positive number between 1-10000 cm.", language);
  const enterWidthText = useAutoTranslation("Please enter the width of your artwork.", language);
  const widthValidText = useAutoTranslation("Width must be a positive number between 1-10000 cm.", language);
  const selectStyleText = useAutoTranslation("Please select an artwork style.", language);
  const descriptionRequiredText = useAutoTranslation("Please enter a description for your artwork.", language);
  const descriptionMaxText = useAutoTranslation("Description cannot exceed 1000 characters.", language);
  const uploadMainImageText = useAutoTranslation("Please upload an artwork image file (JPG, PNG, etc.)", language);
  const mainImageSizeText = useAutoTranslation("Main image file size must be less than 20MB.", language);

  // Translation for fetched data
  const translatedFetchedTitle = useAutoTranslation(artwork?.title || "", language);
  const translatedFetchedMedium = useAutoTranslation(artwork?.medium || "", language);
  const translatedFetchedDescription = useAutoTranslation(artwork?.description || "", language);
  
  // Translated artwork styles for dropdown
  const translatedArtStyles = ART_STYLES.map(style => useAutoTranslation(style, language));

  // Update form fields with translated fetched data
  useEffect(() => {
    if (translatedFetchedTitle) {
      setArtworkTitle(translatedFetchedTitle);
    }
  }, [translatedFetchedTitle]);

  useEffect(() => {
    if (translatedFetchedMedium) {
      setMedium(translatedFetchedMedium);
    }
  }, [translatedFetchedMedium]);

  useEffect(() => {
    if (translatedFetchedDescription) {
      setDescription(translatedFetchedDescription);
    }
  }, [translatedFetchedDescription]);

  useEffect(() => {
    if (artwork && !loaded) {
      setArtworkTitle(artwork?.title || "");
      setArtworkStyle(artwork?.category || "");
      setMedium(artwork?.medium || "");
      setDescription(artwork?.description || "");
      setVisibility(artwork?.visibility || "Public");
      // Handle image_url - it could be a string or array
      const imageUrl = artwork?.image_url;
      if (Array.isArray(imageUrl) && imageUrl.length > 0) {
        setPreviewUrl(imageUrl[0]);
      } else if (typeof imageUrl === 'string') {
        setPreviewUrl(imageUrl);
      } else {
        setPreviewUrl(null);
      }

      // Parse dimensions from size field if available
      if (artwork?.size) {
        const sizeParts = artwork.size.split('x');
        if (sizeParts.length === 2) {
          setArtworkHeight(sizeParts[0].trim());
          setArtworkWidth(sizeParts[1].trim());
        }
      }

      if (artwork?.visibility === "Hidden") {
        setVisibility("Private");
      }

      setLoaded(true);
    }
  }, [artwork, loaded]);

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(fileSizeErrorText, {
          closeButton: true,
        });
        return;
      }

      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For updates, we should allow submission if there's either a new file OR an existing image
    const hasExistingImage = previewUrl && !selectedFile; // previewUrl exists but no new file selected
    
    // Use the same validation as SellArtwork
    const validation = validateUpdateForm(
      artworkTitle,
      medium,
      artworkHeight,
      artworkWidth,
      artworkStyle,
      description,
      selectedFile,
      hasExistingImage,
      {
        titleRequired: titleRequiredText,
        titleMinLength: titleMinLengthText,
        titleMaxLength: titleMaxLengthText,
        enterMedium: enterMediumText,
        mediumMaxLength: mediumMaxLengthText,
        enterHeight: enterHeightText,
        heightValid: heightValidText,
        enterWidth: enterWidthText,
        widthValid: widthValidText,
        selectStyle: selectStyleText,
        descriptionRequired: descriptionRequiredText,
        descriptionMax: descriptionMaxText,
        uploadMainImage: uploadMainImageText,
        mainImageSize: mainImageSizeText,
      }
    );

    if (!validation.isValid) {
      toast.error(validation.errorMessage!, { closeButton: true });
      return;
    }

    const formData = new FormData();
    formData.append("title", artworkTitle.trim());
    formData.append("category", artworkStyle);
    formData.append("medium", medium.trim());
    formData.append("description", description.trim());
    formData.append("visibility", visibility);
    
    // Add dimensions if provided
    if (artworkHeight && artworkWidth) {
      formData.append("height", artworkHeight);
      formData.append("width", artworkWidth);
      formData.append("size", `${artworkHeight}x${artworkWidth}`);
    }

    // Only append image if there's a new file selected
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    // If no new file but existing image, the backend should keep the existing image

    setIsUploading(true);

    updateArtwork(
      { id, formData },
      {
        onSuccess: () => {
          // Invalidate relevant queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["artwork", id] });
          queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
          queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
          queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
          queryClient.invalidateQueries({ queryKey: ["myWishlist"] });
          queryClient.invalidateQueries({ queryKey: ["wishlist"] });
          queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
          queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });
          
          toast.success(artworkUpdatedSuccessText, { closeButton: true });
          navigate("/explore");
        },
        onError: (error) => {
          console.error("Error during update:", error);
          toast.error(updateFailedErrorText, { closeButton: true });
        },
        onSettled: () => {
          setIsUploading(false);
        },
      }
    );
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            {updatePostText}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div
            className="bg-gray-100 rounded-lg flex flex-col items-center justify-center p-8 h-[450px]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="relative w-full h-full">
                <img src={previewUrl} alt={artworkPreviewText} className="w-full h-full object-contain" />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full px-2"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <div className="bg-white p-4 rounded-full inline-block">
                    <img width="50" height="50" src="/pics/icons8-cloud-upload.gif" alt="upload icon" />
                  </div>
                </div>
                <p className="mb-2 text-sm font-medium">{chooseFileOrDragText}</p>
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer hover:bg-white inline-block mb-6 border border-gray-300 rounded-[6px] p-2 text-xs"
                >
                  {chooseFileText}
                  <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                <p className="relative top-16 text-xs text-gray-500">
                  {recommendationText}
                </p>
              </div>
            )}
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-sm font-medium mb-8">{updateArtworkInfoText}</h2>

                <div className="mb-6">
                  <label htmlFor="title" className="block mb-2 text-xs font-medium">
                    {artworkTitleLabelText}
                  </label>
                  <Input
                    id="title"
                    placeholder={enterArtworkTitleText}
                    value={artworkTitle}
                    onChange={(e) => setArtworkTitle(e.target.value)}
                    className="w-full"
                    style={{ fontSize: "12px", height: "35px" }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label htmlFor="style" className="block mb-4 text-xs">
                      {artworkStyleLabelText}
                    </label>
                    <Select value={artworkStyle} onValueChange={setArtworkStyle}>
                      <SelectTrigger className="w-full text-xs h-[35px]">
                        <SelectValue placeholder={selectArtworkStyleText} />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-y-auto">
                        {translatedArtStyles.map((style, index) => (
                          <SelectItem key={ART_STYLES[index]} value={ART_STYLES[index].toLowerCase()} className="text-xs">
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="medium" className="block mb-4 text-xs">
                      {mediumLabelText}
                    </label>
                    <Input
                      id="medium"
                      placeholder={enterMediumUsedText}
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full -py-2"
                      style={{ fontSize: "12px", height: "35px" }}
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="dimensions" className="block mb-4 text-xs">
                      {useAutoTranslation("Dimensions (cm)", language)}
                    </label>
                    <div className="grid grid-cols-3">
                      <div className="flex flex-col">
                        <Input
                          type="number"
                          placeholder="0"
                          style={{ fontSize: "10px", marginBottom: "5px", height: "80%" }}
                          min={0}
                          value={artworkHeight}
                          onChange={(e) => setArtworkHeight(e.target.value)}
                        />
                        <label className="text-[9px] text-center mb-1">{useAutoTranslation("Height", language)}</label>
                      </div>
                      <span className="h-5 w-5 font-bold text-sm flex items-center justify-center mx-auto mt-2">x</span>
                      <div className="flex flex-col">
                        <Input
                          type="number"
                          placeholder="0"
                          style={{ fontSize: "10px", marginBottom: "5px", height: "80%" }}
                          min={0}
                          value={artworkWidth}
                          onChange={(e) => setArtworkWidth(e.target.value)}
                        />
                        <label className="text-[9px] text-center mb-1">{useAutoTranslation("Width", language)}</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="visibility" className="block mb-4 text-xs">
                    {visibilityLabelText}
                  </label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger className="w-full text-xs h-[35px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public" className="text-xs">
                        {publicText}
                      </SelectItem>
                      <SelectItem value="Private" className="text-xs">
                        {privateText}
                      </SelectItem>
                      <SelectItem value="Unlisted" className="text-xs">
                        {unlistedText}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block mb-2 text-xs font-medium">
                    {descriptionLabelText}
                  </label>
                  <Textarea
                    id="description"
                    placeholder={addDescriptionText}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[120px] p-2 text-xs"
                  />
                </div>

                <div className="text-right">
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className={`${
                      isUploading ? "bg-red-800 cursor-not-allowed" : "bg-red-800 hover:bg-red-700"
                    } text-white px-6 py-2 text-xs rounded-full transition duration-200`}
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        {updatingText}
                      </span>
                    ) : (
                      updateArtworkText
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

export default UpdatePost;
