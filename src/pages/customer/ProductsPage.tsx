import { Filter, MapPin, RefreshCw, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ProductCard } from '../../components/customer/ProductCard';
import { Category, Product } from '../../types';

interface ProductsPageProps {
  navigate: (path: string) => void;
  initialSearch?: string;
  initialCategory?: string;
  initialCity?: string;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  navigate,
  initialSearch = '',
  initialCategory = 'all',
  initialCity = 'all',
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [search, setSearch] = useState<string>(initialSearch);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync initial query params if they change
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialCity) setSelectedCity(initialCity);
    if (initialSearch) setSearch(initialSearch);
  }, [initialCategory, initialCity, initialSearch]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'all') {
          queryParams.append('category', selectedCategory);
        }
        if (selectedCity && selectedCity !== 'all') {
          queryParams.append('city', selectedCity);
        }
        if (selectedAvailability && selectedAvailability !== 'all') {
          queryParams.append('availability', selectedAvailability);
        }
        if (search.trim()) {
          queryParams.append('search', search.trim());
        }

        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products?${queryParams.toString()}`),
          fetch('/api/categories'),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.data || []);
        }

        if (catRes.ok) {
          const cData = await catRes.json();
          setCategories(cData.data || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [selectedCategory, selectedCity, selectedAvailability, search]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCity('all');
    setSelectedAvailability('all');
    setSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 font-serif">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Uttar Pradesh Heritage Kitchens</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-stone-900 font-serif mt-1">
            Browse Festive Snacks & Sweets
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Pre-order authentic traditional batches with ₹0 advance payment.
          </p>
        </div>

        {/* Search Field */}
        <div className="w-full md:w-72">
          <div className="relative">
            <input
              id="catalog-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Gujiya, Mathri, Thekua..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                selectedCategory === cat.slug
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters (City + Availability) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* City Dropdown/Pills */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-semibold text-stone-700">Origin City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-stone-800 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-600"
              >
                <option value="all">All UP Cities</option>
                <option value="kanpur">Kanpur</option>
                <option value="lucknow">Lucknow</option>
                <option value="varanasi">Varanasi</option>
              </select>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-semibold text-stone-700">Batch Status:</span>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-stone-800 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-600"
              >
                <option value="all">All Batches</option>
                <option value="available">Available This Week</option>
                <option value="sold_out">Sold Out / Full</option>
              </select>
            </div>
          </div>

          {(selectedCategory !== 'all' || selectedCity !== 'all' || selectedAvailability !== 'all' || search) && (
            <button
              onClick={resetFilters}
              className="text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Filter className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 font-serif">No Traditional Snacks Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            We couldn't find any products matching your current search or filter criteria.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-amber-700 text-white text-xs font-semibold rounded-xl hover:bg-amber-800 transition"
          >
            Clear Filters & View All
          </button>
        </div>
      ) : (
        <div>
          <div className="text-xs text-stone-500 mb-4 font-medium">
            Showing <strong>{products.length}</strong> festive items ready for demand pre-order
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(slug) => navigate(`/products/${slug}`)}
                onPreOrderDirect={() => navigate(`/products/${product.slug}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
