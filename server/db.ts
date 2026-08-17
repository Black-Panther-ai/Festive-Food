import bcrypt from 'bcryptjs';
import { INITIAL_CATEGORIES, INITIAL_DELIVERY_SLOTS, INITIAL_PRODUCTS, INITIAL_SELLERS } from './seedData.js';
import {
  Address,
  Category,
  Communication,
  ConfirmationStatus,
  DeliverySlot,
  OrderStatus,
  OrderStatusHistory,
  PreOrder,
  PreOrderItem,
  Product,
  Review,
  Seller,
  SellerProduct,
  User,
} from './types.js';

class DatabaseService {
  private users: Map<string, User> = new Map();
  private addresses: Map<string, Address> = new Map();
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private sellers: Map<string, Seller> = new Map();
  private sellerProducts: Map<string, SellerProduct> = new Map();
  private deliverySlots: Map<string, DeliverySlot> = new Map();
  private preOrders: Map<string, PreOrder> = new Map();
  private preOrderItems: Map<string, PreOrderItem> = new Map();
  private orderStatusHistory: Map<string, OrderStatusHistory> = new Map();
  private communications: Map<string, Communication> = new Map();
  private reviews: Map<string, Review> = new Map();
  private orderCounter = 10101;

  constructor() {
    this.seed();
  }

