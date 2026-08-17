import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
} from 'lucide-react';
import { useCustomerAuth, SignInButton, SignUpButton, UserButton } from '../../context/ClerkWrapper';
import { PreOrder } from '../../types';

interface AccountPageProps {
  navigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate }) => {
  const { isSignedIn, user, clerkUserId, signOut, signIn } = useCustomerAuth();
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual phone search if user is not signed in
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');

  const fetchOrders = async (params: { clerkUserId?: string; phone?: string; email?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params.clerkUserId) query.set('clerkUserId', params.clerkUserId);
      if (params.phone) query.set('phone', params.phone);
      if (params.email) query.set('email', params.email);

      const res = await fetch(`/api/customer/orders?${query.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load orders.');
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err: any) {
      setError('Could not retrieve orders. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && (clerkUserId || user?.email || user?.phone)) {
      fetchOrders({
        clerkUserId: clerkUserId || undefined,
        email: user?.email || undefined,
        phone: user?.phone || undefined,
      });
    } else {
      setLoading(false);
    }
  }, [isSignedIn, clerkUserId, user]);

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone && !lookupEmail) return;
    fetchOrders({ phone: lookupPhone, email: lookupEmail });
    if (lookupEmail || lookupPhone) {
      signIn({
        name: lookupEmail ? lookupEmail.split('@')[0] : 'Customer',
        email: lookupEmail,
        phone: lookupPhone,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pre-Order Placed (₹0 Paid)
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Phone className="w-3.5 h-3.5 text-blue-600" /> WhatsApp / Call Verified
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Batch Capacity Confirmed
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <Flame className="w-3.5 h-3.5 text-purple-600" /> Halwai Fresh Preparation
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <Package className="w-3.5 h-3.5 text-indigo-600" /> Packaged & Sealed
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
            <Truck className="w-3.5 h-3.5 text-orange-600" /> Out for Delivery
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Delivered
          </span>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-800 block mb-1">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            My Account & Pre-Orders
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Track real-time status of your traditional UP festive sweet and snack reservations.
          </p>
        </div>

        {isSignedIn && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-900">{user?.name || 'Customer'}</p>
              <p className="text-xs text-stone-500">{user?.email || user?.phone || 'Verified Account'}</p>
            </div>
            <button
              id="account-signout-btn"
              onClick={signOut}
              className="ml-2 p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!isSignedIn ? (
        /* Sign-in prompt / lookup banner */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Clerk Auth Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 sm:p-8 rounded-2xl border border-amber-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-md">
                <ShieldCheck className="w-6 h-6 text-amber-100" />
              </div>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                Sign In with Clerk
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                Sign in securely to view all your pre-orders, manage delivery addresses, and stay updated on halwai batch preparations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <SignInButton mode="modal">
                <button
                  id="clerk-signin-btn"
                  className="bg-amber-700 hover:bg-amber-800 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  id="clerk-signup-btn"
                  className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
                >
                  Create Account
                </button>
              </SignUpButton>
            </div>
          </div>

          {/* Quick Phone Lookup Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
            <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
              Quick Pre-Order Lookup
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Placed a pre-order as a guest? Look up your orders using your mobile number.
            </p>
            <form onSubmit={handleManualLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">
                    +91
                  </span>
                  <input
                    id="lookup-phone-input"
                    type="tel"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder="98390 12345"
                    className="w-full pl-12 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition"
                  />
                </div>
              </div>
              <button
                id="lookup-submit-btn"
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>Find My Pre-Orders</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Orders List Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            <span>Pre-Order History</span>
            <span className="text-xs font-sans font-normal text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </span>
          </h2>

          {isSignedIn && (
            <button
              id="refresh-orders-btn"
              onClick={() =>
                fetchOrders({
                  clerkUserId: clerkUserId || undefined,
                  email: user?.email || undefined,
                  phone: user?.phone || undefined,
                })
              }
              className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-stone-500">Loading your pre-orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to load orders</p>
              <p className="text-red-700 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">
              No Pre-Orders Found
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              You haven&apos;t placed any festival food reservations yet. Explore authentic Uttar Pradesh sweets and savories crafted by verified local makers with ₹0 advance payment.
            </p>
            <button
              id="empty-explore-snacks-btn"
              onClick={() => navigate('/products')}
              className="bg-amber-700 hover:bg-amber-800 text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow-sm transition inline-flex items-center gap-2"
            >
              <span>Explore Traditional Snacks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Orders Cards */
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-amber-300 transition-all overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-6 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold font-mono text-amber-950">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      id={`track-order-btn-${order.orderNumber}`}
                      onClick={() => navigate(`/track-order?orderNumber=${order.orderNumber}`)}
                      className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Track</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </button>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Items List */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                      Pre-Ordered Items
                    </h4>
                    <div className="divide-y divide-stone-100">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {item.product?.imageUrl || (item as any).imageUrl ? (
                              <img
                                src={item.product?.imageUrl || (item as any).imageUrl}
                                alt={item.product?.name || (item as any).productName}
                                className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                                UP
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-stone-900">
                                {item.product?.name || (item as any).productName || 'Traditional Item'}
                              </p>
                              <p className="text-xs text-stone-500">
                                Qty: {item.quantity} × {item.product?.unit || (item as any).unit || '500g'} (₹{item.unitPrice || 0}/unit)
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-stone-900">
                            ₹{item.totalPrice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery & Billing Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-xs">
                    {/* Delivery Address */}
                    <div className="bg-stone-50 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>Delivery Address</span>
                      </div>
                      <p className="text-stone-700 font-medium">{order.customerName}</p>
                      <p className="text-stone-600">
                        {order.address?.addressLine}, {order.address?.area}, {order.address?.city} - {order.address?.pincode}
                      </p>
                      <p className="text-stone-500 font-mono">Mobile: {order.customerPhone}</p>
                    </div>

                    {/* Delivery Slot & Advance Payment Info */}
                    <div className="bg-amber-50/60 p-3.5 rounded-xl space-y-1 border border-amber-200/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                          <Calendar className="w-3.5 h-3.5 text-amber-800" />
                          <span>Delivery Schedule</span>
                        </div>
                        <p className="text-stone-700 font-medium mt-1">
                          {order.requestedDate || order.deliverySlot?.date || 'Batch Scheduled'}
                          {order.deliverySlot && ` (${order.deliverySlot.startTime} - ${order.deliverySlot.endTime})`}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between">
                        <span className="text-stone-600">Total Order Value:</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-stone-900">₹{order.total}</span>
                          <span className="block text-[10px] text-emerald-700 font-semibold">
                            (₹0 Advance Paid • Pay on Confirmation)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
