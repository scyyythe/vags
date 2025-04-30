import { Link } from "react-router-dom";

interface RelatedBidsProps {
  currentCategory: string;
  currentBidId: string;
}

const allBids = [
  {
    id: "b1",
    title: "Abstract Dream",
    image: "https://i.imgur.com/1R9Z0s9.png",
    artist: "Mika Rivera",
    category: "Surrealism",
  },
  {
    id: "b2",
    title: "Liquid Illusion",
    image: "https://i.imgur.com/xZk5KTa.png",
    artist: "J. Tolentino",
    category: "Surrealism",
  },
  {
    id: "b3",
    title: "Blue Echo",
    image: "https://i.imgur.com/kcRPB9M.png",
    artist: "Luna B.",
    category: "Abstract",
  },
];

const RelatedBids = ({ currentCategory, currentBidId }: RelatedBidsProps) => {
  const related = allBids.filter(
    (bid) => bid.category === currentCategory && bid.id !== currentBidId
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {related.map((bid) => (
        <Link to={`/bid/${bid.id}`} key={bid.id}>
          <div className="overflow-hidden rounded-lg shadow-md group">
            <img
              src={bid.image}
              alt={bid.title}
              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
            />
            <div className="p-2">
              <h3 className="text-sm font-semibold truncate">{bid.title}</h3>
              <p className="text-xs text-gray-500 truncate">{bid.artist}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RelatedBids;