  public seed(): void {
    // 1. Seed Categories
    this.categories.clear();
    for (const cat of INITIAL_CATEGORIES) {
      this.categories.set(cat.id, { ...cat });
    }

    // 2. Seed Sellers
    this.sellers.clear();
    for (const seller of INITIAL_SELLERS) {
      this.sellers.set(seller.id, { ...seller });
    }

    // 3. Seed Products
    this.products.clear();
    for (const prod of INITIAL_PRODUCTS) {
      this.products.set(prod.id, { ...prod });
    }

    // 4. Seed Seller Products
    this.sellerProducts.clear();
    const prods = Array.from(this.products.values());
    const sellers = Array.from(this.sellers.values());
    if (sellers.length > 0) {
      prods.forEach((p, idx) => {
        const seller = sellers[idx % sellers.length];
        const spId = `sp-${seller.id}-${p.id}`;
        this.sellerProducts.set(spId, {
          id: spId,
          sellerId: seller.id,
          productId: p.id,
          price: p.price,
          capacity: p.availableQuantity,
          availableQuantity: p.availableQuantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    // 5. Seed Delivery Slots
    this.deliverySlots.clear();
    for (const slot of INITIAL_DELIVERY_SLOTS) {
      this.deliverySlots.set(slot.id, { ...slot });
    }

    // 6. Seed Admin User
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@UPFoods2025';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(adminPassword, salt);

    const adminUser: User = {
      id: 'usr-admin-01',
      name: 'UP Festive Foods Admin',
      email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@upfestivefoods.com',
      phone: '9839000001',
      role: 'ADMIN',
      passwordHash,
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(adminUser.id, adminUser);

    const sainiAdmin: User = {
      id: 'usr-admin-saini',
      name: 'Kumar Saini (Admin)',
      email: 'kumarsainipjk@gmail.com',
      phone: '9839000009',
      role: 'ADMIN',
      passwordHash,
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(sainiAdmin.id, sainiAdmin);

    // Operator demo user
    const opUser: User = {
      id: 'usr-op-02',
      name: 'Kanpur Operations Lead',
      email: 'operator@upfestivefoods.com',
      phone: '9839000002',
      role: 'OPERATOR',
      passwordHash,
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(opUser.id, opUser);

    // 7. Reviews (Initialized with authentic UP festive reviews)
    this.reviews.clear();
    const rev1: Review = {
      id: 'rev-1',
      productId: 'prod-gujiya',
      customerName: 'Ananya Sharma',
      rating: 5,
      comment: 'Authentic Kanpur khoya gujiya! Flaky crust and rich mawa filling, made pure desi ghee festival memorable.',
      status: 'APPROVED',
      createdAt: new Date('2026-02-10').toISOString(),
    };
    const rev2: Review = {
      id: 'rev-2',
      productId: 'prod-besan-laddoo',
      customerName: 'Rajesh Verma',
      rating: 5,
      comment: 'The danedar besan texture in pure cow ghee is unbeatable. Highly recommended for festive prasad.',
      status: 'APPROVED',
      createdAt: new Date('2026-02-12').toISOString(),
    };
    this.reviews.set(rev1.id, rev1);
    this.reviews.set(rev2.id, rev2);

    // 8. Pre-Orders Queue (Pre-populate realistic festive pre-orders for operations verification)
    this.preOrders.clear();
    this.preOrderItems.clear();
    this.orderStatusHistory.clear();
    this.communications.clear();

    // Seed Sample Order 1 (Kumar Saini)
    const addr1Id = 'addr-seed-01';
    const addr1: Address = {
      id: addr1Id,
      clerkUserId: 'user_saini_01',
      customerName: 'Kumar Saini',
      customerPhone: '6397353920',
      addressLine: 'Flat 402, Royal Residency, Opp. Civil Lines Park',
      area: 'Civil Lines',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      pincode: '208001',
      deliveryInstructions: 'Ring bell twice, deliver fresh batch before 12 PM',
      createdAt: new Date('2026-08-15T10:30:00Z').toISOString(),
    };
    this.addresses.set(addr1Id, addr1);

    const po1Id = 'po-seed-01';
    const po1: PreOrder = {
      id: po1Id,
      orderNumber: 'UP-20260815-99881',
      clerkUserId: 'user_saini_01',
      customerName: 'Kumar Saini',
      customerPhone: '6397353920',
      customerEmail: 'kumarsainipjk@gmail.com',
      addressId: addr1Id,
      address: addr1,
      deliverySlotId: 'slot-1',
      requestedDate: '2026-08-20',
      subtotal: 868,
      deliveryFee: 0,
      total: 868,
      paymentStatus: 'NOT_APPLICABLE',
      confirmationStatus: 'CONFIRMED',
      orderStatus: 'CONFIRMED',
      internalNotes: 'Customer verified order via WhatsApp. Requested pure desi ghee batches.',
      createdAt: new Date('2026-08-15T10:30:00Z').toISOString(),
      updatedAt: new Date('2026-08-15T11:00:00Z').toISOString(),
    };
    this.preOrders.set(po1Id, po1);

    const po1Item1: PreOrderItem = {
      id: 'poi-seed-01',
      preOrderId: po1Id,
      productId: 'prod-gujiya',
      quantity: 2,
      unitPrice: 349,
      totalPrice: 698,
      sellerId: 'seller-shukla',
    };
    const po1Item2: PreOrderItem = {
      id: 'poi-seed-02',
      preOrderId: po1Id,
      productId: 'prod-namak-para',
      quantity: 1,
      unitPrice: 179,
      totalPrice: 179,
      sellerId: 'seller-shukla',
    };
    this.preOrderItems.set(po1Item1.id, po1Item1);
    this.preOrderItems.set(po1Item2.id, po1Item2);

    const po1Hist1: OrderStatusHistory = {
      id: 'osh-seed-01',
      preOrderId: po1Id,
      oldStatus: 'NEW',
      newStatus: 'CONTACTED',
      changedBy: 'Admin (WhatsApp Trigger)',
      note: 'WhatsApp verification message dispatched to +91 6397353920.',
      createdAt: new Date('2026-08-15T10:35:00Z').toISOString(),
    };
    const po1Hist2: OrderStatusHistory = {
      id: 'osh-seed-02',
      preOrderId: po1Id,
      oldStatus: 'CONTACTED',
      newStatus: 'CONFIRMED',
      changedBy: 'Admin (Kumar Saini)',
      note: 'Customer confirmed festival delivery slot. Forwarded to Shukla Mishthan Halwai.',
      createdAt: new Date('2026-08-15T11:00:00Z').toISOString(),
    };
    this.orderStatusHistory.set(po1Hist1.id, po1Hist1);
    this.orderStatusHistory.set(po1Hist2.id, po1Hist2);

    // Seed Sample Order 2 (Pooja Tripathi)
    const addr2Id = 'addr-seed-02';
    const addr2: Address = {
      id: addr2Id,
      clerkUserId: null,
      customerName: 'Pooja Tripathi',
      customerPhone: '9415098123',
      addressLine: 'House No. 12/B, Hazratganj Main Road, Near Coffee House',
      area: 'Hazratganj',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
      deliveryInstructions: 'Deliver in festive gift packaging',
      createdAt: new Date('2026-08-16T14:15:00Z').toISOString(),
    };
    this.addresses.set(addr2Id, addr2);

    const po2Id = 'po-seed-02';
    const po2: PreOrder = {
      id: po2Id,
      orderNumber: 'UP-20260816-44321',
      clerkUserId: null,
      customerName: 'Pooja Tripathi',
      customerPhone: '9415098123',
      customerEmail: 'pooja.tripathi@outlook.com',
      addressId: addr2Id,
      address: addr2,
      deliverySlotId: 'slot-3',
      requestedDate: '2026-08-21',
      subtotal: 640,
      deliveryFee: 0,
      total: 640,
      paymentStatus: 'NOT_APPLICABLE',
      confirmationStatus: 'PENDING',
      orderStatus: 'NEW',
      internalNotes: null,
      createdAt: new Date('2026-08-16T14:15:00Z').toISOString(),
      updatedAt: new Date('2026-08-16T14:15:00Z').toISOString(),
    };
    this.preOrders.set(po2Id, po2);

    const po2Item1: PreOrderItem = {
      id: 'poi-seed-03',
      preOrderId: po2Id,
      productId: 'prod-besan-laddoo',
      quantity: 2,
      unitPrice: 320,
      totalPrice: 640,
      sellerId: 'seller-awadh',
    };
    this.preOrderItems.set(po2Item1.id, po2Item1);

    // Seed Sample Order 3 (Alok Mishra - Varanasi)
    const addr3Id = 'addr-seed-03';
    const addr3: Address = {
      id: addr3Id,
      clerkUserId: null,
      customerName: 'Alok Mishra',
      customerPhone: '9792049876',
      addressLine: 'D-58/12, Kashi Vidyapeeth Road, Near Sigra Stadium',
      area: 'Sigra',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221002',
      deliveryInstructions: 'Fresh batch needed for puja',
      createdAt: new Date('2026-08-16T18:00:00Z').toISOString(),
    };
    this.addresses.set(addr3Id, addr3);

    const po3Id = 'po-seed-03';
    const po3: PreOrder = {
      id: po3Id,
      orderNumber: 'UP-20260816-77890',
      clerkUserId: null,
      customerName: 'Alok Mishra',
      customerPhone: '9792049876',
      customerEmail: 'alok.mishra@gmail.com',
      addressId: addr3Id,
      address: addr3,
      deliverySlotId: null,
      requestedDate: '2026-08-22',
      subtotal: 448,
      deliveryFee: 0,
      total: 448,
      paymentStatus: 'NOT_APPLICABLE',
      confirmationStatus: 'CONFIRMED',
      orderStatus: 'PREPARING',
      internalNotes: 'Commissioned to Kashi Rasoi Halwai.',
      createdAt: new Date('2026-08-16T18:00:00Z').toISOString(),
      updatedAt: new Date('2026-08-16T19:00:00Z').toISOString(),
    };
    this.preOrders.set(po3Id, po3);

    const po3Item1: PreOrderItem = {
      id: 'poi-seed-04',
      preOrderId: po3Id,
      productId: 'prod-thekua',
      quantity: 1,
      unitPrice: 249,
      totalPrice: 249,
      sellerId: 'seller-banaras',
    };
    const po3Item2: PreOrderItem = {
      id: 'poi-seed-05',
      preOrderId: po3Id,
      productId: 'prod-mathri',
      quantity: 1,
      unitPrice: 199,
      totalPrice: 199,
      sellerId: 'seller-banaras',
    };
    this.preOrderItems.set(po3Item1.id, po3Item1);
    this.preOrderItems.set(po3Item2.id, po3Item2);
  }

  // --- User Operations ---
  public getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  // --- Category Operations ---
  public getCategories(): Category[] {
    return Array.from(this.categories.values());
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return Array.from(this.categories.values()).find((c) => c.slug === slug);
  }

  public createCategory(name: string, description?: string): Category {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      description,
      createdAt: new Date().toISOString(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  // --- Product Operations ---
  public getProducts(filters?: {
    category?: string;
    city?: string;
    availability?: string;
    search?: string;
    status?: string;
  }): Product[] {
    let result = Array.from(this.products.values());

    // Enrich category
    result = result.map((p) => ({
      ...p,
      category: this.categories.get(p.categoryId),
    }));

    if (filters?.status) {
      result = result.filter((p) => p.status === filters.status);
    } else {
      // By default show active products or products with available batches for public
    }

    if (filters?.category && filters.category !== 'all') {
      const cat = this.getCategoryBySlug(filters.category) || Array.from(this.categories.values()).find(c => c.id === filters.category);
      if (cat) {
        result = result.filter((p) => p.categoryId === cat.id);
      }
    }

    if (filters?.city && filters.city !== 'all') {
      result = result.filter((p) => p.city?.toLowerCase() === filters.city?.toLowerCase());
    }

    if (filters?.availability) {
      if (filters.availability === 'available') {
        result = result.filter((p) => p.status === 'ACTIVE' && p.availableQuantity > 0);
      } else if (filters.availability === 'sold_out') {
        result = result.filter((p) => p.status === 'SOLD_OUT' || p.availableQuantity === 0);
      }
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.ingredients.toLowerCase().includes(q) ||
          (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public getProductBySlug(slug: string): Product | undefined {
    const product = Array.from(this.products.values()).find((p) => p.slug === slug);
    if (!product) return undefined;
    return {
      ...product,
      category: this.categories.get(product.categoryId),
    };
  }

  public getProductById(id: string): Product | undefined {
    const product = this.products.get(id);
    if (!product) return undefined;
    return {
      ...product,
      category: this.categories.get(product.categoryId),
    };
  }

  public createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = `prod-${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product: Product = {
      ...data,
      id,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.set(id, product);
    return product;
  }

  public updateProduct(id: string, data: Partial<Product>): Product | undefined {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated: Product = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    // Auto-update SOLD_OUT status if availableQuantity <= 0
    if (updated.availableQuantity <= 0 && updated.status === 'ACTIVE') {
      updated.status = 'SOLD_OUT';
    } else if (updated.availableQuantity > 0 && updated.status === 'SOLD_OUT') {
      updated.status = 'ACTIVE';
    }
    this.products.set(id, updated);
    return updated;
  }

  public deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // --- Seller Operations ---
  public getSellers(): Seller[] {
    return Array.from(this.sellers.values());
  }

  public getSellerById(id: string): Seller | undefined {
    return this.sellers.get(id);
  }

  public createSeller(data: Omit<Seller, 'id' | 'createdAt' | 'updatedAt'>): Seller {
    const id = `seller-${Date.now()}`;
    const seller: Seller = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sellers.set(id, seller);
    return seller;
  }

  public updateSeller(id: string, data: Partial<Seller>): Seller | undefined {
    const existing = this.sellers.get(id);
    if (!existing) return undefined;
    const updated: Seller = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.sellers.set(id, updated);
    return updated;
  }

  // --- Delivery Slot Operations ---
  public getDeliverySlots(city?: string): DeliverySlot[] {
    let slots = Array.from(this.deliverySlots.values());
    if (city && city !== 'all') {
      slots = slots.filter((s) => s.city.toLowerCase() === city.toLowerCase());
    }
    return slots;
  }

  public getDeliverySlotById(id: string): DeliverySlot | undefined {
    return this.deliverySlots.get(id);
  }

  public createDeliverySlot(data: Omit<DeliverySlot, 'id' | 'reservedCapacity' | 'createdAt' | 'updatedAt'>): DeliverySlot {
    const id = `slot-${Date.now()}`;
    const slot: DeliverySlot = {
      ...data,
      id,
      reservedCapacity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.deliverySlots.set(id, slot);
    return slot;
  }

  public updateDeliverySlot(id: string, data: Partial<DeliverySlot>): DeliverySlot | undefined {
    const existing = this.deliverySlots.get(id);
    if (!existing) return undefined;
    const updated: DeliverySlot = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    if (updated.reservedCapacity >= updated.capacity) {
      updated.status = 'FULL';
    }
    this.deliverySlots.set(id, updated);
    return updated;
  }

  // --- PreOrder Operations ---
  public generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let orderNumber = '';
    let isUnique = false;

    while (!isUnique) {
      let suffix = '';
      for (let i = 0; i < 5; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      orderNumber = `UP-${dateStr}-${suffix}`;
      const exists = Array.from(this.preOrders.values()).some((o) => o.orderNumber === orderNumber);
      if (!exists) {
        isUnique = true;
      }
    }

    return orderNumber;
  }

  public createPreOrder(params: {
    clerkUserId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    addressLine: string;
    area: string;
    city: string;
    state?: string;
    pincode: string;
    deliveryInstructions?: string;
    deliverySlotId?: string;
    requestedDate?: string;
    items: Array<{ productId: string; quantity: number }>;
  }): { preOrder?: PreOrder; error?: string } {
    // 1. Validation: check items
    if (!params.items || params.items.length === 0) {
      return { error: 'No items in pre-order.' };
    }

    let subtotal = 0;
    const resolvedItems: Array<{ product: Product; quantity: number; unitPrice: number; totalPrice: number }> = [];

    for (const item of params.items) {
      const product = this.products.get(item.productId);
      if (!product) {
        return { error: `Product not found: ${item.productId}` };
      }
      if (product.status === 'SOLD_OUT' || product.availableQuantity < item.quantity) {
        return { error: `Requested quantity for "${product.name}" exceeds available capacity (${product.availableQuantity} left).` };
      }
      if (item.quantity <= 0) {
        return { error: 'Quantity must be greater than 0.' };
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      resolvedItems.push({
        product,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });
    }

    // 2. Validate Delivery Slot if provided
    let slot: DeliverySlot | undefined;
    if (params.deliverySlotId) {
      slot = this.deliverySlots.get(params.deliverySlotId);
      if (!slot) {
        return { error: 'Selected delivery slot is invalid.' };
      }
      if (slot.status === 'FULL' || slot.reservedCapacity >= slot.capacity) {
        return { error: 'The selected delivery slot is at full capacity. Please choose another slot.' };
      }
    }

    // 3. Create Address
    const addressId = `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const address: Address = {
      id: addressId,
      clerkUserId: params.clerkUserId || null,
      customerName: params.customerName.trim(),
      customerPhone: params.customerPhone.trim(),
      addressLine: params.addressLine.trim(),
      area: params.area.trim(),
      city: params.city.trim(),
      state: params.state || 'Uttar Pradesh',
      pincode: params.pincode.trim(),
      deliveryInstructions: params.deliveryInstructions?.trim() || null,
      createdAt: new Date().toISOString(),
    };
    this.addresses.set(addressId, address);

    // 4. Create PreOrder
    const preOrderId = `po-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderNumber = this.generateOrderNumber();
    const preOrder: PreOrder = {
      id: preOrderId,
      orderNumber,
      clerkUserId: params.clerkUserId || null,
      customerName: params.customerName.trim(),
      customerPhone: params.customerPhone.trim(),
      customerEmail: params.customerEmail?.trim() || null,
      addressId,
      address,
      deliverySlotId: slot?.id || null,
      deliverySlot: slot || null,
      requestedDate: params.requestedDate || slot?.date || null,
      subtotal,
      deliveryFee: 0, // ₹0 Pre-order MVP
      total: subtotal,
      paymentStatus: 'NOT_APPLICABLE',
      confirmationStatus: 'PENDING',
      orderStatus: 'NEW',
      internalNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.preOrders.set(preOrderId, preOrder);

    // 5. Create PreOrder Items & Update Product Inventory
    const savedItems: PreOrderItem[] = [];
    for (const resItem of resolvedItems) {
      const itemId = `poi-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const orderItem: PreOrderItem = {
        id: itemId,
        preOrderId,
        productId: resItem.product.id,
        product: resItem.product,
        quantity: resItem.quantity,
        unitPrice: resItem.unitPrice,
        totalPrice: resItem.totalPrice,
      };
      this.preOrderItems.set(itemId, orderItem);
      savedItems.push(orderItem);

      // Decrement product available capacity
      const newAvail = Math.max(0, resItem.product.availableQuantity - resItem.quantity);
      this.updateProduct(resItem.product.id, {
        availableQuantity: newAvail,
        status: newAvail === 0 ? 'SOLD_OUT' : resItem.product.status,
      });
    }

    // 6. Update Slot Reserved Capacity
    if (slot) {
      const newReserved = slot.reservedCapacity + 1;
      this.updateDeliverySlot(slot.id, {
        reservedCapacity: newReserved,
        status: newReserved >= slot.capacity ? 'FULL' : 'ACTIVE',
      });
    }

    // 7. Record Initial Status History
    const historyId = `osh-${Date.now()}`;
    const history: OrderStatusHistory = {
      id: historyId,
      preOrderId,
      oldStatus: 'NEW',
      newStatus: 'NEW',
      changedBy: 'System (Customer Pre-Order)',
      note: 'Pre-order request successfully placed by customer. Awaiting WhatsApp/call verification.',
      createdAt: new Date().toISOString(),
    };
    this.orderStatusHistory.set(historyId, history);

    preOrder.items = savedItems;
    preOrder.statusHistory = [history];

    return { preOrder };
  }

  public getPreOrderByOrderNumber(orderNumber: string, phone?: string): PreOrder | undefined {
    const formattedNum = orderNumber.trim().toUpperCase();
    const order = Array.from(this.preOrders.values()).find(
      (o) => o.orderNumber.toUpperCase() === formattedNum
    );
    if (!order) return undefined;

    if (phone) {
      const cleanInput = phone.replace(/\D/g, '').slice(-10);
      const cleanOrderPhone = order.customerPhone.replace(/\D/g, '').slice(-10);
      if (cleanInput !== cleanOrderPhone) {
        return undefined; // Security check for public order tracking
      }
    }

    return this.hydratePreOrder(order);
  }

  public getPreOrderById(id: string): PreOrder | undefined {
    const order = this.preOrders.get(id);
    if (!order) return undefined;
    return this.hydratePreOrder(order);
  }

  public getPreOrdersByCustomer(params: {
    clerkUserId?: string;
    phone?: string;
    email?: string;
  }): PreOrder[] {
    const { clerkUserId, phone, email } = params;
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    if (!clerkUserId && !cleanPhone && !cleanEmail) {
      return [];
    }

    const matched = Array.from(this.preOrders.values()).filter((o) => {
      if (clerkUserId && o.clerkUserId === clerkUserId) {
        return true;
      }
      if (cleanPhone) {
        const orderPhone = o.customerPhone.replace(/\D/g, '').slice(-10);
        if (orderPhone && orderPhone === cleanPhone) return true;
      }
      if (cleanEmail && o.customerEmail) {
        if (o.customerEmail.toLowerCase().trim() === cleanEmail) return true;
      }
      return false;
    });

    matched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return matched.map((o) => this.hydratePreOrder(o));
  }

  public hydratePreOrder(order: PreOrder): PreOrder {
    const items = Array.from(this.preOrderItems.values())
      .filter((i) => i.preOrderId === order.id)
      .map((item) => ({
        ...item,
        product: this.products.get(item.productId),
        seller: item.sellerId ? this.sellers.get(item.sellerId) : null,
      }));

    const statusHistory = Array.from(this.orderStatusHistory.values())
      .filter((h) => h.preOrderId === order.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const communications = Array.from(this.communications.values())
      .filter((c) => c.preOrderId === order.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const address = this.addresses.get(order.addressId);
    const deliverySlot = order.deliverySlotId ? this.deliverySlots.get(order.deliverySlotId) : null;

    return {
      ...order,
      items,
      address,
      deliverySlot,
      statusHistory,
      communications,
    };
  }

  public getOrders(filters?: {
    status?: string;
    confirmationStatus?: string;
    search?: string;
    city?: string;
    pincode?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): { orders: PreOrder[]; total: number; page: number; totalPages: number } {
    let result = Array.from(this.preOrders.values());

    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((o) => o.orderStatus === filters.status);
    }

    if (filters?.confirmationStatus && filters.confirmationStatus !== 'ALL') {
      result = result.filter((o) => o.confirmationStatus === filters.confirmationStatus);
    }

    if (filters?.city && filters.city !== 'ALL') {
      result = result.filter((o) => {
        const addr = this.addresses.get(o.addressId);
        return addr?.city.toLowerCase() === filters.city?.toLowerCase();
      });
    }

    if (filters?.pincode && filters.pincode.trim() !== '') {
      result = result.filter((o) => {
        const addr = this.addresses.get(o.addressId);
        return addr?.pincode.includes(filters.pincode!.trim());
      });
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = result.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 15;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;

    const paginated = result.slice(offset, offset + limit).map((o) => this.hydratePreOrder(o));

    return {
      orders: paginated,
      total,
      page,
      totalPages,
    };
  }

  public updateOrderStatus(id: string, newStatus: OrderStatus, changedBy: string, note?: string): PreOrder | undefined {
    const order = this.preOrders.get(id);
    if (!order) return undefined;

    const oldStatus = order.orderStatus;
    if (oldStatus === newStatus) return this.hydratePreOrder(order);

    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    // Log history
    const historyId = `osh-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.orderStatusHistory.set(historyId, {
      id: historyId,
      preOrderId: id,
      oldStatus,
      newStatus,
      changedBy,
      note: note || `Status updated from ${oldStatus} to ${newStatus}`,
      createdAt: new Date().toISOString(),
    });

    // If status became CONFIRMED, sync confirmation status if still pending
    if (newStatus === 'CONFIRMED' && order.confirmationStatus === 'PENDING') {
      order.confirmationStatus = 'CONFIRMED';
    }

    this.preOrders.set(id, order);
    return this.hydratePreOrder(order);
  }

  public updateConfirmationStatus(id: string, newConfirmation: ConfirmationStatus, changedBy: string, note?: string): PreOrder | undefined {
    const order = this.preOrders.get(id);
    if (!order) return undefined;

    order.confirmationStatus = newConfirmation;
    order.updatedAt = new Date().toISOString();

    if (newConfirmation === 'CONFIRMED' && order.orderStatus === 'NEW') {
      this.updateOrderStatus(id, 'CONFIRMED', changedBy, note || 'Customer confirmed via WhatsApp/Call.');
    } else if (newConfirmation === 'DECLINED') {
      this.updateOrderStatus(id, 'CANCELLED', changedBy, note || 'Customer declined pre-order confirmation.');
    }

    this.preOrders.set(id, order);
    return this.hydratePreOrder(order);
  }

  public assignSeller(preOrderItemId: string, sellerId: string): PreOrderItem | undefined {
    const item = this.preOrderItems.get(preOrderItemId);
    if (!item) return undefined;
    item.sellerId = sellerId;
    this.preOrderItems.set(preOrderItemId, item);
    return item;
  }

  public logCommunication(preOrderId: string, channel: 'WHATSAPP' | 'PHONE_CALL' | 'SMS' | 'EMAIL', message: string, status: string = 'SENT'): Communication {
    const commId = `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const comm: Communication = {
      id: commId,
      preOrderId,
      channel,
      message,
      status,
      createdAt: new Date().toISOString(),
    };
    this.communications.set(commId, comm);

    // If order was NEW, mark as CONTACTED automatically
    const order = this.preOrders.get(preOrderId);
    if (order && order.orderStatus === 'NEW') {
      this.updateOrderStatus(preOrderId, 'CONTACTED', 'Admin (WhatsApp/Call Trigger)', `Contacted customer via ${channel}`);
    }

    return comm;
  }

  // --- Reviews ---
  public getReviews(productId?: string): Review[] {
    let revs = Array.from(this.reviews.values()).filter((r) => r.status === 'APPROVED');
    if (productId) {
      revs = revs.filter((r) => r.productId === productId);
    }
    return revs;
  }

  public getAllReviews(): Review[] {
    return Array.from(this.reviews.values());
  }

  public createReview(data: Omit<Review, 'id' | 'createdAt'>): Review {
    const id = `rev-${Date.now()}`;
    const review: Review = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.reviews.set(id, review);
    return review;
  }

  public updateReviewStatus(id: string, status: 'PENDING' | 'APPROVED' | 'HIDDEN'): Review | undefined {
    const rev = this.reviews.get(id);
    if (!rev) return undefined;
    rev.status = status;
    this.reviews.set(id, rev);
    return rev;
  }

  // --- Customers List (Admin) ---
  public getCustomersList(): Array<{
    name: string;
    phone: string;
    email?: string | null;
    city: string;
    ordersCount: number;
    totalRequestedValue: number;
    lastOrderDate: string;
  }> {
    const customerMap = new Map<string, {
      name: string;
      phone: string;
      email?: string | null;
      city: string;
      ordersCount: number;
      totalRequestedValue: number;
      lastOrderDate: string;
    }>();

    for (const order of this.preOrders.values()) {
      const cleanPhone = order.customerPhone.trim();
      const existing = customerMap.get(cleanPhone);
      const addr = this.addresses.get(order.addressId);
      const city = addr?.city || 'UP';

      if (!existing) {
        customerMap.set(cleanPhone, {
          name: order.customerName,
          phone: cleanPhone,
          email: order.customerEmail,
          city,
          ordersCount: 1,
          totalRequestedValue: order.total,
          lastOrderDate: order.createdAt,
        });
      } else {
        existing.ordersCount += 1;
        existing.totalRequestedValue += order.total;
        if (new Date(order.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
          existing.lastOrderDate = order.createdAt;
        }
      }
    }

    return Array.from(customerMap.values()).sort((a, b) => b.ordersCount - a.ordersCount);
  }

  // --- Real-time Database Analytics Engine ---
  public getAnalytics() {
    const orders = Array.from(this.preOrders.values());
    const totalPreOrders = orders.length;

    const newOrders = orders.filter((o) => o.orderStatus === 'NEW').length;
    const contactedOrders = orders.filter((o) => o.orderStatus === 'CONTACTED').length;
    const confirmedOrders = orders.filter(
      (o) => o.orderStatus === 'CONFIRMED' || o.confirmationStatus === 'CONFIRMED'
    ).length;
    const preparingOrders = orders.filter((o) => o.orderStatus === 'PREPARING').length;
    const readyOrders = orders.filter((o) => o.orderStatus === 'READY').length;
    const outForDeliveryOrders = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const cancelledOrders = orders.filter(
      (o) => o.orderStatus === 'CANCELLED' || o.orderStatus === 'REJECTED' || o.confirmationStatus === 'DECLINED'
    ).length;

    const totalRequestedGMV = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const confirmedGMV = orders
      .filter((o) =>
        ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.orderStatus)
      )
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const validConfirmedCount = orders.filter((o) =>
      ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.orderStatus)
    ).length;

    // Formulas:
    const confirmationRate = totalPreOrders > 0 ? (validConfirmedCount / totalPreOrders) * 100 : 0;
    const cancellationRate = totalPreOrders > 0 ? (cancelledOrders / totalPreOrders) * 100 : 0;
    const averageOrderValue = validConfirmedCount > 0 ? confirmedGMV / validConfirmedCount : 0;
    const deliveryRate = validConfirmedCount > 0 ? (deliveredOrders / validConfirmedCount) * 100 : 0;

    // Repeat customers
    const customerOrderCounts = new Map<string, number>();
    orders.forEach((o) => {
      customerOrderCounts.set(o.customerPhone, (customerOrderCounts.get(o.customerPhone) || 0) + 1);
    });
    const totalUniqueCustomers = customerOrderCounts.size;
    const repeatCustomerCount = Array.from(customerOrderCounts.values()).filter((c) => c > 1).length;
    const repeatCustomerRate = totalUniqueCustomers > 0 ? (repeatCustomerCount / totalUniqueCustomers) * 100 : 0;

    // Demand by Product
    const productDemandMap = new Map<string, { name: string; quantity: number; gmv: number }>();
    for (const item of this.preOrderItems.values()) {
      const prod = this.products.get(item.productId);
      const name = prod ? prod.name : 'Unknown Product';
      const curr = productDemandMap.get(item.productId) || { name, quantity: 0, gmv: 0 };
      curr.quantity += item.quantity;
      curr.gmv += item.totalPrice;
      productDemandMap.set(item.productId, curr);
    }
    const ordersByProduct = Array.from(productDemandMap.values()).sort((a, b) => b.quantity - a.quantity);

    // Demand by PIN Code / Area
    const pinMap = new Map<string, { pincode: string; city: string; count: number; gmv: number }>();
    for (const o of orders) {
      const addr = this.addresses.get(o.addressId);
      const pin = addr?.pincode || 'Other';
      const city = addr?.city || 'UP';
      const curr = pinMap.get(pin) || { pincode: pin, city, count: 0, gmv: 0 };
      curr.count += 1;
      curr.gmv += o.total;
      pinMap.set(pin, curr);
    }
    const ordersByPin = Array.from(pinMap.values()).sort((a, b) => b.count - a.count);

    // Orders by Date (Last 7 Days)
    const dateMap = new Map<string, { date: string; preOrders: number; confirmed: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { date: dateStr, preOrders: 0, confirmed: 0 });
    }
    for (const o of orders) {
      const dStr = o.createdAt.split('T')[0];
      if (dateMap.has(dStr)) {
        const item = dateMap.get(dStr)!;
        item.preOrders += 1;
        if (['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.orderStatus)) {
          item.confirmed += 1;
        }
      }
    }
    const ordersByDay = Array.from(dateMap.values());

    // Demand by Delivery Date
    const deliveryDateMap = new Map<string, { date: string; orders: number }>();
    for (const o of orders) {
      const dDate = o.requestedDate || (o.deliverySlotId ? this.deliverySlots.get(o.deliverySlotId)?.date : null) || 'Unscheduled';
      const curr = deliveryDateMap.get(dDate) || { date: dDate, orders: 0 };
      curr.orders += 1;
      deliveryDateMap.set(dDate, curr);
    }
    const demandByDeliveryDate = Array.from(deliveryDateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      metrics: {
        totalPreOrders,
        newOrders,
        contactedOrders,
        confirmedOrders,
        preparingOrders,
        readyOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        totalRequestedGMV,
        confirmedGMV,
        averageOrderValue: Math.round(averageOrderValue),
        confirmationRate: Math.round(confirmationRate * 10) / 10,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
        repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10,
        totalCustomers: totalUniqueCustomers,
      },
      ordersByProduct,
      ordersByPin,
      ordersByDay,
      demandByDeliveryDate,
    };
  }
}

export const db = new DatabaseService();
