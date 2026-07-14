export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  base_price: number; // in DZD, price before size/customization modifiers
  compare_at_price: number | null;
  mockup_image_url: string; // transparent-background garment mockup (front view)
  colors: string[]; // hex codes available for this product
  sizes: string[]; // e.g. ["S","M","L","XL","XXL"]
  is_customizable: boolean;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  size: string;
  color: string;
  /** Data URL / storage URL of the customer's uploaded design, if any */
  custom_design_url: string | null;
}

export interface Order {
  id: string;
  created_at: string;
  status: OrderStatus;
  first_name: string;
  last_name: string;
  phone: string;
  wilaya_code: string;
  wilaya_name: string;
  commune_name: string;
  address_line: string | null;
  delivery_type: "home" | "office"; // home vs. stopdesk pickup
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  notes: string | null;
}

export interface Commune {
  code: string;
  name: string;
}

export interface Wilaya {
  code: string; // "01".."58"
  name: string;
  communes: Commune[];
}
