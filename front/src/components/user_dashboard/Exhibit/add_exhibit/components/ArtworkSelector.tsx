import React from "react";
import { Card } from "@/components/ui/card";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

interface ArtworkSelectorProps {
  artworks: Artwork[];
  selectedArtworks: string[];
  handleArtworkSelect: (artworkId: string) => void;
  currentCollaborator: { name: string } | null;
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
        {viewMode === "collaborator" ? `${currentCollaborator?.name}'s Artworks` : "Your Artworks"}
      </h3>

      <div className="max-h-64 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {artworks.map((artwork) => {
            const isSelected = selectedArtworks.includes(artwork.id);

            return (
              <Card
                key={artwork.id}
                onClick={() => handleArtworkSelect(artwork.id)}
                className={`cursor-pointer overflow-hidden ${isSelected ? "opacity-40" : ""}`}
              >
                <img src={artwork.artworkImage} alt={`Artwork ${artwork.id}`} className="w-full h-24 object-cover" />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArtworkSelector;
