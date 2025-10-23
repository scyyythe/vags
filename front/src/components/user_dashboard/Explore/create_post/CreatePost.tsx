import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { ART_STYLES } from "@/components/user_dashboard/Explore/create_post/ArtworkStyles";
import { useQueryClient } from "@tanstack/react-query";
import { validatePostData, submitPost, PostSubmissionData } from "@/hooks/artworks/usePostSubmission";
import { useOptimizedPostSubmission } from "@/hooks/artworks/useOptimizedPostSubmission";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
const CreatePost = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [artworkTitle, setArtworkTitle] = useState("");
  const [artworkStyle, setArtworkStyle] = useState("");
  const [medium, setMedium] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [refreshData, setRefreshData] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [artStatus, setArtStatus] = useState("Active");
  const [price, setPrice] = useState(0);
  const [visibility, setVisibility] = useState("Public");

  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [artworkHeight, setArtworkHeight] = useState("");
  const [artworkWidth, setArtworkWidth] = useState("");

  const queryClient = useQueryClient();

  // Use optimized upload hook
  const { submitPost: submitPostOptimized, isUploading: isUploadingOptimized } = useOptimizedPostSubmission();

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Translations for UI texts
  const createPostText = useAutoTranslation("Create Post", language);
  const provideArtworkDetailsText = useAutoTranslation("Provide artwork details.", language);
  const artworkTitleText = useAutoTranslation("Artwork Title", language);
  const enterArtworkTitleText = useAutoTranslation("Enter artwork title", language);
  const artworkStyleText = useAutoTranslation("Artwork Style", language);
  const selectArtworkStyleText = useAutoTranslation("Select artwork style", language);
  const mediumText = useAutoTranslation("Medium", language);
  const enterMediumUsedText = useAutoTranslation("Enter medium used", language);
  const dimensionsText = useAutoTranslation("Dimensions (cm)", language);
  const heightText = useAutoTranslation("Height", language);
  const widthText = useAutoTranslation("Width", language);
  const aboutThisArtworkText = useAutoTranslation("About this Artwork", language);
  const addADescriptionText = useAutoTranslation("Add a description", language);
  const postArtworkText = useAutoTranslation("Post Artwork", language);
  const uploadingText = useAutoTranslation("Uploading...", language);
  const chooseAFileOrDragAndDropItHereText = useAutoTranslation("Choose a file or drag and drop it here", language);
  const chooseFileText = useAutoTranslation("Choose File", language);
  const weRecommendUsingHighQualityJpgFilesLessThan20MBText = useAutoTranslation("We recommend using high quality .jpg files less than 20MB", language);
  const artworkPreviewText = useAutoTranslation("Artwork preview", language);
  
  // Validation messages
  const fileSizeErrorText = useAutoTranslation("File size must be less than 20MB", language);
  const uploadFailedText = useAutoTranslation("Upload failed:", language);

  // Translated artwork styles
  const translatedArtStyles = ART_STYLES.map(style => useAutoTranslation(style, language));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(fileSizeErrorText, { closeButton: true });
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error(fileSizeErrorText, { closeButton: true });
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

    const size = `${artworkHeight} x ${artworkWidth}`;
    
    // Capitalize the artwork title
    const capitalizedTitle = capitalizeFirstLetter(artworkTitle.trim());

    // Validate form data using the separated validation logic
    const validation = validatePostData({
      title: capitalizedTitle,
      medium,
      artworkHeight,
      artworkWidth,
      category: artworkStyle,
      description,
      selectedFile,
    });

    if (!validation.isValid) {
      toast.error(validation.errorMessage!, { closeButton: true });
      return;
    }

    // Prepare submission data for optimized upload
    const submissionData = {
      title: capitalizedTitle,
      category: artworkStyle,
      medium,
      artStatus,
      size,
      price,
      description,
      visibility,
      selectedFile: selectedFile!,
    };

    try {
      await submitPostOptimized(submissionData, queryClient);

      // Reset form on success
      setSelectedFile(null);
      setPreviewUrl(null);
      navigate("/explore");
    } catch (error: unknown) {
      // Error handling is done in the hook
      console.error(uploadFailedText, error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            {createPostText}
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
                    <img
                      width="50"
                      height="50"
                      src="./pics/icons8-cloud-upload.gif"
                      alt="external-upload-network-and-cloud-computing-flatart-icons-solid-flatarticons"
                    />
                  </div>
                </div>
                <p className="mb-2 text-sm font-medium">{chooseAFileOrDragAndDropItHereText}</p>
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer hover:bg-white inline-block mb-6 border border-gray-300 rounded-[6px] p-2 text-xs"
                >
                  {chooseFileText}
                  <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                <p className="relative top-16 text-xs text-gray-500">
                  {weRecommendUsingHighQualityJpgFilesLessThan20MBText}
                </p>
              </div>
            )}
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-sm font-medium mb-8">{provideArtworkDetailsText}</h2>

                <div className="mb-6">
                  <label htmlFor="title" className="block mb-4 text-xs">
                    {artworkTitleText}
                  </label>
                  <Input
                    id="title"
                    placeholder={enterArtworkTitleText}
                    value={artworkTitle}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only capitalize if the user is typing at the beginning or if it's a new word after a space
                      if (value.length === 1 || (value.length > 1 && value[value.length - 2] === ' ')) {
                        setArtworkTitle(capitalizeFirstLetter(value));
                      } else {
                        setArtworkTitle(value);
                      }
                    }}
                    className="w-full"
                    style={{ fontSize: "12px", height: "35px" }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label htmlFor="style" className="block mb-4 text-xs">
                      {artworkStyleText}
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
                      {mediumText}
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
                    <label htmlFor="medium" className="block mb-4 text-xs">
                      {dimensionsText}
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
                        <label className="text-[9px] text-center mb-1">{heightText}</label>
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
                        <label className="text-[9px] text-center mb-1">{widthText}</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block mb-4 text-xs">
                    {aboutThisArtworkText}
                  </label>
                  <Textarea
                    id="description"
                    placeholder={addADescriptionText}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[120px] p-1 text-xs"
                  />
                </div>

                <div className="text-right">
                  <Button
                    type="submit"
                    disabled={isUploadingOptimized}
                    className={`${
                      isUploadingOptimized ? "bg-red-800 cursor-not-allowed" : "bg-red-800 hover:bg-red-700"
                    } text-white px-6 py-1 text-xs rounded-full transition duration-200`}
                  >
                    {isUploadingOptimized ? (
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
                        {uploadingText}
                      </span>
                    ) : (
                      postArtworkText
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

export default CreatePost;