import {
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  HelpCircle,
  MapPin,
  MessageCircle,
  MoreVertical,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Store,
  User,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationStatus, OrderStatus, PreOrder, Seller } from '../../types';

interface AdminOrdersPageProps {
  navigate: (path: string) => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ navigate }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');

  // Selected Order for Detail Drawer / Modal
  const [selectedOrder, setSelectedOrder] = useState<PreOrder | null>(null);
  const [statusModalOrder, setStatusModalOrder] = useState<PreOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('CONFIRMED');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // WhatsApp Message Composer Modal
  const [waModalOrder, setWaModalOrder] = useState<PreOrder | null>(null);
  const [waCustomMessage, setWaCustomMessage] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        status: statusFilter,
        city: cityFilter,
        search,
      });

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json && (json.success || json.orders || json.data)) {
        const orderList = json.data?.orders || json.orders || (Array.isArray(json.data) ? json.data : []);
        const totalCount = json.data?.total ?? json.total ?? orderList.length;
        const totalPageCount = json.data?.totalPages ?? json.totalPages ?? 1;
        setOrders(orderList);
        setTotal(totalCount);
        setTotalPages(totalPageCount);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const res = await fetch('/api/admin/sellers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setSellers(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSellers();
  }, [page, statusFilter, cityFilter, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalOrder) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/orders/${statusModalOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Status changed to ${newStatus}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusModalOrder(null);
        setStatusNote('');
        fetchOrders();
        if (selectedOrder && selectedOrder.id === statusModalOrder.id) {
          setSelectedOrder(json.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendWhatsAppLog = async (order: PreOrder) => {
    const defaultMsg = `Namaste ${order.customerName}! We have received your pre-order ${order.orderNumber} for ${order.address?.city}. Your fresh batch is scheduled with pure desi ghee halwais. Please reply YES to confirm your delivery slot.`;
    const messageToSend = waCustomMessage || defaultMsg;

    try {
      // 1. Log in DB
      await fetch(`/api/admin/orders/${order.id}/communication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel: 'WHATSAPP',
          message: messageToSend,
          status: 'SENT',
        }),
      });

      // 2. Open WhatsApp Web
      const cleanPhone = order.customerPhone.replace(/\D/g, '').slice(-10);
      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(messageToSend)}`;
      window.open(waUrl, '_blank');

      setWaModalOrder(null);
      setWaCustomMessage('');
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'CONTACTED':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'PREPARING':
        return 'bg-amber-500/20 text-amber-900 border-amber-400';
      case 'READY':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'OUT_FOR_DELIVERY':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'DELIVERED':
        return 'bg-stone-100 text-stone-800 border-stone-300';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif">
            Pre-Orders Queue & Verification
          </h1>
          <p className="text-xs text-stone-600">
            Verify ₹0 pre-orders via WhatsApp, commission Halwais, and manage deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # (UP-10101), Customer Name, or Phone..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New (Uncontacted)</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing at Halwai</option>
            <option value="READY">Ready / Packed</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
          >
            <option value="ALL">All Cities</option>
            <option value="Kanpur">Kanpur</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Varanasi">Varanasi</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone-500">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading pre-orders queue...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-2">
            <Package className="w-8 h-8 text-stone-300 mx-auto" />
            <p>No pre-orders match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-mono text-[10px] uppercase">
                  <th className="py-3.5 px-4 font-medium">Order # / Date</th>
                  <th className="py-3.5 px-4 font-medium">Customer & Contact</th>
                  <th className="py-3.5 px-4 font-medium">Items Requested</th>
                  <th className="py-3.5 px-4 font-medium">Location</th>
                  <th className="py-3.5 px-4 font-medium">Value</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/70 transition">
                    {/* Order # */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="font-bold text-amber-900 hover:underline font-mono text-xs block text-left"
                      >
                        {o.orderNumber}
                      </button>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 min-w-[180px]">
                      <span className="font-semibold text-stone-900 block text-xs">{o.customerName}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${o.customerPhone}`}
                          className="text-[11px] text-amber-900 hover:text-amber-700 font-mono font-semibold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60"
                          title="Call Mobile"
                        >
                          <Phone className="w-3 h-3 text-amber-700" />
                          +91 {o.customerPhone}
                        </a>
                      </div>
                      {o.customerEmail && (
                        <span className="text-[10px] text-stone-400 block truncate mt-0.5 max-w-[170px]">
                          {o.customerEmail}
                        </span>
                      )}
                    </td>

                    {/* Items Requested */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="space-y-1.5">
                        {o.items?.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-stone-800 bg-stone-50 p-1.5 rounded-lg border border-stone-200/60">
                            {it.product?.imageUrl && (
                              <img
                                src={it.product.imageUrl}
                                alt=""
                                className="w-6 h-6 rounded object-cover shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/products/mawa-gujiya.jpg';
                                }}
                              />
                            )}
                            <div className="flex-1 truncate">
                              <span className="font-bold text-amber-950">{it.quantity}x</span>{' '}
                              <span className="font-medium">{it.product?.name || 'Traditional Delicacy'}</span>
                            </div>
                            <span className="font-mono text-[10px] text-stone-500 font-semibold">
                              ₹{it.totalPrice}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Full Customer Address & Location */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-stone-900 text-xs">
                          <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{o.address?.city || 'Kanpur'}</span>
                          <span className="text-[10px] text-stone-400 font-mono">({o.address?.pincode})</span>
                        </div>
                        <p className="text-[11px] text-stone-700 font-medium leading-tight">
                          {o.address?.addressLine || 'Address not specified'}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          {o.address?.area}
                        </p>
                        {o.address?.deliveryInstructions && (
                          <p className="text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded italic">
                            Note: {o.address.deliveryInstructions}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-900 block font-serif">
                        ₹{o.total.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        ₹0 Adv
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          o.orderStatus
                        )}`}
                      >
                        {o.orderStatus.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Quick Trigger */}
                        <button
                          onClick={() => {
                            setWaModalOrder(o);
                            setWaCustomMessage(
                              `Namaste ${o.customerName}! We received your pre-order ${o.orderNumber} for ${o.address?.city}. Your fresh batch is scheduled with authentic pure desi ghee halwais. Please reply YES to confirm your delivery slot.`
                            );
                          }}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                          title="Contact via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Status Change Button */}
                        <button
                          onClick={() => {
                            setStatusModalOrder(o);
                            setNewStatus(o.orderStatus);
                            setStatusNote('');
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold transition"
                        >
                          Update Status
                        </button>

                        {/* View Drawer */}
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                          title="View order timeline and details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              Showing page {page} of {totalPages} ({total} total pre-orders)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Status Update Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Update Status: {statusModalOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-500">{statusModalOrder.customerName}</p>
              </div>
              <button
                onClick={() => setStatusModalOrder(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-xs font-semibold"
                >
                  <option value="NEW">NEW (Awaiting verification)</option>
                  <option value="CONTACTED">CONTACTED (WhatsApp / Call sent)</option>
                  <option value="CONFIRMED">CONFIRMED (Customer verified batch)</option>
                  <option value="PREPARING">PREPARING (Cooking at Halwai)</option>
                  <option value="READY">READY (Packaged in airtight boxes)</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (With dispatch rider)</option>
                  <option value="DELIVERED">DELIVERED (Completed)</option>
                  <option value="CANCELLED">CANCELLED (Declined by customer)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Internal Audit Log / Timeline Note
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Customer confirmed via WhatsApp. Assigned to Shukla Mishthan."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save & Log Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. WhatsApp Composer Modal */}
      {waModalOrder && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    WhatsApp Customer Outreach
                  </h3>
                  <p className="text-xs text-stone-500">
                    To: {waModalOrder.customerName} (+91 {waModalOrder.customerPhone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWaModalOrder(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-600">
                Sending this message will automatically mark the pre-order as <strong>CONTACTED</strong> and log the communication in the order audit history.
              </p>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Message Preview</label>
                <textarea
                  rows={4}
                  value={waCustomMessage}
                  onChange={(e) => setWaCustomMessage(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWaModalOrder(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppLog(waModalOrder)}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Full Order Drawer / Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white max-w-xl w-full h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-mono">
                  {selectedOrder.orderNumber}
                </span>
                <h2 className="text-xl font-bold text-stone-900 font-serif mt-1">
                  Pre-Order Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status overview */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-amber-900/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 block uppercase font-mono">
                  Current Status
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {selectedOrder.orderStatus.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => {
                  setStatusModalOrder(selectedOrder);
                  setNewStatus(selectedOrder.orderStatus);
                }}
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Change Status
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-stone-900 font-serif border-b border-stone-100 pb-1.5">
                Customer Information
              </h3>
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2 text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500">Name:</span>
                  <span className="font-bold text-stone-900">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Mobile:</span>
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="font-bold text-amber-800 hover:underline"
                  >
                    +91 {selectedOrder.customerPhone}
                  </a>
                </div>
                {selectedOrder.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Email:</span>
                    <span>{selectedOrder.customerEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery Address:</span>
                  <span className="text-right max-w-xs font-medium text-stone-900">
                    {selectedOrder.address?.addressLine}, {selectedOrder.address?.area},{' '}
                    {selectedOrder.address?.city} - {selectedOrder.address?.pincode}
                  </span>
                </div>
                {selectedOrder.address?.deliveryInstructions && (
                  <div className="flex justify-between text-amber-800 bg-amber-50 p-2 rounded-lg">
                    <span className="font-semibold">Instructions:</span>
                    <span className="text-right">
                      {selectedOrder.address.deliveryInstructions}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Ordered */}
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-stone-900 font-serif border-b border-stone-100 pb-1.5">
                Requested Snack Packs
              </h3>
              <div className="space-y-2">
                {selectedOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200"
                  >
                    <div className="flex items-center gap-3">
                      {it.product?.imageUrl && (
                        <img
                          src={it.product.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <span className="font-bold text-stone-900 block">
                          {it.product?.name || 'Festival Delicacy'}
                        </span>
                        <span className="text-stone-500 text-[11px]">
                          Qty: {it.quantity} x ₹{it.unitPrice} ({it.product?.unit || '500g'})
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 font-serif">
                      ₹{it.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex justify-between items-center text-xs font-bold text-stone-900">
                <span>Total Pre-Order Demand:</span>
                <span className="text-amber-900 text-sm font-serif">
                  ₹{selectedOrder.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Status History & Audit Log */}
            <div className="space-y-3 text-xs flex-1">
              <h3 className="font-bold text-stone-900 font-serif border-b border-stone-100 pb-1.5">
                Audit Timeline & Status History
              </h3>
              <div className="space-y-3">
                {selectedOrder.statusHistory?.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 font-mono">
                          {h.newStatus}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(h.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-stone-600 text-[11px] mt-0.5">{h.note}</p>
                      <span className="text-[10px] text-stone-400 italic">By: {h.changedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
