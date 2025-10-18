import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

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

  const { language } = useLanguage();

  // Translation hooks for all text content
  const invalidFileTypeText = useAutoTranslation("Invalid file type", language);
  const invalidFileTypeDescText = useAutoTranslation("Please select an image file for the banner.", language);
  const fileTooLargeText = useAutoTranslation("File too large", language);
  const fileTooLargeDescText = useAutoTranslation("Please select an image smaller than 10MB.", language);
  const addBannerText = useAutoTranslation("Add a banner", language);
  const changeBannerText = useAutoTranslation("Change banner", language);

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected banner file:", file);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(invalidFileTypeText, {
          description: invalidFileTypeDescText,
          closeButton: true,
        });
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(fileTooLargeText, {
          description: fileTooLargeDescText,
          closeButton: true,
        });
        return;
      }

      // Set file and preview immediately
      setBannerFile(file);
      setBannerImage(URL.createObjectURL(file));

      // toast.success("Banner uploaded successfully", {
      //   description: "Your banner image has been uploaded.",
      //   closeButton: true,
      // });
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
          <p className="text-xs text-gray-600">{addBannerText}</p>
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
            {changeBannerText}
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
