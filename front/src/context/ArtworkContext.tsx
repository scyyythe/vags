import { createContext, useContext, useState, ReactNode } from "react";

export interface Artwork {
  id: string;
  artistName: string;
  artistImage: string;
  artworkImage: string;
  title?: string;
  price?: string;
  currency?: string;
  likesCount?: number; 
}

interface ArtworkContextType {
  artworks: Artwork[];
  setArtworks: (artworks: Artwork[]) => void;
}

const ArtworkContext = createContext<ArtworkContextType>({
  artworks: [],
  setArtworks: () => {},
});

export const useArtworkContext = () => useContext(ArtworkContext);

export const ArtworkProvider = ({ children }: { children: ReactNode }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  return (
    <ArtworkContext.Provider value={{ artworks, setArtworks }}>
      {children}
    </ArtworkContext.Provider>
  );
};
