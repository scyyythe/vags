import React from "react";
import { Button } from "@/components/ui/button";

interface BannerUploadProps {
  bannerImage: string | null;
  setBannerImage: (image: string | null) => void;
  isReadOnly: boolean;
  viewMode: 'owner' | 'collaborator' | 'review' | 'monitoring' | 'preview';
}

const BannerUpload: React.FC<BannerUploadProps> = ({ 
  bannerImage, 
  setBannerImage, 
  isReadOnly,
  viewMode
}) => {
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="w-full bg-gray-100 rounded-lg flex flex-col items-center justify-center h-64 mb-8 relative overflow-hidden"
      style={{
        backgroundImage: bannerImage ? `url(${bannerImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {!bannerImage ? (
        <>
          <div className="bg-white p-2 rounded-full inline-block mb-2">
            <img
              width="20"
              height="20"
              src="./pics/icons8-cloud-upload.gif"
              alt="external-upload-network-and-cloud-computing-flatart-icons-solid-flatarticons"
            />
          </div>
          <p className="text-xs text-gray-600">Add a banner</p>
        </>
      ) : (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white text-black border-white hover:bg-gray-100"
            onClick={() => !isReadOnly && setBannerImage(null)}
            disabled={isReadOnly}
          >
            Change banner
          </Button>
        </div>
      )}

      {/* Hidden file input for banner upload */}
      <input 
        type="file" 
        id="banner-upload" 
        className="hidden" 
        accept="image/*"
        onChange={handleBannerUpload}
        disabled={viewMode === 'collaborator' || isReadOnly}
      />
      <label 
        htmlFor="banner-upload" 
        className={`absolute inset-0 ${viewMode === 'collaborator' || isReadOnly ? '' : 'cursor-pointer'}`}
        aria-label="Upload banner"
      ></label>
    </div>
  );
};

export default BannerUpload;
