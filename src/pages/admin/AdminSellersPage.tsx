import {
  Award,
  CheckCircle2,
  ChefHat,
  Filter,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Seller } from '../../types';

interface AdminSellersPageProps {
  navigate: (path: string) => void;
}

export const AdminSellersPage: React.FC<AdminSellersPageProps> = ({ navigate }) => {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Kanpur');
  const [area, setArea] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSellers = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [token]);

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          contactPerson,
          phone,
          city,
          area,
          fssaiNumber,
          notes,
          verificationStatus: 'VERIFIED',
          status: 'ACTIVE',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        // Reset form
        setName('');
        setContactPerson('');
        setPhone('');
        setArea('');
        setFssaiNumber('');
        setNotes('');
        fetchSellers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif">
            UP Food Makers & Halwai Collective
          </h1>
          <p className="text-xs text-stone-600">
            Verified local UP sweet and namkeen artisans partnering on demand batches.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New UP Maker</span>
        </button>
      </div>

      {/* Grid of Halwais */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-500">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading verified makers directory...
        </div>
      ) : sellers.length === 0 ? (
        <div className="py-16 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200">
          No food makers registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{s.verificationStatus}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">{s.name}</h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>
                      {s.area}, {s.city} (UP)
                    </span>
                  </p>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 text-xs space-y-1.5 text-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Lead Master:</span>
                    <span className="font-semibold text-stone-900">{s.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Direct Phone:</span>
                    <a href={`tel:${s.phone}`} className="font-mono text-amber-800 hover:underline">
                      +91 {s.phone}
                    </a>
                  </div>
                  {s.fssaiNumber && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-500">FSSAI Lic:</span>
                      <span className="font-mono text-stone-700">{s.fssaiNumber}</span>
                    </div>
                  )}
                </div>

                {s.notes && (
                  <p className="text-xs text-stone-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-900/10 italic">
                    "{s.notes}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <span className="text-stone-400 font-mono text-[10px]">ID: {s.id}</span>
                <span className="text-emerald-700 font-semibold">Active Supplier</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Halwai Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 font-serif">
                Register Regional UP Halwai / Maker
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSeller} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Establishment / Sweet Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shukla Mishthan & Halwai Heritage"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Contact Person / Master Halwai *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Rameshwar Shukla"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9839012345"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">City in UP *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  >
                    <option value="Kanpur">Kanpur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Gorakhpur">Gorakhpur</option>
                    <option value="Prayagraj">Prayagraj</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Locality / Bazaar Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Birhana Road / Aminabad"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  FSSAI Food License Number (Optional)
                </label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  placeholder="e.g. 12722001000452"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Specialty Recipes & Craft Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Famous for Khoya Gujiya and pure cow ghee mathri."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
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
                  {submitting ? 'Registering...' : 'Save Maker Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
