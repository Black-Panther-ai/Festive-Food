import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  HeartHandshake,
  Info,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Product, Review } from '../../types';

interface ProductDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, navigate }) => {
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState<boolean>(false);
  const [newReviewName, setNewReviewName] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          throw new Error('Product not found.');
        }
        const data = await res.json();
        setProduct(data.data);
        setReviews(data.data?.reviews || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-6 aspect-4/3 bg-stone-200 rounded-3xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-200 rounded w-1/2" />
            <div className="h-24 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-rose-900 font-serif">Product Not Found</h2>
          <p className="text-xs text-rose-700 mt-2">{error || 'The requested UP sweet or snack is unavailable.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-5 px-5 py-2.5 bg-amber-700 text-white rounded-xl text-xs font-semibold hover:bg-amber-800 transition"
          >
            ← Back to All Snacks
          </button>
        </div>
      </div>
    );
  }

  const isSoldOut = product.status === 'SOLD_OUT' || product.availableQuantity <= 0;
  const inCart = items.some((i) => i.product.id === product.id);

  const handlePreOrderNow = () => {
    if (isSoldOut) return;
    addItem(product, quantity);
    navigate('/preorder');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewComment) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: newReviewName,
          rating: newReviewRating,
          comment: newReviewComment,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [data.data, ...prev]);
        setReviewSuccess(true);
        setReviewFormOpen(false);
        setNewReviewComment('');
        setNewReviewName('');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <button
        onClick={() => navigate('/products')}
        className="text-xs font-semibold text-stone-600 hover:text-amber-800 flex items-center gap-1.5 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Snacks</span>
      </button>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Product Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 sm:aspect-1/1 w-full bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.city && (
              <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-amber-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Origin: {product.city}, UP</span>
              </div>
            )}
            <div className="absolute top-4 right-4">
              {isSoldOut ? (
                <span className="bg-stone-900/90 text-stone-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Batch Full / Sold Out
                </span>
              ) : (
                <span className="bg-emerald-700/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Batch Open • {product.availableQuantity} Slots Left
                </span>
              )}
            </div>
          </div>

          {/* Value Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
              <span className="font-bold text-amber-950 block font-serif">₹0 Advance</span>
              <span className="text-[10px] text-amber-800 mt-0.5 block">Zero risk pre-order</span>
            </div>
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
              <span className="font-bold text-amber-950 block font-serif">Pure Ingredients</span>
              <span className="text-[10px] text-amber-800 mt-0.5 block">Desi ghee recipe</span>
            </div>
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
              <span className="font-bold text-amber-950 block font-serif">Airtight Sealed</span>
              <span className="text-[10px] text-amber-800 mt-0.5 block">Hygiene guaranteed</span>
            </div>
          </div>
        </div>

        {/* Right: Product Information & Pre-order Action */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1 font-serif">
              <span>{product.category?.name || 'Traditional UP Sweet'}</span>
              <span>•</span>
              <span>{product.weight || product.unit}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-stone-900 font-serif leading-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-950 font-serif">₹{product.price}</span>
              <span className="text-sm text-stone-500 font-medium">per {product.unit || '500g'}</span>
              {product.approxPieces && (
                <span className="text-xs text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full font-medium ml-2">
                  Approx. {product.approxPieces}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-stone-700 leading-relaxed border-t border-b border-stone-200 py-4">
            {product.description}
          </div>

          {/* Production & Delivery Schedule Card */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-amber-900/10 space-y-2.5 text-xs text-stone-700">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900">Target Delivery Batches: </span>
                <span>{product.deliveryDates || 'Upcoming weekend delivery'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900">Pre-Order Deadline: </span>
                <span>
                  {new Date(product.preOrderDeadline).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ChefHat className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900">Maker Heritage: </span>
                <span>Prepared by verified regional halwai partners following traditional craft.</span>
              </div>
            </div>
          </div>

          {/* Pre-Order Action Panel */}
          <div className="bg-white p-5 rounded-2xl border border-amber-800/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Select Quantity ({product.unit || '500g'} packs):</span>
              <div className="flex items-center gap-2 border border-stone-200 rounded-xl p-1 bg-stone-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100 disabled:opacity-40"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-bold text-stone-900 text-sm font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.availableQuantity || 10, q + 1))}
                  disabled={quantity >= (product.availableQuantity || 10) || isSoldOut}
                  className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100 disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Total Estimated Value & Advance Note */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
              <span className="text-stone-500">Total Order Value:</span>
              <span className="font-bold text-stone-900 text-sm">₹{product.price * quantity}</span>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>₹0 Payment required now.</strong> We will contact you on WhatsApp/call before production starts to confirm your pre-order.
              </span>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="preorder-now-btn"
                onClick={handlePreOrderNow}
                disabled={isSoldOut}
                className="flex-1 py-3.5 px-6 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-95 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-amber-900/20 transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isSoldOut ? 'Batch Full' : 'Pre-Order Now (₹0 Advance)'}</span>
              </button>

              <button
                id="add-to-cart-btn"
                onClick={() => addItem(product, quantity)}
                disabled={isSoldOut}
                className="py-3.5 px-5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm border border-stone-300 transition flex items-center justify-center gap-1.5"
              >
                {inCart ? <Check className="w-4 h-4 text-amber-800" /> : <Plus className="w-4 h-4" />}
                <span>{inCart ? 'Added' : 'Add to Pre-Order'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Regulatory Details */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-bold text-stone-900 font-serif border-b border-stone-100 pb-3">
          Ingredients, Shelf Life & Storage
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700">
          <div className="space-y-4">
            <div>
              <span className="font-bold text-stone-900 block uppercase tracking-wider text-[11px] mb-1">
                Ingredients
              </span>
              <p className="leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                {product.ingredients || 'Standard traditional recipe.'}
              </p>
            </div>

            <div>
              <span className="font-bold text-stone-900 block uppercase tracking-wider text-[11px] mb-1">
                Allergen Information
              </span>
              <div className="flex items-start gap-2 bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{product.allergens || 'No specific allergen declarations.'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="font-bold text-stone-900 block uppercase tracking-wider text-[11px] mb-1">
                Shelf Life
              </span>
              <p className="leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                {product.shelfLife || 'Consume fresh within 15 days.'}
              </p>
            </div>

            <div>
              <span className="font-bold text-stone-900 block uppercase tracking-wider text-[11px] mb-1">
                Storage Instructions
              </span>
              <p className="leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                {product.storageInstructions || 'Store in an airtight container in a cool dry place.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-serif">Customer Feedback</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified reviews from customers who pre-ordered this traditional batch.
            </p>
          </div>

          <button
            onClick={() => setReviewFormOpen(!reviewFormOpen)}
            className="text-xs font-semibold px-4 py-2 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 transition text-stone-800"
          >
            {reviewFormOpen ? 'Close Review Form' : 'Write a Review'}
          </button>
        </div>

        {/* Review Submission Form */}
        {reviewFormOpen && (
          <form onSubmit={handleReviewSubmit} className="bg-white p-5 rounded-2xl border border-amber-200 space-y-4">
            <h4 className="text-sm font-bold text-amber-950 font-serif">Submit Your Review</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Rating *</label>
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                >
                  <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                  <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                  <option value={2}>★★☆☆☆ (2 Stars - Needs Improvement)</option>
                  <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Your Feedback & Taste Experience *</label>
              <textarea
                required
                rows={3}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="How was the freshness, crunch, and authentic flavor?"
                className="w-full text-xs p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              Submit Feedback
            </button>
          </form>
        )}

        {reviewSuccess && (
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Thank you for your feedback! Your review has been recorded.</span>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center">
            <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-stone-600">No reviews recorded yet for this batch.</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Be the first to pre-order and review this specialty!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{rev.customerName}</span>
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic">"{rev.comment}"</p>
                <div className="text-[10px] text-stone-400 pt-1">
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
