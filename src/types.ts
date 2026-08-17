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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
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
  deliveryDates: string;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
  reviews?: Review[];
  deliverySlots?: DeliverySlot[];
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
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliverySlot {
  id: string;
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  pincodes: string;
  capacity?: number;
  reservedCapacity?: number;
  remainingCapacity?: number;
  isFull?: boolean;
  status?: SlotStatus;
}

export interface Address {
  id?: string;
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
}

export interface PreOrderItem {
  id?: string;
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
  channel: 'WHATSAPP' | 'PHONE_CALL' | 'SMS' | 'EMAIL';
  message: string;
  status: string;
  createdAt: string;
}

export interface Review {
  id: string;
  preOrderId?: string | null;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  status?: string;
  createdAt: string;
}

export interface PreOrder {
  id: string;
  orderNumber: string;
  clerkUserId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  addressId?: string;
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

export interface AnalyticsMetrics {
  totalPreOrders: number;
  newOrders: number;
  contactedOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRequestedGMV: number;
  confirmedGMV: number;
  averageOrderValue: number;
  confirmationRate: number;
  cancellationRate: number;
  deliveryRate: number;
  repeatCustomerRate: number;
  totalCustomers: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  ordersByProduct: Array<{ name: string; quantity: number; gmv: number }>;
  ordersByPin: Array<{ pincode: string; city: string; count: number; gmv: number }>;
  ordersByDay: Array<{ date: string; preOrders: number; confirmed: number }>;
  demandByDeliveryDate: Array<{ date: string; orders: number }>;
}
