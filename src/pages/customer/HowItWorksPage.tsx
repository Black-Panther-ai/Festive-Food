import {
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Clock,
  HeartHandshake,
  HelpCircle,
  MessageCircle,
  Package,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Users
} from 'lucide-react';
import React from 'react';

interface HowItWorksPageProps {
  navigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full font-serif">
          Demand Validation Model
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-stone-900 font-serif">
          How Pre-Order Works
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          We bring traditional Uttar Pradesh sweets and snacks directly from verified regional halwais with <strong>zero advance payment</strong>.
        </p>
      </div>

      {/* 4 In-Depth Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg font-serif">
            01
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-serif">
            Browse Authentic UP Recipes
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Explore authentic snacks like Khoya Gujiya, Mathri, Thekua, Balushahi, and Besan Laddoo. Each product lists its origin city (Kanpur, Lucknow, Varanasi), ingredients, and upcoming batch dates.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg font-serif">
            02
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-serif">
            Submit Pre-Order with ₹0 Payment
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Select your desired packs, select a delivery slot, and submit your contact and address details. <strong>No credit card, UPI, or advance deposit is needed.</strong>
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg font-serif">
            03
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-serif">
            WhatsApp / Call Confirmation
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Our operations coordinator contacts you to confirm the pre-order details. Once minimum batch demand is met, the food maker is commissioned for fresh production.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg font-serif">
            04
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-serif">
            Freshly Made & Delivered
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Sweets are prepared fresh in pure desi ghee 24–48 hours prior to delivery, packed in airtight freshness containers, and delivered to your doorstep.
          </p>
        </div>
      </div>

      {/* Why This Model is Better */}
      <div className="bg-[#FAF7F2] p-8 sm:p-12 rounded-3xl border border-amber-900/10 space-y-6">
        <h2 className="text-2xl font-bold text-stone-900 font-serif text-center">
          Why Demand-Based Pre-Ordering?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-700">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80">
            <span className="font-bold text-amber-900 block text-sm font-serif mb-1.5">
              100% Fresh, Never Stale
            </span>
            <p className="leading-relaxed">
              Standard retail sweets sit in shop counters for weeks. Pre-orders are cooked only after you order, guaranteeing peak taste and aroma.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80">
            <span className="font-bold text-amber-900 block text-sm font-serif mb-1.5">
              Zero Waste for Halwais
            </span>
            <p className="leading-relaxed">
              Local artisans face heavy losses from unsold festive stock. Our model gives them exact quantities in advance.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80">
            <span className="font-bold text-amber-900 block text-sm font-serif mb-1.5">
              Zero Financial Risk for You
            </span>
            <p className="leading-relaxed">
              You test and validate authentic regional flavors without risking money upfront.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-md transition"
          >
            Explore Snacks & Place ₹0 Pre-Order →
          </button>
        </div>
      </div>
    </div>
  );
};
