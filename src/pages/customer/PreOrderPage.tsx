import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '../../context/ClerkWrapper';
import { useCart } from '../../context/CartContext';
import { DeliverySlot, Product } from '../../types';

interface PreOrderPageProps {
  navigate: (path: string) => void;
}

export const PreOrderPage: React.FC<PreOrderPageProps> = ({ navigate }) => {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const { isSignedIn, user, clerkUserId } = useCustomerAuth();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Kanpur');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Prefill from authenticated Clerk profile
  useEffect(() => {
    if (user) {
      if (user.name && !customerName) setCustomerName(user.name);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
      if (user.phone && !customerPhone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Available slots & products
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch delivery slots based on selected city
  useEffect(() => {
    const fetchSlotsAndProds = async () => {
      try {
        const [slotsRes, prodsRes] = await Promise.all([
          fetch(`/api/delivery-slots?city=${city}`),
          fetch('/api/products'),
        ]);

        if (slotsRes.ok) {
          const sData = await slotsRes.json();
          const slots: DeliverySlot[] = sData.data || [];
          setDeliverySlots(slots);
          if (slots.length > 0 && !selectedSlotId) {
            setSelectedSlotId(slots[0].id);
          }
        }

        if (prodsRes.ok) {
          const pData = await prodsRes.json();
          setAllProducts(pData.data || []);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      }
    };

    fetchSlotsAndProds();
  }, [city]);

  const validatePhone = (p: string) => {
    const clean = p.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(clean.slice(-10));
  };

  const validatePincode = (pin: string) => {
    return /^[1-9][0-9]{5}$/.test(pin.trim());
  };

  const handleSubmitPreOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (items.length === 0) {
      setFormError('Please add at least one festival snack or sweet to your pre-order.');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!validatePhone(customerPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (e.g. 9839012345).');
      return;
    }

    if (!addressLine.trim() || addressLine.trim().length < 5) {
      setFormError('Please enter a complete street address with house/flat number.');
      return;
    }

    if (!area.trim()) {
      setFormError('Please specify your area/colony/mohalla name.');
      return;
    }

    if (!validatePincode(pincode)) {
      setFormError('Please enter a valid 6-digit PIN code in Uttar Pradesh (e.g. 208001).');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        clerkUserId: clerkUserId || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        addressLine: addressLine.trim(),
        area: area.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        deliverySlotId: selectedSlotId || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      let createdOrder: any = null;
      try {
        const res = await fetch('/api/preorders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            createdOrder = data.data;
          }
        }
      } catch {
        // Backend not available (GitHub Pages)
      }

      if (!createdOrder) {
        // Local Order generation
        const orderNumber = `UP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        createdOrder = {
          id: `order-${Date.now()}`,
          orderNumber,
          ...payload,
          status: 'PENDING_CONFIRMATION',
          totalAmount: totalAmount,
          createdAt: new Date().toISOString(),
        };

        try {
          const existing = JSON.parse(localStorage.getItem('up_festive_orders_v2') || '[]');
          localStorage.setItem('up_festive_orders_v2', JSON.stringify([createdOrder, ...existing]));
        } catch {
          // ignore
        }
      }

      // Pre-order created successfully
      clearCart();
      navigate(`/order-success/${createdOrder.orderNumber}`);
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong while placing your pre-order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/products')}
        className="text-xs font-semibold text-stone-600 hover:text-amber-800 flex items-center gap-1.5 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Continue Browsing Snacks</span>
      </button>

      {/* Page Title */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          Pre-Order Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Zero advance payment. Pre-orders are confirmed via WhatsApp before fresh halwai production.
        </p>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Info & Delivery Slot (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form id="preorder-form" onSubmit={handleSubmitPreOrder} className="space-y-6">
            {/* 1. Contact Information */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-900 font-serif border-b border-stone-100 pb-2.5">
                <User className="w-4 h-4 text-amber-700" />
                <span>1. Contact & Customer Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="customer-name-input"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Mishra"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    id="customer-phone-input"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9839012345"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    We will send order confirmation on WhatsApp.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  id="customer-email-input"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                />
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-900 font-serif border-b border-stone-100 pb-2.5">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>2. Delivery Address in Uttar Pradesh</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  House / Flat / Street Address *
                </label>
                <input
                  id="address-line-input"
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. House No. 42, G.T. Road, Near Landmark"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Area / Locality *
                  </label>
                  <input
                    id="area-input"
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Swaroop Nagar"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    City in UP *
                  </label>
                  <select
                    id="city-select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  >
                    <option value="Kanpur">Kanpur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Gorakhpur">Gorakhpur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    id="pincode-input"
                    type="text"
                    maxLength={6}
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 208002"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Special Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Ring bell, call before arrival, leave with security..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                />
              </div>
            </div>

            {/* 3. Delivery Slot Selection */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-900 font-serif border-b border-stone-100 pb-2.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>3. Select Scheduled Delivery Slot</span>
              </div>

              {deliverySlots.length === 0 ? (
                <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl">
                  Standard fresh dispatch will be scheduled upon WhatsApp confirmation for {city}.
                </div>
              ) : (
                <div className="space-y-2">
                  {deliverySlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    const isFull = slot.isFull || (slot.remainingCapacity !== undefined && slot.remainingCapacity <= 0);

                    return (
                      <label
                        key={slot.id}
                        className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-amber-700 bg-amber-50/50'
                            : isFull
                            ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="deliverySlot"
                            disabled={isFull}
                            checked={isSelected}
                            onChange={() => setSelectedSlotId(slot.id)}
                            className="mt-1 text-amber-700 focus:ring-amber-600"
                          />
                          <div>
                            <div className="text-xs font-bold text-stone-900 font-serif">
                              {new Date(slot.date).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              • {slot.startTime} – {slot.endTime}
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              Serving PIN codes: {slot.pincodes}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {isFull ? (
                            <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-50 px-2 py-0.5 rounded">
                              Slot Full
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {slot.remainingCapacity !== undefined ? `${slot.remainingCapacity} slots left` : 'Available'}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Pre-Order Summary & Payment Clarification (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-stone-900 font-serif border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Your Pre-Order Items</span>
              <span className="text-xs font-normal text-stone-500 font-sans">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </h3>

            {/* Items List */}
            {items.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs">
                Your pre-order cart is empty.
                <button
                  onClick={() => navigate('/products')}
                  className="block mx-auto mt-2 text-amber-700 font-semibold underline"
                >
                  Browse snacks to add
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate font-serif">
                        {product.name}
                      </h4>
                      <div className="text-[11px] text-stone-500">
                        ₹{product.price} × {quantity}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-4 text-center text-xs font-bold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pricing Breakdown */}
            <div className="border-t border-stone-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Estimated Batch Value</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated Delivery Fee</span>
                <span className="text-emerald-700 font-semibold">FREE (MVP Launch)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                <span>Total Order Value</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            {/* Zero Advance Required Callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950 font-serif">
                <span>Payment Required Now:</span>
                <span className="text-sm text-emerald-800 font-extrabold font-sans">₹0</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                This is a pre-order request. No payment is required now. We will contact you before preparing your order for final confirmation.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              form="preorder-form"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-3.5 px-6 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-95 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-amber-900/20 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Pre-Order...</span>
                </div>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Place Pre-Order (₹0)</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-stone-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Zero Risk • No Bank Details or Cards Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
