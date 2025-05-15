import { Link } from "react-router-dom";

interface RelatedArtworkProps {
  id: string;
  title: string;
  image: string;
  artist: string;
}

const RelatedArtwork = ({ id, title, image, artist }: RelatedArtworkProps) => {
  return (
    <Link to={`/artwork/${id}`} className="block">
      <div className="relative group overflow-hidden rounded-lg">
        <img
          src={image}
          alt={title}
          className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium truncate">{title}</h3>
        <p className="text-xs text-gray-500 truncate">{artist}</p>
      </div>
    </Link>
  );
};

export default RelatedArtwork;
