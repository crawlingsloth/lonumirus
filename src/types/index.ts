export type UserRole = 'admin' | 'delivery' | 'customer';

export type OrderStatus = 'submitted' | 'payment_confirmed' | 'preparing' | 'delivered' | 'cancelled';

export type DestinationType = 'boat' | 'address';

export type ProductSku = 'CHILLI-250G' | 'CHILLI-500G';

export type BatchStatus = 'planning' | 'loading' | 'out' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
}

export interface BoatImage {
  id: string;
  dataUrl: string;
  caption: string;
  sortOrder: number;
  isCover: boolean;
}

export interface Boat {
  id: string;
  code: string;
  name: string;
  slug: string;
  active: boolean;
  summary: string;
  aboutMd: string;
  deliveryNotesMd: string;
  images: BoatImage[];
}

export interface Product {
  sku: ProductSku;
  name: string;
  priceMvr: number;
}

export interface Address {
  addressLine: string;
  island: string;
  atoll: string;
  contactName: string;
  contactPhone: string;
}

export interface Order {
  id: string;
  shortCode: string;
  customerId: string;
  createdAt: string;
  status: OrderStatus;
  product: Product;
  qty: number;
  totalMvr: number;
  destinationType: DestinationType;
  boatId?: string;
  address?: Address;
  paymentSlipDataUrl?: string;
  notes?: string;
}

export interface Batch {
  id: string;
  title: string;
  status: BatchStatus;
  orderIds: string[];
}

export interface DailyCounter {
  date: string; // YYYY-MM-DD
  next: number;
}
