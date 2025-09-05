import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

interface BannerUploadProps {
  bannerImage: string | null;
  setBannerImage: (image: string | null) => void;
  setBannerFile: (file: File | null) => void;
  isReadOnly: boolean;
  viewMode: "owner" | "collaborator" | "review" | "monitoring" | "preview";
}

const BannerUpload: React.FC<BannerUploadProps> = ({
  bannerImage,
  setBannerFile,
  setBannerImage,
  isReadOnly,
  viewMode,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Set file and preview immediately
      setBannerFile(file);
      setBannerImage(URL.createObjectURL(file));
      console.log("📂 Selected banner file:", file);

      // Clear input safely after React state updates
      setTimeout(() => {
        if (inputRef.current) inputRef.current.value = "";
      }, 0);
    }
  };

  const handleClearBanner = () => {
    console.log("🗑 Clearing banner...");
    setBannerFile(null);
    setBannerImage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className="w-full bg-gray-100 rounded-lg flex flex-col items-center justify-center h-64 mb-8 relative overflow-hidden"
      style={{
        backgroundImage: bannerImage ? `url(${bannerImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!bannerImage ? (
        <>
          <div className="bg-white p-2 rounded-full inline-block mb-2">
            <img width="20" height="20" src="./pics/icons8-cloud-upload.gif" alt="Upload" />
          </div>
          <p className="text-xs text-gray-600">Add a banner</p>
        </>
      ) : (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-black border-white hover:bg-gray-100"
            onClick={handleClearBanner}
            disabled={isReadOnly}
          >
            Change banner
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={inputRef}
        id="banner-upload"
        className="hidden"
        accept="image/*"
        onChange={handleBannerUpload}
        disabled={viewMode === "collaborator" || isReadOnly}
      />

      {!bannerImage && (
        <label
          htmlFor="banner-upload"
          className={`absolute inset-0 ${viewMode === "collaborator" || isReadOnly ? "" : "cursor-pointer"}`}
          aria-label="Upload banner"
        />
      )}
    </div>
  );
};

export default BannerUpload;
