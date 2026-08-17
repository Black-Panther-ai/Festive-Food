import {
  AlertCircle,
  Check,
  CheckCircle2,
  Edit3,
  Image as ImageIcon,
  Layers,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Category, Product, ProductStatus } from '../../types';

interface AdminProductsPageProps {
  navigate: (path: string) => void;
}

const PRESET_DISH_IMAGES = [
  { name: 'Traditional Mawa Gujiya', url: '/images/products/mawa-gujiya.jpg' },
  { name: 'Shuddh Desi Ghee Besan Laddoo', url: '/images/products/besan-laddoo.jpg' },
  { name: 'Sweet Crunchy Shakar Para', url: '/images/products/sweet-shakarpara.jpg' },
  { name: 'Halwai-Style Khasta Mathri', url: '/images/products/khasta-mathri.jpg' },
  { name: 'Crispy Ajwain Namak Para', url: '/images/products/crispy-namakpara.jpg' },
  { name: 'Purvanchal Gur Thekua', url: '/images/products/purvanchal-thekua.jpg' },
  { name: 'Awadhi Shahi Balushahi', url: '/images/products/awadhi-balushahi.jpg' },
  { name: 'Spiced Khasta Moong Dal Kachori', url: '/images/products/khasta-kachori.jpg' },
];

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ navigate }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | ''>(299);
  const [unit, setUnit] = useState('500g');
  const [weight, setWeight] = useState('500g (~12-14 pcs)');
  const [approxPieces, setApproxPieces] = useState('12-14 pcs');
  const [imageUrl, setImageUrl] = useState('/images/products/mawa-gujiya.jpg');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');
  const [shelfLife, setShelfLife] = useState('15 days');
  const [storageInstructions, setStorageInstructions] = useState('Store in a cool, dry place in an airtight container.');
  const [availableQuantity, setAvailableQuantity] = useState<number | ''>(50);
  const [city, setCity] = useState('Kanpur');
  const [status, setStatus] = useState<ProductStatus>('ACTIVE');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{ configured: boolean; cloudName?: string | null }>({
    configured: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkCloudinaryStatus = async () => {
    try {
      const res = await fetch('/api/upload/status');
      const json = await res.json();
      if (json.success) {
        setCloudinaryStatus({
          configured: json.cloudinaryConfigured,
          cloudName: json.cloudName,
        });
      }
    } catch {
      // ignore
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
        if (json.data.length > 0 && !categoryId) {
          setCategoryId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    checkCloudinaryStatus();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId(categories[0]?.id || 'cat-sweets');
    setPrice(299);
    setUnit('500g');
    setWeight('500g (~12-14 pcs)');
    setApproxPieces('12-14 pcs');
    setImageUrl('/images/products/mawa-gujiya.jpg');
    setIngredients('Pure Desi Ghee, Khoya/Mawa, Cardamom, Dry Fruits.');
    setAllergens('Contains Dairy and Gluten.');
    setShelfLife('15 days');
    setStorageInstructions('Store in a cool dry airtight jar.');
    setAvailableQuantity(50);
    setCity('Kanpur');
    setStatus('ACTIVE');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setCategoryId(prod.categoryId);
    setPrice(prod.price);
    setUnit(prod.unit);
    setWeight(prod.weight || `${prod.unit}`);
    setApproxPieces(prod.approxPieces || '');
    setImageUrl(prod.imageUrl);
    setIngredients(prod.ingredients || '');
    setAllergens(prod.allergens || '');
    setShelfLife(prod.shelfLife || '15 days');
    setStorageInstructions(prod.storageInstructions || 'Store in airtight box.');
    setAvailableQuantity(prod.availableQuantity);
    setCity(prod.city || 'Kanpur');
    setStatus(prod.status);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Handle Gallery / File Upload & Cloudinary storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (under 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size must be under 10MB.');
      return;
    }

    try {
      setUploadingImage(true);
      setErrorMsg(null);

      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        if (!base64Data) {
          setUploadingImage(false);
          return;
        }

        // Upload to server endpoint which syncs to Cloudinary
        try {
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              image: base64Data,
              folder: 'up_festive_foods/products',
            }),
          });

          const json = await res.json();
          if (json.success && json.url) {
            setImageUrl(json.url);
            if (json.provider === 'cloudinary') {
              setSuccessMsg('Image uploaded to Cloudinary CDN successfully!');
            } else {
              setSuccessMsg('Image loaded from device gallery!');
            }
            setTimeout(() => setSuccessMsg(null), 4000);
          } else {
            // Fallback to local base64 preview
            setImageUrl(base64Data);
            setSuccessMsg('Image loaded from local device.');
            setTimeout(() => setSuccessMsg(null), 3000);
          }
        } catch (uploadErr: any) {
          console.warn('Direct upload API failed, falling back to base64', uploadErr);
          setImageUrl(base64Data);
          setSuccessMsg('Image loaded from gallery.');
          setTimeout(() => setSuccessMsg(null), 3000);
        } finally {
          setUploadingImage(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read image file.');
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product dish name is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Product description is required.');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setErrorMsg('Please enter a valid price in INR.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        categoryId,
        price: Number(price),
        unit: unit.trim(),
        weight: weight.trim(),
        approxPieces: approxPieces.trim() || null,
        imageUrl: imageUrl.trim() || '/images/products/mawa-gujiya.jpg',
        ingredients: ingredients.trim(),
        allergens: allergens.trim(),
        shelfLife: shelfLife.trim(),
        storageInstructions: storageInstructions.trim(),
        availableQuantity: Number(availableQuantity || 0),
        city: city.trim(),
        status,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save product.');
      }

      setSuccessMsg(editingProduct ? 'Product updated successfully!' : 'New festive dish added successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete product.');
      }

      setSuccessMsg('Product item deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
      setDeleteConfirmProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-mono">
            Catalog Management
          </span>
          <h1 className="text-2xl font-bold text-stone-900 font-serif mt-1">
            Festive Dishes & Products
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Add new traditional items, upload dish photos from your gallery, adjust prices, or remove items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            id="add-new-product-btn"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Festive Dish</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by dish name, ingredients, or city (Kanpur, Lucknow, Varanasi)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Accepting Pre-orders)</option>
            <option value="SOLD_OUT">Sold Out</option>
            <option value="COMING_SOON">Coming Soon</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-500">
          <div className="w-7 h-7 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading products catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800 font-serif">No products found</h3>
          <p className="text-xs text-stone-500">Try adjusting your filters or add a new festive item.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-semibold"
          >
            Add New Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Image & Status Tag */}
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/products/mawa-gujiya.jpg';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        prod.status === 'ACTIVE'
                          ? 'bg-emerald-600/90 text-white'
                          : prod.status === 'SOLD_OUT'
                          ? 'bg-red-600/90 text-white'
                          : 'bg-amber-600/90 text-white'
                      }`}
                    >
                      {prod.status.replace('_', ' ')}
                    </span>
                    {prod.city && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-900/80 text-stone-100 backdrop-blur-md flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-amber-400" />
                        {prod.city}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-white font-serif font-bold text-sm">
                    ₹{prod.price} <span className="text-[10px] font-sans font-normal text-stone-300">/ {prod.unit}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <h3 className="text-base font-bold text-stone-900 font-serif line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>Batch Capacity:</span>
                    <span className="font-bold text-stone-800 font-mono">
                      {prod.availableQuantity} packs left
                    </span>
                  </div>

                  {prod.shelfLife && (
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>Shelf Life:</span>
                      <span className="font-medium text-stone-700">{prod.shelfLife}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(prod)}
                  className="flex-1 py-2 px-3 bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmProduct(prod)}
                  className="p-2 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-300 text-stone-400 hover:text-red-700 rounded-xl transition shadow-2xs"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-mono">
                  {editingProduct ? 'Update Dish' : 'New Dish Creation'}
                </span>
                <h2 className="text-xl font-bold text-stone-900 font-serif mt-1">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Traditional Item'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Traditional Mawa Gujiya / Shuddh Besan Laddoo"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="299"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Unit / Pack Size
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="500g / 1kg / 250g"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Approx Pieces / Weight Info
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="500g (~12-14 pcs)"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* Product Image Section with Cloudinary & Gallery Upload */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-900 font-serif">
                    Product Image (Cloudinary CDN & Local Gallery)
                  </label>
                  {cloudinaryStatus.configured ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                      <Sparkles className="w-3 h-3" />
                      Cloudinary Active ({cloudinaryStatus.cloudName})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-full font-mono">
                      Local / Presets Mode
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview */}
                  <div className="w-28 h-24 rounded-2xl bg-white border border-stone-200 overflow-hidden shrink-0 shadow-inner flex items-center justify-center relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Dish Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/products/mawa-gujiya.jpg';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-stone-300" />
                    )}

                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="text-[9px] font-bold mt-1">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Upload from Gallery Button & Cloudinary Direct Input */}
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold flex items-center gap-1.5 transition text-xs shadow-xs disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingImage ? 'Uploading Image to Cloudinary...' : 'Upload Image from Gallery / File'}</span>
                      </button>
                    </div>

                    {/* Direct Image URL input */}
                    <div className="pt-1">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Or paste Cloudinary URL (https://res.cloudinary.com/...)"
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Authentic Presets Selector */}
                <div className="pt-2 border-t border-stone-200 space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-600 block">
                    Or select an authentic dish preset:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_DISH_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          imageUrl === preset.url
                            ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the authentic taste, pure desi ghee preparation, traditional halwai craft..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white text-xs leading-relaxed"
                />
              </div>

              {/* Ingredients & Allergens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Ingredients
                  </label>
                  <input
                    type="text"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="Mawa, Desi Ghee, Khoya, Cashews, Cardamom"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Allergens
                  </label>
                  <input
                    type="text"
                    value={allergens}
                    onChange={(e) => setAllergens(e.target.value)}
                    placeholder="Contains Dairy, Gluten, Tree nuts"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* Inventory & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Available Batch Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={availableQuantity}
                    onChange={(e) =>
                      setAvailableQuantity(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="50"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    City Hub
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  >
                    <option value="Kanpur">Kanpur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Ayodhya">Ayodhya</option>
                    <option value="Prayagraj">Prayagraj</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Product Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as ProductStatus)
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                  >
                    <option value="ACTIVE">ACTIVE (Accepting Orders)</option>
                    <option value="SOLD_OUT">SOLD OUT</option>
                    <option value="INACTIVE">INACTIVE (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingProduct ? 'Save Dish Changes' : 'Create Dish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Delete Product?
              </h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to remove <strong>{deleteConfirmProduct.name}</strong> from the catalog? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleDeleteProduct(deleteConfirmProduct.id)}
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Yes, Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
