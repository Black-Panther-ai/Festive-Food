import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '../../context/ClerkWrapper';
import { PreOrder } from '../../types';

interface OrderSuccessPageProps {
  orderNumber: string;
  navigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderNumber, navigate }) => {
  const { isSignedIn } = useCustomerAuth();
  const [order, setOrder] = useState<PreOrder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Fire festive celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D97706', '#B45309', '#F59E0B', '#059669', '#10B981'],
      });
    } catch {
      // ignore
    }

    const fetchOrder = async () => {
      if (!orderNumber) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/preorders/details/${encodeURIComponent(orderNumber)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setOrder(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load order success data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste UP Festive Foods! I have placed pre-order ${orderNumber}. Please confirm my fresh batch details.`
  );
  const whatsappUrl = `https://wa.me/916397353920?text=${whatsappMessage}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Success Hero Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 text-center shadow-xs space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-serif">
            Pre-Order Request Confirmed
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-serif">
            Pre-order Received!
          </h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Thank you for validating demand for authentic Uttar Pradesh festival foods.
          </p>
        </div>

        {/* Order ID Tag */}
        <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-300/80 px-4 py-2 rounded-2xl">
          <span className="text-xs font-semibold text-stone-600">Order ID:</span>
          <span className="text-base sm:text-lg font-mono font-bold text-amber-950">{orderNumber}</span>
          <button
            onClick={copyOrderNumber}
            className="p-1 text-amber-800 hover:text-amber-950 transition"
            title="Copy Order ID"
          >
            {copied ? <span className="text-[10px] font-bold text-emerald-700">Copied!</span> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Zero Payment Callout */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 max-w-lg mx-auto text-xs text-emerald-950 space-y-1">
          <div className="font-bold font-serif text-sm">Payment: ₹0 — No advance payment required</div>
          <p className="text-emerald-900 text-[11px] leading-relaxed">
            Our team will contact you via WhatsApp / Call to confirm batch scheduling before halwai preparation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            id="track-order-success-btn"
            onClick={() => navigate(`/track-order?orderNumber=${orderNumber}`)}
            className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Pre-Order</span>
          </button>

          <button
            id="view-in-account-btn"
            onClick={() => navigate('/account')}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>View in My Orders</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Connect on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Real Order Details Preview if loaded */}
      {order && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 font-serif border-b border-stone-100 pb-3">
            Pre-Order Summary
          </h3>

          {/* Items */}
          <div className="divide-y divide-stone-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-amber-700" />
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">
                      {item.product?.name || (item as any).productName}
                    </p>
                    <p className="text-stone-500">
                      Qty: {item.quantity} × {item.product?.unit || (item as any).unit || '500g'}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-stone-900 text-sm">₹{item.totalPrice}</span>
              </div>
            ))}
          </div>

          {/* Delivery & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-xs bg-stone-50/60 p-4 rounded-2xl">
            <div className="space-y-1">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-700" /> Delivery Address
              </span>
              <p className="text-stone-800 font-medium">{order.customerName}</p>
              <p className="text-stone-600">
                {order.address?.addressLine}, {order.address?.area}, {order.address?.city} - {order.address?.pincode}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700" /> Requested Slot
              </span>
              <p className="text-stone-800 font-medium">
                {order.requestedDate || order.deliverySlot?.date || 'Batch Scheduled'}
              </p>
              <p className="text-emerald-700 font-semibold mt-1">
                Total: ₹{order.total} (₹0 Advance Paid)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* What Happens Next Explainer */}
      <div className="bg-[#FAF7F2] rounded-3xl border border-amber-900/10 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-amber-950 font-serif flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-800" />
          <span>Next Steps for Your Festival Batch:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <span className="font-bold text-amber-900 block mb-1">Step 1: WhatsApp / Call Confirmation</span>
            <p className="text-stone-600 leading-relaxed">
              Our coordinator will contact your mobile to confirm delivery slot, quantities, and packaging preferences.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <span className="font-bold text-amber-900 block mb-1">Step 2: Fresh Halwai Batch</span>
            <p className="text-stone-600 leading-relaxed">
              Once batch capacity is locked, certified master makers prepare the items in 100% pure desi ghee.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <span className="font-bold text-amber-900 block mb-1">Step 3: Doorstep Delivery</span>
            <p className="text-stone-600 leading-relaxed">
              Delivered fresh in your requested delivery slot with tamper-evident airtight packaging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
