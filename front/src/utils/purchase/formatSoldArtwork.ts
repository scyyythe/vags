export interface RawSoldArtwork {
  id: string;
  artwork_id: string;
  artwork_title: string;
  artwork_image: string;
  price: number;
  quantity: number;
  payment_method: string;
  is_paid: boolean;
  status: string;
  buyer_name: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

export interface FormattedSoldArtwork {
  id: string;
  artworkImage: string;
  title: string;
  buyer: string;
  price: number;
  status: string;
  saleDate: string;
  completedDate: string;
  paymentMethod: string;
  shippingAddress: any;
  artwork: {
    size: string;
    medium: string;
    style: string;
    edition: string;
    yearCreated: number;
  };
  review?: {
    rating: number;
    comment: string;
    photos: string[];
    reviewDate: string;
  };
}
export function formatSoldArtworks(data: RawSoldArtwork[] = []): FormattedSoldArtwork[] {
  return data.map((sale) => ({
    id: sale.id,
    artworkImage: sale.artwork_image,
    title: sale.artwork_title,
    buyer: sale.buyer_name,
    price: sale.price,
    status: sale.status.toLowerCase(),
    saleDate: new Date(sale.created_at).toLocaleDateString(),
    completedDate: new Date(sale.updated_at).toISOString(),
    paymentMethod: sale.payment_method,
    shippingAddress: sale.shipping_address,
    artwork: {
      size: "",
      medium: "",
      style: "",
      edition: "",
      yearCreated: new Date(sale.created_at).getFullYear(),
    },
    review:
      sale.status === "Reviewed"
        ? {
            rating: 5,
            comment: "Excellent work!",
            photos: [],
            reviewDate: new Date(sale.updated_at).toISOString(),
          }
        : undefined,
  }));
}
