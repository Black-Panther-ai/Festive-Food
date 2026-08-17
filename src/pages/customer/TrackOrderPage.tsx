import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  Search,
  Sparkles,
  Truck
} from 'lucide-react';
import React, { useState } from 'react';
import { OrderTimeline } from '../../components/customer/OrderTimeline';
import { ConfirmationStatus, OrderStatus } from '../../types';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  navigate: (path: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderNumber = '', navigate }) => {
  const [orderNumber, setOrderNumber] = useState<string>(() => {
    if (initialOrderNumber) return initialOrderNumber;
    const params = new URLSearchParams(window.location.search);
    return params.get('orderNumber') || '';
  });
  const [phone, setPhone] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('phone') || '';
  });

  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    customerName: string;
    confirmationStatus: ConfirmationStatus;
    orderStatus: OrderStatus;
    requestedDate?: string;
    total: number;
    deliveryArea: string;
    items?: Array<{
      productName: string;
      quantity: number;
      unit: string;
      totalPrice: number;
      imageUrl?: string;
    }>;
    timeline?: Array<{
      status: OrderStatus;
      date: string;
      message?: string;
    }>;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeTrack = async (orderNum: string, ph: string) => {
    setError(null);
    setOrderData(null);

    if (!orderNum.trim()) {
      setError('Please enter your Pre-Order ID (e.g. UP-20260816-ABCDE).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/preorders/track?orderNumber=${encodeURIComponent(orderNum.trim())}&phone=${encodeURIComponent(ph.trim())}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No matching pre-order found. Please verify your Order ID and Mobile number.');
      }

      setOrderData(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to find pre-order.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramOrderNum = params.get('orderNumber');
    const paramPhone = params.get('phone') || '';
    if (paramOrderNum) {
      setOrderNumber(paramOrderNum);
      if (paramPhone) setPhone(paramPhone);
      executeTrack(paramOrderNum, paramPhone);
    }
  }, []);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter your Pre-Order ID.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter the 10-digit mobile number used during pre-order.');
      return;
    }
    executeTrack(orderNumber, phone);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full font-serif">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-time Status</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-stone-900 font-serif">
          Track Your Pre-Order
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Enter your Order ID and registered mobile number to view production and delivery timeline.
        </p>
      </div>

      {/* Tracking Form */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs max-w-2xl mx-auto">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Order ID *
              </label>
              <input
                id="track-order-number-input"
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. UP-10102"
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Registered Mobile Number *
              </label>
              <input
                id="track-phone-input"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9839012345"
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
              />
            </div>
          </div>

          <button
            id="track-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-95 disabled:bg-stone-300 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching Orders...</span>
              </div>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Pre-Order Status</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Results */}
      {orderData && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <span className="text-[11px] text-stone-500 font-medium uppercase tracking-wider block">
                Pre-Order Number
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-amber-950">
                {orderData.orderNumber}
              </h2>
              <div className="text-xs text-stone-600 mt-0.5">
                Customer: <strong>{orderData.customerName}</strong>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1 text-xs">
              <div className="flex items-center gap-1.5 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>{orderData.deliveryArea}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Requested Delivery: <strong>{orderData.requestedDate || 'Batch schedule'}</strong></span>
              </div>
              <div className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md mt-1">
                Advance Paid: ₹0 (Pre-Order Request)
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif">
              Order Status Timeline
            </h3>
            <OrderTimeline
              orderStatus={orderData.orderStatus}
              confirmationStatus={orderData.confirmationStatus}
              history={orderData.timeline}
            />
          </div>

          {/* Pre-Order Items List */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="border-t border-stone-100 pt-6 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 font-serif">
                Reserved Items
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orderData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 font-serif">{item.productName}</h4>
                      <div className="text-[11px] text-stone-500">
                        {item.quantity} × {item.unit} • ₹{item.totalPrice}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
