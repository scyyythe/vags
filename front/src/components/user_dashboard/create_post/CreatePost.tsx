import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/Header";
import apiClient from "@/utils/apiClient";
import axios from "axios";


const CreatePost = () => {
  const navigate = useNavigate();
  const [artworkTitle, setArtworkTitle] = useState("");
  const [artworkStyle, setArtworkStyle] = useState("");
  const [medium, setMedium] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
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
    try {
      const response = await apiClient.post("art/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      console.log("Response from backend:", response.data);
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
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-32 max-w-6xl">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            Create Post
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
                <h2 className="text-sm font-medium mb-8">Provide artwork details.</h2>

                <div className="mb-6">
                  <label htmlFor="title" className="block mb-4 text-xs">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="style" className="block mb-4 text-xs">
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
                        <option value="abstract">Abstract</option>
                        <option value="realism">Realism</option>
                        <option value="impressionism">Impressionism</option>
                        <option value="surrealism">Surrealism</option>
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
                    <label htmlFor="medium" className="block mb-4 text-xs">
                      Medium
                    </label>
                    <Input
                      id="medium"
                      placeholder="Enter medium used"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full -py-2"
                      style={{ fontSize: "12px", height: "35px" }}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block mb-4 text-xs">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Add a description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[120px] p-1 text-xs"
                  />
                </div>

                <div className="text-right">
                  <Button
                    type="submit"
                    className="bg-red-800 hover:bg-red-700 text-white px-6 py-1 text-xs rounded-full"
                  >
                    Post Artwork
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
