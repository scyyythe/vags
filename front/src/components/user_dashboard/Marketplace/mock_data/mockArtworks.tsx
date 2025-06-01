export interface Artwork {
  id: string;
  artworkImage: string;
  price: number;
  originalPrice?: number;
  title: string;
  description?: string;
  artist?: string;
  category?: string;
  likes?: number;
  views?: number;
  currency?: string;
  artworkStyle?: string;
  medium?: string;
  size?: string;
  edition?: string;
  rating?: number;
  totalReviews?: number;
  reviewBreakdown?: Record<number, number>;
}

export const mockArtworks: Artwork[] = [
  {
    id: "1",
    artworkImage: "https://i.pinimg.com/736x/a4/c9/8d/a4c98d5c9dcb90b3208b5abfe703d85d.jpg",
    price: 100,
    originalPrice: 120,
    title: "Mock Artwork 1",
    description: "Lorem ipsum dolor sit amet...",
    artist: "Angel Corneta",
    artworkStyle: "Painting",
    medium: "Canvas",
    size: "11 x 8.5 inches",
    edition: "Limited Edition",
    rating: 4.8,
    totalReviews: 20,
    reviewBreakdown: { 5: 15, 4: 3, 3: 1, 2: 1, 1: 0 }
  },
  {
    id: "2",
    artworkImage: "https://i.pinimg.com/736x/2b/16/27/2b1627359c0fc9f6225b5afd0811ddf1.jpg",
    price: 100,
    originalPrice: 120,
    title: "Mock Artwork 1",
    description: "Lorem ipsum dolor sit amet...",
    artist: "Angel Corneta",
    artworkStyle: "Painting",
    medium: "Canvas",
    size: "11 x 8.5 inches",
    edition: "Limited Edition",
    // rating: 4.8,
    totalReviews: 20,
    reviewBreakdown: { 5: 15, 4: 3, 3: 1, 2: 1, 1: 0 }
  },
  {
    id: "3",
    artworkImage: "https://i.pinimg.com/736x/cf/f3/4b/cff34bcec60045f4187080e67608ead5.jpg",
    price: 100,
    originalPrice: 120,
    title: "Mock Artwork 1",
    description: "Lorem ipsum dolor sit amet...",
    artist: "Angel Corneta",
    artworkStyle: "Painting",
    medium: "Canvas",
    size: "11 x 8.5 inches",
    edition: "Limited Edition",
    rating: 4.8,
    totalReviews: 20,
    reviewBreakdown: { 5: 15, 4: 3, 3: 1, 2: 1, 1: 0 }
  },
  {
    id: "4",
    artworkImage: "https://i.pinimg.com/736x/21/bd/78/21bd78a21a5521f18fee9c99013b618f.jpg",
    price: 100,
    originalPrice: 120,
    title: "Mock Artwork 1",
    description: "Lorem ipsum dolor sit amet...",
    artist: "Angel Corneta",
    artworkStyle: "Painting",
    medium: "Canvas",
    size: "11 x 8.5 inches",
    edition: "Limited Edition",
    // rating: 4.8,
    totalReviews: 20,
    reviewBreakdown: { 5: 15, 4: 3, 3: 1, 2: 1, 1: 0 }
  },
  {
    id: "5",
    artworkImage: "https://i.pinimg.com/736x/90/cf/6d/90cf6d8f2277af8c2791a95bd9f8dfe0.jpg",
    price: 100,
    originalPrice: 120,
    title: "Mock Artwork 1",
    description: "Lorem ipsum dolor sit amet...",
    artist: "Angel Corneta",
    artworkStyle: "Painting",
    medium: "Canvas",
    size: "11 x 8.5 inches",
    edition: "Limited Edition",
    rating: 5.0,
    totalReviews: 20,
    reviewBreakdown: { 5: 15, 4: 3, 3: 1, 2: 1, 1: 0 }
  },
];
