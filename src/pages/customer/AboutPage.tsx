import { ArrowRight, Award, CheckCircle, Flame, HeartHandshake, MapPin, Sparkles, Users } from 'lucide-react';
import React from 'react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full font-serif">
          Our Heritage & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-stone-900 font-serif">
          Preserving Uttar Pradesh's Culinary Soul
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Bringing year-round access to the finest festival sweets and snacks crafted by master halwais of UP.
        </p>
      </div>

      {/* Story section */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-stone-700 text-sm leading-relaxed">
        <h2 className="text-2xl font-bold text-stone-900 font-serif">
          Why "UP Festive Foods"?
        </h2>
        <p>
          In Uttar Pradesh, festive delicacies like <strong>Khoya Gujiya</strong>, <strong>Kali Mirch Mathri</strong>, <strong>Purvanchal Thekua</strong>, and <strong>Awadhi Balushahi</strong> are deeply tied to memories of family, festivals like Holi, Chhath, Diwali, and Teej, and evening chai gatherings.
        </p>
        <p>
          However, authentic preparations are traditionally made only during specific festivals. Outside those few days, commercial sweets sold in regular stores are often mass-produced, lack the pure desi ghee taste, or sit on shelves for weeks.
        </p>
        <p>
          <strong>UP Festive Foods</strong> was founded to bridge this gap through a sustainable demand validation model: by collecting pre-orders in advance, we allow heritage halwais from Kanpur, Lucknow, and Varanasi to prepare small, 100% fresh, pure batches all year round.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-amber-900/10 space-y-3">
          <Award className="w-8 h-8 text-amber-800" />
          <h3 className="text-lg font-bold text-stone-900 font-serif">Maker First</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We partner directly with traditional halwai families, giving them fair pricing and guaranteed batch sizes without middlemen.
          </p>
        </div>

        <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-amber-900/10 space-y-3">
          <Sparkles className="w-8 h-8 text-amber-800" />
          <h3 className="text-lg font-bold text-stone-900 font-serif">Purity Guarantee</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            All our recipes are crafted using pure dairy ghee, fresh mawa/khoya, and natural spices without artificial preservatives.
          </p>
        </div>

        <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-amber-900/10 space-y-3">
          <HeartHandshake className="w-8 h-8 text-amber-800" />
          <h3 className="text-lg font-bold text-stone-900 font-serif">Zero Waste</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every piece is made against a confirmed pre-order request, eliminating waste and keeping food fresh.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => navigate('/products')}
          className="px-8 py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-md transition"
        >
          Explore Regional UP Batches →
        </button>
      </div>
    </div>
  );
};
