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
  artist_id: string;
  artwork_size?: string;
  artwork_medium?: string;
  artwork_style?: string;
  artwork_edition?: string;
  artwork_year_created?: number;
}

export interface FormattedSoldArtwork {
  id: string;
  artwork_id: string;
  artworkImage: string;
  title: string;
  buyer: string;
  price: number;
  artist_id: string;
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

function normalizeSoldStatus(status: string): string {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");

  if (normalized === "to_receive") return "in_progress";
  if (normalized === "reviewed") return "completed";

  return normalized;
}

export function formatSoldArtworks(data: RawSoldArtwork[] = []): FormattedSoldArtwork[] {
  return data.map((sale) => {
    const normalizedStatus = normalizeSoldStatus(sale.status);

    return {
      id: sale.id,
      artwork_id: sale.artwork_id,
      artworkImage: sale.artwork_image,
      title: sale.artwork_title,
      buyer: sale.buyer_name,
      price: sale.price,
      status: normalizedStatus,
      saleDate: new Date(sale.created_at).toLocaleDateString(),
      completedDate: new Date(sale.updated_at).toISOString(),
      paymentMethod: sale.payment_method,
      shippingAddress: sale.shipping_address,

      artist_id: sale.artist_id,
      artwork: {
        size: sale.artwork_size || "Unknown",
        medium: sale.artwork_medium || "Unknown",
        style: sale.artwork_style || "Unknown",
        edition: sale.artwork_edition || "Unknown",
        yearCreated: sale.artwork_year_created ?? new Date(sale.created_at).getFullYear(),
      },
      review:
        normalizedStatus === "reviewed"
          ? {
              rating: 5,
              comment: "Excellent work!",
              photos: [],
              reviewDate: new Date(sale.updated_at).toISOString(),
            }
          : undefined,
    };
  });
}
