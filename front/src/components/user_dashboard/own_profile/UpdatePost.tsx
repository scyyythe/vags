import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { ART_STYLES } from "@/components/user_dashboard/Explore/create_post/ArtworkStyles";
import apiClient from "@/utils/apiClient";
import axios from "axios";

const UpdatePost = () => {
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
  const [visibility, setVisibility] = useState("public");

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
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!artworkTitle) {
      toast.error("Please enter an artwork title");
      return;
    }
    if (!selectedFile) {
      toast.error("Please upload an artwork image");
      return;
    }

    const formData = new FormData();
    formData.append("title", artworkTitle);
    formData.append("category", artworkStyle);
    formData.append("medium", medium);
    formData.append("art_status", artStatus);
    formData.append("price", price.toString());
    formData.append("description", description || "");
    formData.append("visibility", visibility);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    const token = localStorage.getItem("access_token");
    setIsUploading(true);
    try {
      const response = await apiClient.post("art/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      toast.success("Artwork posted successfully!");
      navigate("/explore");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Upload error:", error.response?.data);
        toast.error(error.response?.data?.error || "Upload failed");
      } else {
        console.error("Upload error:", error);
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-20 max-w-6xl">
            <div className="mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
                    <i className="bx bx-chevron-left text-lg mr-2"></i>
                    Update Post
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
                    <img src={previewUrl} alt="Artwork preview" className="w-full h-full object-contain" />
                    <button
                    onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-2"
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
                    <p className="mb-2 text-sm font-medium">Choose a file or drag and drop it here</p>
                    <label
                    htmlFor="fileInput"
                    className="cursor-pointer hover:bg-white inline-block mb-6 border border-gray-300 rounded-[6px] p-2 text-xs"
                    >
                    Choose File
                    <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <p className="relative top-16 text-xs text-gray-500">
                    We recommend using high quality .jpg files less than 20MB
                    </p>
                </div>
                )}
            </div>

            <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                <h2 className="text-sm font-medium mb-8">Update your artwork information.</h2>

                <div className="mb-6">
                    <label htmlFor="title" className="block mb-2 text-xs font-medium">
                        Artwork Title
                    </label>
                    <Input
                        id="title"
                        placeholder="Enter artwork title"
                        value={artworkTitle}
                        onChange={(e) => setArtworkTitle(e.target.value)}
                        className="w-full"
                        style={{ fontSize: "12px", height: "35px" }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                    <label htmlFor="style" className="block mb-2 text-xs font-medium">
                        Artwork Style
                    </label>
                    <div className="relative">
                        <select
                            id="style"
                            value={artworkStyle}
                            onChange={(e) => setArtworkStyle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-8 text-xs"
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
                    <label htmlFor="medium" className="block mb-2 text-xs font-medium">
                        Medium
                    </label>
                    <Input
                        id="medium"
                        placeholder="Enter medium used"
                        value={medium}
                        onChange={(e) => setMedium(e.target.value)}
                        className="w-full"
                        style={{ fontSize: "12px", height: "35px" }}
                    />
                    </div>

                    <div>
                    <label htmlFor="visibility" className="block mb-2 text-xs font-medium">
                        Visibility
                    </label>
                    <select
                        id="visibility"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md appearance-none text-xs"
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="unlisted">Unlisted</option>
                    </select>
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="description" className="block mb-2 text-xs font-medium">
                        Description
                    </label>
                    <Textarea
                        id="description"
                        placeholder="Add a description"
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
                        Uploading...
                        </span>
                    ) : (
                        "Save Artwork"
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
