export type Role = 'ADMIN' | 'OPERATOR' | 'SELLER' | 'CUSTOMER';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT';
export type SlotStatus = 'ACTIVE' | 'INACTIVE' | 'FULL';
export type PaymentStatus = 'NOT_APPLICABLE' | 'PENDING' | 'PAID' | 'REFUNDED';
export type ConfirmationStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED';
export type OrderStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';
export type CommunicationChannel = 'WHATSAPP' | 'PHONE_CALL' | 'SMS' | 'EMAIL';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'HIDDEN';

export interface User {
  id: string;
  name: string;
  phone?: string | null;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId?: string | null;
  clerkUserId?: string | null;
  customerName: string;
  customerPhone: string;
  addressLine: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions?: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category?: Category;
  price: number;
  unit: string;
  weight: string;
  approxPieces?: string | null;
  imageUrl: string;
  ingredients: string;
  allergens?: string | null;
  shelfLife: string;
  storageInstructions: string;
  status: ProductStatus;
  availableQuantity: number;
  preOrderDeadline: string;
  deliveryDates: string; // e.g. "2026-08-23,2026-08-24" or formatted label
  city?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone: string;
  city: string;
  area: string;
  fssaiNumber?: string | null;
  verificationStatus: VerificationStatus;
  status: EntityStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProduct {
  id: string;
  sellerId: string;
  productId: string;
  price: number;
  capacity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverySlot {
  id: string;
  city: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "02:00 PM"
  pincodes: string; // "208001,208002,208005"
  capacity: number;
  reservedCapacity: number;
  status: SlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PreOrderItem {
  id: string;
  preOrderId: string;
  productId: string;
  product?: Product;
  sellerId?: string | null;
  seller?: Seller | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistory {
  id: string;
  preOrderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  changedBy: string;
  note?: string | null;
  createdAt: string;
}

export interface Communication {
  id: string;
  preOrderId: string;
  channel: CommunicationChannel;
  message: string;
  status: string;
  createdAt: string;
}

export interface Review {
  id: string;
  preOrderId?: string | null;
  productId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface PreOrder {
  id: string;
  orderNumber: string; // UP-YYYYMMDD-XXXXX
  clerkUserId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  addressId: string;
  address?: Address;
  deliverySlotId?: string | null;
  deliverySlot?: DeliverySlot | null;
  requestedDate?: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  confirmationStatus: ConfirmationStatus;
  orderStatus: OrderStatus;
  internalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: PreOrderItem[];
  statusHistory?: OrderStatusHistory[];
  communications?: Communication[];
  reviews?: Review[];
}
