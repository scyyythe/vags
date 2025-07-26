export function formatOrderDetails(selectedOrder: any) {
  const orderDate = selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : "Unknown";

  const defaultTimeline = [
    {
      status: "Order Placed",
      description: "Your order has been placed successfully.",
      date: orderDate,
      completed: true,
    },
    {
      status: "Payment Pending",
      description: "Waiting for your payment to be completed.",
      date: "Pending",
      completed: false,
    },
  ];

  return {
    ...selectedOrder,
    artworkImage: selectedOrder.artwork?.image_url?.[0] || "/placeholder.png",
    artist: selectedOrder.artwork?.artist_name || "Unknown",
    buyer: selectedOrder.buyer?.full_name || "Unknown",
    orderDate,
    saleDate: selectedOrder.saleDate ? new Date(selectedOrder.saleDate).toLocaleDateString() : undefined,
    expectedDelivery: selectedOrder.expectedDelivery
      ? new Date(selectedOrder.expectedDelivery).toLocaleDateString()
      : selectedOrder.created_at
      ? new Date(new Date(selectedOrder.created_at).getTime() + 7 * 86400000).toLocaleDateString()
      : "Unknown",
    paymentMethod: selectedOrder.payment_method || "Unknown",
    price: selectedOrder.total_price ?? 0,
    status: selectedOrder.status || "pending",
    shippingAddress: selectedOrder.shipping_address && {
      name: selectedOrder.artwork?.artist_name || "Unknown",
      address: selectedOrder.shipping_address.address || "Unknown",
      city: selectedOrder.shipping_address.city || "Unknown",
      postalCode: selectedOrder.shipping_address.postal_code || "",
    },
    artwork: {
      size: selectedOrder.artwork?.size || "Unknown",
      medium: selectedOrder.artwork?.medium || "Unknown",
      style: selectedOrder.artwork?.category
        ? selectedOrder.artwork.category.charAt(0).toUpperCase() + selectedOrder.artwork.category.slice(1)
        : "Unknown",

      edition: selectedOrder.artwork?.edition || "Unknown",
      yearCreated: selectedOrder.artwork?.year_created ?? 0,
      quantity: selectedOrder.artwork?.quantity ?? 1,
    },
    timeline: selectedOrder.timeline?.length ? selectedOrder.timeline : defaultTimeline,
  };
}
