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
    <div className="overflow-hidden flex justify-center items-center w-full">
    <div className="flex flex-col md:flex-row justify-center items-center p-4 md:pl-32">
    
      <div className="w-full md:w-[600px] h-72 md:h-[260px] relative rounded-xl md:mr-6">
        <img
          src="https://i.pinimg.com/736x/c4/a1/e3/c4a1e3bc39fa859b4d5a8948d9e85525.jpg"
          alt={artwork.title}
          className="object-cover w-full h-full rounded-xl shadow-md"
        />
      </div>

      <div className="w-full md:w-2/3 px-4 py-5 text-center md:text-left">
        <h2 className="text-sm md:text-lg font-bold text-gray-900 mb-0.5">{artwork.title}</h2>
        <p className="text-[10px] text-gray-600">by {artwork.artist.name}</p>

        {artwork.description && (
          <div className="mt-4 text-gray-600">
            <p className="text-[11px] line-clamp-3">"{artwork.description}"</p>
          </div>
        )}

        <div className="my-6">
          <p className="text-[11px] text-gray-500 mb-1">Final bid amount</p>
          <p className="text-lg font-bold text-red-700">
            {bid.currency}{bid.amount.toLocaleString()}
          </p>
        </div>

        <div className="my-4">
          <p className="text-[11px] text-gray-500 mb-1">Auction ended</p>
          <p className="text-xs text-gray-700">{formattedEndDate}</p>
        </div>
      </div>
      
    </div>
  </div>
  );
};
