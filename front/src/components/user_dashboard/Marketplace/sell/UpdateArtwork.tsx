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
  quantity: string;
  mainImageUrl: string;
  additionalImagesUrls?: string[];
}

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
    artworkData?.additionalImagesUrls?.length ? artworkData.additionalImagesUrls : [null, null, null, null]
  );
  const [price, setPrice] = useState(artworkData?.price || "");
  const [edition, setEdition] = useState(artworkData?.edition || "Original (1 of 1)");
  const [quantity, setQuantity] = useState(artworkData?.quantity || "1");
  const [height, setHeight] = useState(artworkData?.height || "");
  const [width, setWidth] = useState(artworkData?.width || "");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (edition === "Original (1 of 1)") setQuantity("1");
  }, [edition]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
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
    if (!artworkTitle.trim()) return toast.error("Please enter an artwork title");
    if (!price) return toast.error("Please enter a price");

    setIsUploading(true);
    toast.loading("Updating artwork...", { id: "upload" });

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
        quantity,
        mainImage: selectedFile,
        additionalImages: additionalImages.filter((img): img is File => img instanceof File),
        removeExistingImages: true,
      });

      toast.success("Artwork updated successfully!", { id: "upload" });
      navigate("/marketplace");
    } catch (error) {
      toast.error("Failed to update artwork", { id: "upload" });
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
      try {
        await apiClient.delete(`/art/${artworkData.id}/images/${index}/`);
        toast.success("Image removed successfully");

        const newImages = [...additionalImages];
        newImages[index] = null;
        setAdditionalImages(newImages);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to delete image");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mt-12 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            Update Artwork
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
                <div className="text-center text-[11px] text-gray-500">Upload the main artwork image</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {previewUrl && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                >
                  ×
                </button>
              )}
            </div>

            {/* Additional Images */}

            <div>
              <h3 className="text-[11px] font-medium text-gray-900 mb-3">Add more pictures (Optional)</h3>
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
                          Remove
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
                <h2 className="text-xs text-gray-600 mb-6">Edit artwork details.</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">Artwork Title</label>
                    <Input
                      value={artworkTitle}
                      onChange={(e) => setArtworkTitle(e.target.value)}
                      className="h-9 text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">Year Created</label>
                    <Input
                      value={yearCreated}
                      onChange={(e) => setYearCreated(e.target.value)}
                      className="h-9 text-[10px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">Style</label>
                    <Select value={artworkStyle} onValueChange={setArtworkStyle}>
                      <SelectTrigger className="w-full text-[10px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ART_STYLES.map((style) => (
                          <SelectItem key={style} value={style.toLowerCase()} className="text-[10px]">
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">Medium</label>
                    <Input value={medium} onChange={(e) => setMedium(e.target.value)} className="h-9 text-[10px]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                    <div className="flex items-center space-x-2">
                      <Input value={height} onChange={(e) => setHeight(e.target.value)} className="h-9 text-[10px]" />
                      <span className="text-sm font-medium">×</span>
                      <Input value={width} onChange={(e) => setWidth(e.target.value)} className="h-9 text-[10px]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">Price</label>
                    <Input value={price} onChange={(e) => setPrice(e.target.value)} className="h-9 text-[10px]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-2">Edition</label>
                    <Select value={edition} onValueChange={handleEditionChange}>
                      <SelectTrigger className="w-full h-9 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Original (1 of 1)" className="text-[10px]">
                          Original (1 of 1)
                        </SelectItem>
                        <SelectItem value="Limited Edition" className="text-[10px]">
                          Limited Edition
                        </SelectItem>
                        <SelectItem value="Open Edition" className="text-[10px]">
                          Open Edition
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isQuantityVisible && (
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-2">Quantity</label>
                      <Input
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="h-9 text-[10px]"
                        min={1}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <label className="block text-[11px] font-medium text-gray-700 mb-2">Description</label>
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
                    {isUploading ? "Updating..." : "Update Artwork"}
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
