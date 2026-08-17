import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChefHat,
  Clock,
  DollarSign,
  MapPin,
  MessageCircle,
  Package,
  PhoneCall,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsData } from '../../types';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
  onSelectTab: (tab: 'dashboard' | 'orders' | 'products' | 'sellers' | 'slots' | 'reviews') => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  navigate,
  onSelectTab,
}) => {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Failed to load analytics.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const handleResetData = async () => {
    if (!window.confirm('Reset all demo orders and inventory back to clean initial state?')) {
      return;
    }
    try {
      setResetting(true);
      const res = await fetch('/api/admin/reset-demo-data', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        await fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500">Calculating real-time UP Demand Validation metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 p-6 rounded-3xl border border-red-200 text-center space-y-3">
        <p className="text-xs text-red-700">{error || 'Unable to display dashboard.'}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics, ordersByProduct, ordersByPin, ordersByDay, demandByDeliveryDate } = data;

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-mono">
              Live Validation Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif mt-1">
            Uttar Pradesh Festive Pre-Order Analytics
          </h1>
          <p className="text-xs text-stone-600">
            Real-time customer interest tracking, confirmation rates, and maker batch allocation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Reset to fresh demo state"
          >
            <span>{resetting ? 'Resetting...' : 'Reset Demo Seed'}</span>
          </button>

          <button
            onClick={() => onSelectTab('orders')}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <span>Open Pre-Orders Queue ({metrics.newOrders} New)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Demand Volume */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Total Pre-Orders Placed</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              {metrics.totalPreOrders}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              ₹0 advance pre-orders logged
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-amber-800 font-semibold">{metrics.newOrders} Uncontacted</span>
            <span className="text-stone-400">Total volume</span>
          </div>
        </div>

        {/* Metric 2: Requested vs Confirmed GMV */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Demand Value (GMV)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              ₹{metrics.totalRequestedGMV.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              ₹{metrics.confirmedGMV.toLocaleString('en-IN')} confirmed for batch
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-stone-600">AOV: ₹{metrics.averageOrderValue}</span>
            <span className="text-emerald-700 font-semibold">
              {metrics.confirmationRate}% validated
            </span>
          </div>
        </div>

        {/* Metric 3: Confirmation / Conversion Rate */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">WhatsApp Confirmation</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              {metrics.confirmationRate}%
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {metrics.confirmedOrders} confirmed / {metrics.totalPreOrders} pre-orders
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-stone-500">{metrics.cancelledOrders} declined / cancelled</span>
            <span className="text-stone-400">{metrics.cancellationRate}% drop</span>
          </div>
        </div>

        {/* Metric 4: Customer Retention */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Unique Customers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              {metrics.totalCustomers}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {metrics.repeatCustomerRate}% repeat festival pre-orders
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-purple-700 font-semibold">{metrics.deliveredOrders} Delivered</span>
            <span className="text-stone-400">Total reach</span>
          </div>
        </div>
      </div>

      {/* Operational Status Pipeline Badges */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 font-serif">
            Fulfillment & Confirmation Pipeline
          </h3>
          <span className="text-xs text-stone-500">
            Click any status in the orders queue to update
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-amber-800 block font-mono">
              New Pre-Orders
            </span>
            <span className="text-xl font-bold text-amber-950 font-serif mt-0.5 block">
              {metrics.newOrders}
            </span>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-blue-800 block font-mono">
              Contacted
            </span>
            <span className="text-xl font-bold text-blue-950 font-serif mt-0.5 block">
              {metrics.contactedOrders}
            </span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block font-mono">
              Confirmed
            </span>
            <span className="text-xl font-bold text-emerald-950 font-serif mt-0.5 block">
              {metrics.confirmedOrders}
            </span>
          </div>

          <div className="p-3 bg-amber-100/50 border border-amber-300 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-amber-900 block font-mono">
              At Halwai Prep
            </span>
            <span className="text-xl font-bold text-amber-950 font-serif mt-0.5 block">
              {metrics.preparingOrders}
            </span>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-800 block font-mono">
              Packaged / Ready
            </span>
            <span className="text-xl font-bold text-indigo-950 font-serif mt-0.5 block">
              {metrics.readyOrders}
            </span>
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-teal-800 block font-mono">
              Out for Delivery
            </span>
            <span className="text-xl font-bold text-teal-950 font-serif mt-0.5 block">
              {metrics.outForDeliveryOrders}
            </span>
          </div>

          <div className="p-3 bg-stone-100 border border-stone-200 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-stone-700 block font-mono">
              Delivered
            </span>
            <span className="text-xl font-bold text-stone-900 font-serif mt-0.5 block">
              {metrics.deliveredOrders}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Product Demand vs Geographic Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Product Demand Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 font-serif">
              Top Product Demand (Units & GMV)
            </h3>
            <span className="text-xs text-stone-500">By quantity requested</span>
          </div>

          {ordersByProduct.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">No product data logged yet.</p>
          ) : (
            <div className="space-y-3.5">
              {ordersByProduct.map((p, idx) => {
                const maxQty = Math.max(...ordersByProduct.map((i) => i.quantity), 1);
                const percent = Math.round((p.quantity / maxQty) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800 truncate">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-900">{p.quantity} packs</span>
                        <span className="text-stone-400">|</span>
                        <span className="text-stone-600">₹{p.gmv.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Regional / PIN Code Demand Heatmap */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 font-serif">
              City & PIN Code Demand Concentration
            </h3>
            <span className="text-xs text-stone-500">For route planning</span>
          </div>

          {ordersByPin.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">No location data logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-500 font-mono text-[10px] uppercase">
                    <th className="pb-2 font-medium">City / PIN</th>
                    <th className="pb-2 font-medium">Pre-Orders</th>
                    <th className="pb-2 font-medium">Demand GMV</th>
                    <th className="pb-2 font-medium text-right">Route Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {ordersByPin.map((pin, i) => (
                    <tr key={i} className="hover:bg-stone-50 transition">
                      <td className="py-2.5 font-semibold text-stone-900 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>
                          {pin.city} ({pin.pincode})
                        </span>
                      </td>
                      <td className="py-2.5 text-stone-700">{pin.count} requests</td>
                      <td className="py-2.5 font-medium text-stone-900">
                        ₹{pin.gmv.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium text-[10px]">
                          Active Hub
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
