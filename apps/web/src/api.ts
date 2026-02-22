export const API_BASE = "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      details?: {
        fieldErrors?: Record<string, string[]>;
        formErrors?: string[];
      };
    };

    const firstFieldError = body.details?.fieldErrors
      ? Object.values(body.details.fieldErrors).flat().find(Boolean)
      : undefined;
    const firstFormError = body.details?.formErrors?.find(Boolean);

    throw new Error(firstFieldError ?? firstFormError ?? body.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export type StoreItem = {
  id: number;
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  quantity: number;
};

export type PopularItem = StoreItem & {
  orderedCount: number;
};

export type CarouselSlide = {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
};

export type TrackingEvent = {
  id: number;
  orderId: number;
  status: string;
  note: string;
  createdAt: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  item: StoreItem;
};

export type OrderRecord = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  billingAddress: string;
  shippingAddress: string;
  paymentMethod: "CARD" | "UPI" | "BANK_TRANSFER" | "COD";
  paymentStatus: string;
  trackingStatus: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  trackingEvents: TrackingEvent[];
};

export type NotificationRecord = {
  id: number;
  orderId?: number | null;
  customerEmail?: string | null;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type PaginatedItems<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
};

export type CheckoutPayload = {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  billingAddress: string;
  shippingAddress: string;
  paymentMethod: "CARD" | "UPI" | "BANK_TRANSFER" | "COD";
  items: Array<{ itemId: number; quantity: number }>;
};

export function getStoreItems(params?: {
  category?: string;
  subcategory?: string;
  q?: string;
  offset?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.subcategory) query.set("subcategory", params.subcategory);
  if (params?.q) query.set("q", params.q);
  if (params?.offset !== undefined) query.set("offset", String(params.offset));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return request<PaginatedItems<StoreItem>>(`/store/items${suffix}`);
}

export function getPopularItems(params?: { offset?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.offset !== undefined) query.set("offset", String(params.offset));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return request<PaginatedItems<PopularItem>>(`/store/popular-items${suffix}`);
}

export function getCategories() {
  return request<Record<string, string[]>>("/store/categories");
}

export function getCarouselSlides() {
  return request<CarouselSlide[]>("/store/carousel");
}

export function checkout(payload: CheckoutPayload) {
  return request<OrderRecord>("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMyOrders(email: string) {
  const query = new URLSearchParams({ email: email.toLowerCase() });
  return request<OrderRecord[]>(`/orders?${query.toString()}`);
}

export function getNotifications(email: string) {
  const query = new URLSearchParams({ email: email.toLowerCase() });
  return request<NotificationRecord[]>(`/notifications?${query.toString()}`);
}

export function markNotificationRead(id: number) {
  return request<NotificationRecord>(`/notifications/${id}/read`, {
    method: "PATCH",
    body: JSON.stringify({ read: true })
  });
}
