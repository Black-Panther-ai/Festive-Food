import { Calendar, Check, Clock, Eye, MapPin, Plus, ShoppingBag } from 'lucide-react';
import React from 'react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onSelect: (slug: string) => void;
  onPreOrderDirect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onPreOrderDirect }) => {
  const { addItem, items } = useCart();
  const isSoldOut = product.status === 'SOLD_OUT' || product.availableQuantity <= 0;
  const inCart = items.some((i) => i.product.id === product.id);

  const handlePreOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    if (onPreOrderDirect) {
      onPreOrderDirect(product);
    } else {
      addItem(product, 1);
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product.slug || product.id)}
      className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-700/30 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={product.imageUrl || fallbackImage}
          alt={product.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* City Badge & Availability */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.city && (
            <span className="bg-stone-900/80 backdrop-blur-md text-amber-300 text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <MapPin className="w-3 h-3 text-amber-400" />
              {product.city}
            </span>
          )}
        </div>

        {/* Status Tag */}
        <div className="absolute top-3 right-3">
          {isSoldOut ? (
            <span className="bg-stone-800/90 text-stone-200 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Batch Full
            </span>
          ) : (
            <span className="bg-emerald-600/90 text-white text-xs font-medium px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
              Fresh Batch
            </span>
          )}
        </div>

        {/* Capacity Indicator */}
        {!isSoldOut && product.availableQuantity < 20 && (
          <div className="absolute bottom-2 left-3 bg-amber-950/80 text-amber-200 text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-sm">
            Only {product.availableQuantity} slots left
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Weight */}
          <div className="flex items-center justify-between text-xs text-stone-700 mb-1.5 font-medium">
            <span>{product.category?.name || 'Festive Special'}</span>
            <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
              {product.weight || product.unit || '500g'}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif leading-snug group-hover:text-amber-800 transition line-clamp-1">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-stone-700 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Pre-order Timeline metadata */}
          <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 text-xs text-stone-700">
            <div className="flex items-center gap-1.5 text-stone-800">
              <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Delivery: <strong>{product.deliveryDates || 'Upcoming batch'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-700">
              <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>Pre-order closes soon</span>
            </div>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-stone-700 block">Pre-Order Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-amber-950 font-serif">₹{product.price}</span>
              <span className="text-[11px] text-stone-700 font-medium">/ {product.unit || '500g'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`quick-preorder-${product.id}`}
              onClick={handlePreOrder}
              disabled={isSoldOut}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isSoldOut
                  ? 'bg-stone-200 text-stone-600 cursor-not-allowed'
                  : inCart
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-amber-700 text-white hover:bg-amber-800 shadow-sm active:scale-95'
              }`}
            >
              {isSoldOut ? (
                'Sold Out'
              ) : inCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-800" /> In Pre-Order
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Pre-Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
