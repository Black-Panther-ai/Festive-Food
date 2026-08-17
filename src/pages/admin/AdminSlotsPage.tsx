import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DeliverySlot } from '../../types';

interface AdminSlotsPageProps {
  navigate: (path: string) => void;
}

export const AdminSlotsPage: React.FC<AdminSlotsPageProps> = ({ navigate }) => {
  const { token } = useAuth();
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [city, setCity] = useState('Kanpur');
  const [date, setDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('02:00 PM');
  const [pincodes, setPincodes] = useState('208001, 208002, 208005, 208012');
  const [capacity, setCapacity] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/delivery-slots', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setSlots(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [token]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/delivery-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city,
          date,
          startTime,
          endTime,
          pincodes,
          capacity: Number(capacity),
          status: 'ACTIVE',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        fetchSlots();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (slot: DeliverySlot) => {
    const nextStatus = slot.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/delivery-slots/${slot.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchSlots();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif">
            Delivery Slots & Capacity Control
          </h1>
          <p className="text-xs text-stone-600">
            Define festival delivery batches and PIN code coverage for Kanpur, Lucknow, and Varanasi.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Batch Slot</span>
        </button>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone-500">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading delivery slots...
          </div>
        ) : slots.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">
            No delivery slots configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-mono text-[10px] uppercase">
                  <th className="py-3.5 px-4 font-medium">City & Date</th>
                  <th className="py-3.5 px-4 font-medium">Time Window</th>
                  <th className="py-3.5 px-4 font-medium">Capacity Utilization</th>
                  <th className="py-3.5 px-4 font-medium">Covered PIN Codes</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {slots.map((slot) => {
                  const percent = Math.min(100, Math.round((slot.reservedCapacity / slot.capacity) * 100));
                  return (
                    <tr key={slot.id} className="hover:bg-stone-50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 block font-serif text-sm">
                          {slot.city}
                        </span>
                        <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {slot.date}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-stone-900">
                              {slot.reservedCapacity} / {slot.capacity} orders
                            </span>
                            <span className="text-stone-500 font-mono">{percent}%</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                percent >= 90
                                  ? 'bg-red-500'
                                  : percent >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-[11px] text-stone-600 font-mono line-clamp-2">
                          {slot.pincodes}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            slot.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : slot.status === 'FULL'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {slot.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(slot)}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold transition"
                        >
                          {slot.status === 'ACTIVE' ? 'Pause Slot' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Delivery Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 font-serif">
                Add Regional Delivery Batch Slot
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Target City *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 font-semibold"
                  >
                    <option value="Kanpur">Kanpur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Gorakhpur">Gorakhpur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 02:00 PM"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Batch Order Capacity (Maximum Pre-Orders) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={200}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Serviceable Postal PIN Codes (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={pincodes}
                  onChange={(e) => setPincodes(e.target.value)}
                  placeholder="e.g. 208001, 208002, 208005, 208012"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Delivery Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
