import { Artwork, Bid } from "@/components/types/index";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Image } from "lucide-react";

interface ArtworkSummaryProps {
  artwork: Artwork;
  bid: Bid;
}

export const ArtworkSummary: React.FC<ArtworkSummaryProps> = ({ artwork, bid }) => {
  const formattedEndDate = format(new Date(bid.auctionEndedAt), "MMMM d, yyyy 'at' h:mm a");

  return (
    <div className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 h-72 md:h-80 relative bg-artwork-muted">
          {artwork.image ? (
            <img
              src={artwork.image}
              alt={artwork.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <Image size={48} className="text-gray-400" />
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{artwork.title}</h2>
          <p className="text-lg text-gray-600">by {artwork.artist.name}</p>
          
          <div className="my-6">
            <p className="text-sm text-gray-500">Final bid amount</p>
            <p className="text-2xl font-bold text-red-500">
              {bid.currency}{bid.amount.toLocaleString()}
            </p>
          </div>
          
          <div className="my-4">
            <p className="text-sm text-gray-500">Auction ended</p>
            <p className="text-base text-gray-700">{formattedEndDate}</p>
          </div>
          
          {artwork.description && (
            <div className="mt-4 text-gray-600">
              <p className="line-clamp-3">{artwork.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
