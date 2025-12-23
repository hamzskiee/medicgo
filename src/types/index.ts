export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: ProductCategory;
  stock: number;
  requiresPrescription: boolean;
  dosage?: string;
  usage?: string;
  brand: string;
  rating: number;
  reviewCount: number;
}

export type ProductCategory =
  | "obat"
  | "vitamin"
  | "alat-kesehatan"
  | "perawatan-diri";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  phoneVerified?: boolean;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  district: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  address: Address;
  createdAt: Date;
  estimatedDelivery?: Date;
  trackingEvents: TrackingEvent[];
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "on-the-way"
  | "delivered"
  | "cancelled";

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: Date;
  description: string;
}

export interface Prescription {
  id: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: Date;
  notes?: string;
}
