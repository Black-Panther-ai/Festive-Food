import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Flame,
  HeartHandshake,
  HelpCircle,
  MapPin,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ProductCard } from '../../components/customer/ProductCard';
import { Product, Review } from '../../types';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [thisWeekProducts, setThisWeekProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/reviews'),
        ]);

        if (prodRes.ok) {
          const pData = await prodRes.json();
          const list: Product[] = pData.data || [];
          setPopularProducts(list.slice(0, 4));
          setThisWeekProducts(list.filter((p) => p.status === 'ACTIVE').slice(0, 6));
        }

        if (revRes.ok) {
          const rData = await revRes.json();
          setReviews(rData.data || []);
        }
      } catch (err) {
        console.error('Failed to load home page products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const faqs = [
    {
      q: 'Why is there ₹0 payment required when placing a pre-order?',
      a: 'UP Festive Foods is a demand validation marketplace. Instead of mass-producing sweets that sit on shelves, our partner halwais prepare fresh batches only after reaching minimum batch demand. We will contact you on WhatsApp or phone to confirm details before fresh production starts.',
    },
    {
      q: 'When do I pay for my festival snacks?',
      a: 'Payment details are coordinated during your confirmation call or at the time of delivery/dispatch according to the verified maker terms. You never pay anything upfront to submit your interest.',
    },
    {
      q: 'Which cities and PIN codes do you currently serve in Uttar Pradesh?',
      a: 'We currently run regular delivery slots across Kanpur, Lucknow, Varanasi, and select Gorakhpur PIN codes. You can select your city and preferred delivery window during pre-order checkout.',
    },
    {
      q: 'Are the sweets and snacks fresh or stored for long periods?',
      a: '100% freshly crafted on demand! Because we operate exclusively on scheduled pre-orders, our master halwais prepare each batch in pure desi ghee 24–48 hours before your chosen delivery date.',
    },
    {
      q: 'Can I cancel or modify my pre-order request?',
      a: 'Yes, absolutely. Since no advance payment is taken, you can cancel or update your quantity when our team contacts you for confirmation, or by contacting our operations support.',
    },
    {
      q: 'How are the makers and halwais verified?',
      a: 'All our regional makers undergo FSSAI hygiene verification, pure ingredient auditing, and taste certification before listing batches on our platform.',
    },
  ];

  const upRegions = [
    {
      city: 'Kanpur',
      specialty: 'Khoya Gujiya & Kali Mirch Mathri',
      desc: 'Famous Birhana Road halwai recipes slow-fried in pure desi ghee.',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    },
    {
      city: 'Lucknow',
      specialty: 'Shahi Balushahi & Besan Laddoo',
      desc: 'Awadhi heritage confections steeped in fragrant saffron and kewra.',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
    },
    {
      city: 'Varanasi',
      specialty: 'Purvanchal Gur Thekua & Namak Para',
      desc: 'Traditional wood-pressed festive jaggery thekuas and crispy chai companions.',
      image: 'https://images.unsplash.com/photo-1605197584547-c93ed1a73373?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-[#FDFBF7] to-[#FDFBF7] pt-8 sm:pt-16 pb-12 sm:pb-20 border-b border-amber-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Uttar Pradesh Traditional Delicacies • Zero Advance ₹0</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 font-serif tracking-tight leading-[1.15]">
                Festival ka taste, <br className="hidden sm:inline" />
                <span className="text-amber-800 underline decoration-amber-300 decoration-wavy decoration-2">
                  ab saal bhar.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                UP ke traditional sweets aur snacks — local makers se, pre-order karein aur apne favourite festive flavours ka mazaa kabhi bhi lein.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  id="hero-explore-btn"
                  onClick={() => navigate('/products')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-base shadow-md shadow-amber-900/20 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <span>Explore Snacks</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-how-it-works-btn"
                  onClick={() => navigate('/how-it-works')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-medium text-base border border-stone-300 shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span>How It Works</span>
                </button>
              </div>

              {/* Feature Badges */}
              <div className="pt-4 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="bg-white/80 p-3 rounded-xl border border-stone-200 shadow-xs">
                  <div className="font-bold text-amber-900 text-sm font-serif">₹0 Advance</div>
                  <div className="text-[11px] text-stone-700 leading-tight mt-0.5">Pay after batch confirmation</div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-stone-200 shadow-xs">
                  <div className="font-bold text-amber-900 text-sm font-serif">Pure Desi Ghee</div>
                  <div className="text-[11px] text-stone-700 leading-tight mt-0.5">Authentic halwai recipe</div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-stone-200 shadow-xs">
                  <div className="font-bold text-amber-900 text-sm font-serif">Fresh Batches</div>
                  <div className="text-[11px] text-stone-700 leading-tight mt-0.5">Crafted for scheduled slots</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-amber-900/10 p-3 rounded-3xl backdrop-blur-sm border border-amber-900/20">
                <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-100 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80"
                    alt="Traditional UP Festival Gujiya"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                      Signature Batch
                    </span>
                    <h3 className="text-xl font-bold font-serif">Kanpur Traditional Gujiya</h3>
                    <p className="text-xs text-stone-300 mt-0.5">
                      Slow-roasted Khoya & dry fruit filling in crisp pastry
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-amber-200">₹349 / 500g</span>
                      <button
                        onClick={() => navigate('/products/traditional-gujiya-kanpur')}
                        className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg text-white transition"
                      >
                        Pre-Order ₹0 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Snacks Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-serif">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif mt-1">
              Popular Traditional Snacks
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Authentic Uttar Pradesh recipes loved by generations.
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-sm font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 shrink-0"
          >
            <span>View Complete Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(slug) => navigate(`/products/${slug}`)}
                onPreOrderDirect={() => navigate(`/products/${product.slug}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Available This Week (Batch Availability) */}
      <section className="bg-amber-50/50 border-y border-amber-900/10 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-2">
              Fresh Scheduled Slots
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              Available For Pre-Order This Week
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Local makers have confirmed capacity for the following batches. Pre-orders close when capacity is reached.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {thisWeekProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(slug) => navigate(`/products/${slug}`)}
                onPreOrderDirect={() => navigate(`/products/${product.slug}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. UP Specialties (Regional Heritage) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-serif">
            Regional Heritage
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif mt-1">
            Uttar Pradesh Specialties
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Every district in Uttar Pradesh has distinct culinary traditions. We source directly from the master artisans of each city.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upRegions.map((region) => (
            <div
              key={region.city}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition group"
            >
              <div className="aspect-16/9 w-full overflow-hidden bg-stone-100">
                <img
                  src={region.image}
                  alt={region.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{region.city}</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900 font-serif mt-1">{region.specialty}</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{region.desc}</p>
                <button
                  onClick={() => navigate(`/products?city=${region.city.toLowerCase()}`)}
                  className="mt-4 text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>Explore {region.city} Batches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How Pre-order Works (4 Steps) */}
      <section className="bg-stone-900 text-stone-200 py-14 sm:py-20 rounded-3xl max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Clear & Transparent Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
            How Pre-Order Works
          </h2>
          <p className="text-sm text-stone-400 mt-2">
            No advance payment, zero risk, freshly prepared festival snacks directly to your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-stone-800/70 border border-stone-700/60 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-white font-serif">Browse & Select</h3>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
              Explore traditional UP sweets and snacks. Choose your quantity and preferred delivery slot.
            </p>
          </div>

          <div className="bg-stone-800/70 border border-stone-700/60 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-white font-serif">Submit Pre-Order (₹0)</h3>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
              Enter your name, mobile number, and address. No advance payment or card details required.
            </p>
          </div>

          <div className="bg-stone-800/70 border border-stone-700/60 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-white font-serif">WhatsApp Confirmation</h3>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
              Our operations team contacts you on WhatsApp/Call to confirm your batch and address.
            </p>
          </div>

          <div className="bg-stone-800/70 border border-stone-700/60 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-white font-serif">Fresh Delivery</h3>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
              The verified local halwai prepares the batch fresh and it is delivered in your scheduled window.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Why Order From Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-serif">
            The UP Festive Difference
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif mt-1">
            Why Order From UP Festive Foods
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">Authentic Halwai Recipes</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              We work directly with established regional halwais who have mastered traditional recipes over decades using pure ingredients.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">Zero Food Waste Model</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Pre-ordering enables makers to cook the exact required quantity, eliminating unsold inventory and ensuring maximum freshness.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">FSSAI & Quality Audited</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Every participating kitchen holds verifiable food safety registration and follows clean food packaging protocols.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews Section (Only real reviews from database or clean empty state) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-serif">
            Community Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif mt-1">
            Customer Reviews
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center max-w-md mx-auto">
            <MessageCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-stone-800 font-serif">No Reviews Yet</h4>
            <p className="text-xs text-stone-500 mt-1">
              Be among the first to pre-order fresh batches and leave your verified review after delivery!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-700 italic leading-relaxed">"{rev.comment}"</p>
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-800">{rev.customerName}</span>
                  <span>Verified Pre-Order</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-serif">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left p-4 sm:p-5 font-semibold text-stone-900 text-sm sm:text-base flex items-center justify-between gap-3 hover:text-amber-800 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-amber-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
