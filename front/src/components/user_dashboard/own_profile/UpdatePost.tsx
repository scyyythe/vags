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

const UpdatePost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [artworkTitle, setArtworkTitle] = useState("");

  const [medium, setMedium] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [currentPage, setCurrentPage] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [category, setCategory] = useState("landscape");

  const { data: artwork } = useFetchArtworkById(id);
  const { mutate: updateArtwork } = useUpdateArtwork(currentPage, isActive, category, visibility);
  const [artworkStyle, setArtworkStyle] = useState(artwork?.style || "");

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
  const enterArtworkTitleErrorText = useAutoTranslation("Please enter an artwork title", language);
  const titleInvalidErrorText = useAutoTranslation("Artwork title invalid. Must start with a capital letter", language);
  const selectStyleErrorText = useAutoTranslation("Please select an artwork style", language);
  const enterMediumErrorText = useAutoTranslation("Please enter the medium used", language);
  const mediumInvalidErrorText = useAutoTranslation("Medium invalid. Must contain letters only", language);
  const fileSizeErrorText = useAutoTranslation("File size must be less than 20MB", language);
  const artworkUpdatedSuccessText = useAutoTranslation("Artwork updated successfully!", language);
  const updateFailedErrorText = useAutoTranslation("Failed to update artwork.", language);

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
      setPreviewUrl(artwork?.image_url || null);

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

    // Artwork title validation: first letter capital, letters/numbers allowed
    const titleRegex = /^[A-Z][A-Za-z0-9\s]*$/;
    if (!artworkTitle.trim()) {
      toast.error(enterArtworkTitleErrorText, { closeButton: true });
      return;
    }
    if (!titleRegex.test(artworkTitle)) {
      toast.error(titleInvalidErrorText, { closeButton: true });
      return;
    }

    // Artwork style validation
    if (!artworkStyle) {
      toast.error(selectStyleErrorText, { closeButton: true });
      return;
    }

    // Medium validation: letters and spaces only
    const mediumRegex = /^[A-Za-z\s]+$/;
    if (!medium.trim()) {
      toast.error(enterMediumErrorText, { closeButton: true });
      return;
    }
    if (!mediumRegex.test(medium)) {
      toast.error(mediumInvalidErrorText, { closeButton: true });
      return;
    }

    // Optional file validation
    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
      toast.error(fileSizeErrorText, { closeButton: true });
      return;
    }

    const formData = new FormData();
    formData.append("title", artworkTitle.trim());
    formData.append("category", artworkStyle);
    formData.append("medium", medium.trim());
    formData.append("description", description.trim());
    formData.append("visibility", visibility);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    setIsUploading(true);

    updateArtwork(
      { id, formData },
      {
        onSuccess: () => {
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label htmlFor="style" className="block mb-2 text-xs font-medium">
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
                    <label htmlFor="medium" className="block mb-2 text-xs font-medium">
                      {mediumLabelText}
                    </label>
                    <Input
                      id="medium"
                      placeholder={enterMediumUsedText}
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full"
                      style={{ fontSize: "12px", height: "35px" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="visibility" className="block mb-2 text-xs font-medium">
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
