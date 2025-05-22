import { Artwork, Bid } from "@/components/types/index";

export const mockArtwork: Artwork = {
  id: "art-123",
  title: "Abstract Dreams in Blue",
  image: "/placeholder.svg",
  artist: {
    name: "Maria Santos",
    id: "artist-456"
  },
  description: "A vibrant exploration of color and emotion through abstract forms and textures.",
  owner: "Gallery Modern Art"
};

export const mockBid: Bid = {
  id: "bid-789",
  artworkId: "art-123",
  amount: 5000,
  currency: "₱",
  auctionEndedAt: "2025-05-21T14:30:00Z",
  referenceNumber: "REF-2023-05-789",
  auctionId: "AUC-2023-559",
  paymentDeadline: "2025-05-24T14:30:00Z"
};
