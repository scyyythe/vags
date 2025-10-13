import React from "react";
import { Card } from "@/components/ui/card";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import { User } from "@/hooks/users/useUserQuery";

interface ArtworkSelectorProps {
  artworks: Artwork[];
  selectedArtworks: string[];
  handleArtworkSelect: (artworkId: string) => void;
  currentCollaborator: User | null;
  viewMode: string;
}

const ArtworkSelector: React.FC<ArtworkSelectorProps> = ({
  artworks,
  selectedArtworks,
  handleArtworkSelect,
  currentCollaborator,
  viewMode,
}) => {
  return (
    <div>
      <h3 className="text-xs font-medium mb-4">
        {viewMode === "collaborator" ? `${currentCollaborator?.first_name}'s Artworks` : "Your Artworks"}
      </h3>

      <div className="max-h-64 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {artworks
            .filter((artwork) => {
              // Filter for Active and Public artworks with valid images
              const isActiveAndPublic = artwork.art_status === "Active" && artwork.visibility === "Public";

              // Check both artworkImage and image_url for valid images
              const hasValidImage =
                (artwork.artworkImage && artwork.artworkImage.trim() !== "" && artwork.artworkImage !== "h") ||
                (artwork.image_url && artwork.image_url.trim() !== "" && artwork.image_url !== "h");

              return isActiveAndPublic && hasValidImage;
            })
            .map((artwork) => {
              const isSelected = selectedArtworks.includes(artwork.id);

              // Use artworkImage as primary, fallback to image_url if artworkImage is invalid
              const primaryImage =
                artwork.artworkImage && artwork.artworkImage.trim() !== "" && artwork.artworkImage !== "h"
                  ? artwork.artworkImage
                  : artwork.image_url;

              return (
                <Card
                  key={`art-${artwork.id}`}
                  onClick={() => handleArtworkSelect(artwork.id)}
                  className={`cursor-pointer overflow-hidden ${isSelected ? "opacity-40" : ""}`}
                >
                  <img
                    src={primaryImage}
                    alt={`Artwork ${artwork.id}`}
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      // Fallback to image_url if artworkImage fails
                      const target = e.target as HTMLImageElement;
                      if (target.src !== artwork.image_url) {
                        target.src = artwork.image_url || "";
                      } else {
                        // Hide image if both URLs fail
                        e.currentTarget.style.display = "none";
                      }
                    }}
                  />
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ArtworkSelector;
