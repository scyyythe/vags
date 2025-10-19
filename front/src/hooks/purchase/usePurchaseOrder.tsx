import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface CreatePurchaseOrderData {
  artwork: string;
  quantity: number;
  total_price: number;
}

export interface UpdatePurchaseOrderData {
  shipping_address?: {
    name: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    postal_code: string;
    phone: string;
  };
  payment_method?: string;
  is_paid?: boolean;
}

// Convert purchase order to purchase payload for final purchase
export interface PurchaseOrderToPurchasePayload {
  artwork_id: string;
  payment_method: string;
  is_paid: boolean;
  quantity: number;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    phone: string;
  };
}

export interface PurchaseOrder {
  id: string;
  buyer: string;
  artwork: string;
  shipping_address?: {
    name: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    postal_code: string;
    phone: string;
  };
  payment_method?: string;
  is_paid: boolean;
  quantity: number;
  total_price: number;
  status: "Ordering" | "Shipping" | "Payment" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
}

// Create purchase order
export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderData) => {
      const response = await apiClient.post("/purchase-order/create/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

// Get purchase order by ID
export const usePurchaseOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["purchase-order", orderId],
    queryFn: async (): Promise<PurchaseOrder> => {
      const response = await apiClient.get(`/purchase-order/${orderId}/`);
      return response.data.data;
    },
    enabled: !!orderId,
  });
};

// Update purchase order
export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: UpdatePurchaseOrderData }) => {
      const response = await apiClient.put(`/purchase-order/${orderId}/update/`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

// Cancel purchase order
export const useCancelPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.put(`/purchase-order/${orderId}/cancel/`);
      return response.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

// Helper function to convert purchase order to purchase payload
export const convertPurchaseOrderToPayload = (purchaseOrder: PurchaseOrder): PurchaseOrderToPurchasePayload => {
  return {
    artwork_id: purchaseOrder.artwork,
    payment_method: purchaseOrder.payment_method || "PayPal",
    is_paid: purchaseOrder.is_paid,
    quantity: purchaseOrder.quantity,
    shipping_address: {
      name: purchaseOrder.shipping_address?.name || "",
      address: purchaseOrder.shipping_address?.address || "",
      city: purchaseOrder.shipping_address?.city || "",
      state: purchaseOrder.shipping_address?.state || "",
      country: purchaseOrder.shipping_address?.country || "Philippines",
      postal_code: purchaseOrder.shipping_address?.postal_code || "",
      phone: purchaseOrder.shipping_address?.phone || "",
    },
  };
};
