import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import Header from "@/components/user_dashboard/navbar/Header";
import { ART_STYLES } from "@/components/user_dashboard/Explore/create_post/ArtworkStyles";
import useSellArtwork from "@/hooks/artworks/sell/useSellArtwork";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be less than 20MB");
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
        toast.error("File size must be less than 20MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload only image files");
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
        toast.error("File size must be less than 20MB");
        return;
      }
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!artworkTitle.trim()) {
      toast.error("Please enter an artwork title");
      return;
    }

    if (!selectedFile) {
      toast.error("Please upload an artwork image");
      return;
    }

    if (!price) {
      toast.error("Please enter a price");
      return;
    }

    setIsUploading(true);
    toast.loading("Listing artwork for sale...", { id: "upload" });

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
      toast.success("Artwork listed successfully!", { id: "upload" });
      navigate("/marketplace");
    } catch (error) {
      toast.error("Failed to list artwork", { id: "upload" });
    } finally {
      setIsUploading(false);
    }
  };

  const artworkStyles = [
    "Abstract", "Realism", "Impressionism", "Modern", "Contemporary", 
    "Pop Art", "Surrealism", "Minimalism", "Expressionism", "Cubism"
  ];

  const isQuantityVisible = edition !== 'Original (1 of 1)';

  const handleEditionChange = (value: string) => {
    setEdition(value);
    if (value === 'Original (1 of 1)') {
      setQuantity('1');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back button and title */}
        <div className="mt-12 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            Sell an Artwork
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left side - Image upload */}
          <div className="space-y-6">
            {/* Main image upload */}
            <div
              className="bg-gray-100 rounded-lg flex flex-col items-center justify-center p-8 h-[313px]"
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
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center">
                    <div>
                        <div className="bg-white p-4 rounded-full inline-block">
                            <img
                            width="30"
                            height="30"
                            src="./pics/icons8-cloud-upload.gif"
                            alt="external-upload-network-and-cloud-computing-flatart-icons-solid-flatarticons"
                            />
                        </div>
                    </div>
                    <p className="mb-2 text-xs font-medium">Choose a file or drag and drop it here</p>
                    <label
                        htmlFor="fileInput"
                        className="cursor-pointer hover:bg-white inline-block mb-6 border border-gray-300 rounded-[6px] px-2 py-1 text-[11px]"
                    >
                        Choose File
                        <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <p className="relative top-10 text-[11px] text-gray-500">
                        We recommend using high quality .jpg files less than 20MB
                    </p>
                </div>
              )}
            </div>

            {/* Additional images */}
            <div>
              <h3 className="text-[11px] font-medium text-gray-900 mb-3">Add more pictures (Optional)</h3>
              <div className="grid grid-cols-4 gap-4">
                {additionalImages.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 cursor-pointer overflow-hidden group"
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
                          Remove
                        </div>
                      </>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                <h2 className="text-xs text-gray-600 mb-6">Provide artwork details.</h2>

                {/* Title and Year */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">
                      Artwork Title
                    </label>
                    <Input
                      placeholder="Enter artwork title"
                      value={artworkTitle}
                      onChange={(e) => setArtworkTitle(e.target.value)}
                      className="h-9"
                      style={{fontSize:"10px"}}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">
                      Year Created
                    </label>
                    <Input
                      placeholder="Enter year"
                      value={yearCreated}
                      onChange={(e) => setYearCreated(e.target.value)}
                      className="h-9"
                      style={{fontSize:"10px"}}
                    />
                  </div>
                </div>

                {/* Style, Medium, Size */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                        <label htmlFor="style" className="block mb-2 text-[11px]">
                        Artwork Style
                        </label>
                        <div className="relative">
                        <select
                            id="style"
                            value={artworkStyle}
                            onChange={(e) => setArtworkStyle(e.target.value)}
                            className="w-full h-9 p-2 border border-gray-300 rounded-md appearance-none pr-8 text-xs cursor-pointer"
                            style={{fontSize:"10px"}}
                        >
                            <option value="" disabled>
                            Select artwork style
                            </option>
                            {ART_STYLES.map((style) => (
                            <option key={style} value={style.toLowerCase()}>
                                {style}
                            </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M4 6L8 10L12 6"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            </svg>
                        </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-2">
                            Medium
                        </label>
                        <Input
                            placeholder="Enter medium used"
                            value={medium}
                            onChange={(e) => setMedium(e.target.value)}
                            className="h-9"
                            style={{fontSize:"10px"}}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-2">
                        Artwork Size
                        </label>
                        <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            placeholder="0"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="h-9"
                            style={{fontSize:"10px"}}
                        />
                        <span className="text-sm font-medium">×</span>
                        <Input
                            type="number"
                            placeholder="0"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            className="h-9"
                            style={{fontSize:"10px"}}
                        />
                        </div>
                        <div className="flex justify-between px-6 pt-2">
                            <span className="text-[10px] text-gray-500">Height</span>
                            <span className="text-[10px] text-gray-500">Width</span>
                        </div>
                    </div>
                </div>

                {/* Price, Edition, Quantity */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter price for artwork"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-9"
                      style={{fontSize:"10px"}}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">
                      Edition
                    </label>
                    <Select
                      value={edition}
                      onValueChange={handleEditionChange}
                    >
                      <SelectTrigger className="w-full text-[10px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Original (1 of 1)" className="text-[10px]">Original (1 of 1)</SelectItem>
                        <SelectItem value="Limited Edition" className="text-[10px]">Limited Edition</SelectItem>
                        <SelectItem value="Open Edition" className="text-[10px]">Open Edition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isQuantityVisible && (
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="h-9"
                        style={{fontSize:"10px"}}
                        min="1"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <label className="block text-[11px] font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    placeholder="Add a description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] h-9"
                    style={{fontSize:"10px"}}
                  />
                </div>

                {/* Submit button */}
                <div className="text-right">
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="bg-red-800 hover:bg-red-700 text-white text-xs px-8 h-8 rounded-full font-medium"
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
                        Listing...
                      </span>
                    ) : (
                      "Sell Now"
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
