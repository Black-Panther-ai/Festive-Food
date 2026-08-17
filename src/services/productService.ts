import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../data/initialProducts';
import { Category, Product, Review } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'up_festive_products_v2',
  CATEGORIES: 'up_festive_categories_v2',
  ORDERS: 'up_festive_orders_v2',
  REVIEWS: 'up_festive_reviews_v2',
};

// Initial in-memory & localStorage loader
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading products from localStorage', e);
  }
  // Initialize with defaults
  saveLocalProducts(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.warn('Error saving products to localStorage', e);
  }
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          saveLocalProducts(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // Backend not running (e.g. GitHub Pages static deploy)
    }
    return getLocalProducts();
  },

  async getProductBySlugOrId(identifier: string): Promise<Product | undefined> {
    if (!identifier) return undefined;
    const cleanId = decodeURIComponent(identifier).toLowerCase().trim();

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      // Fall through to local matching
    }

    const localList = getLocalProducts();
    const matched = localList.find((p) => {
      const pSlug = (p.slug || '').toLowerCase().trim();
      const pId = (p.id || '').toLowerCase().trim();
      const pName = (p.name || '').toLowerCase().trim();
      const pAutoSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return (
        pSlug === cleanId ||
        pId === cleanId ||
        pName === cleanId ||
        pAutoSlug === cleanId ||
        (pSlug && cleanId.includes(pSlug)) ||
        (cleanId && pSlug.includes(cleanId)) ||
        (pName && cleanId.includes(pName))
      );
    });

    return matched || localList[0];
  },

  async saveProduct(productData: Partial<Product>, token?: string | null): Promise<Product> {
    let savedProduct: Product;
    const isEdit = Boolean(productData.id);

    // 1. Try Backend API first if available
    try {
      const url = isEdit ? `/api/products/${productData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          savedProduct = json.data;
          // Update local list
          const localList = getLocalProducts();
          const updatedList = isEdit
            ? localList.map((p) => (p.id === savedProduct.id ? savedProduct : p))
            : [savedProduct, ...localList];
          saveLocalProducts(updatedList);
          return savedProduct;
        }
      }
    } catch (e) {
      console.warn('Backend API unavailable, saving locally for GitHub Pages', e);
    }

    // 2. Client-side Local Storage Save (for GitHub Pages / Offline)
    const localList = getLocalProducts();
    const now = new Date().toISOString();

    if (isEdit && productData.id) {
      const existing = localList.find((p) => p.id === productData.id);
      savedProduct = {
        ...(existing || DEFAULT_PRODUCTS[0]),
        ...productData,
        updatedAt: now,
      } as Product;
      const updatedList = localList.map((p) => (p.id === savedProduct.id ? savedProduct : p));
      saveLocalProducts(updatedList);
    } else {
      const id = `prod-${Date.now()}`;
      const slug =
        productData.slug?.trim() ||
        productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
        id;
      savedProduct = {
        id,
        name: productData.name || 'New Festival Dish',
        slug,
        description: productData.description || '',
        categoryId: productData.categoryId || 'cat-sweets',
        price: Number(productData.price) || 299,
        unit: productData.unit || '500g',
        weight: productData.weight || `${productData.unit || '500g'}`,
        approxPieces: productData.approxPieces || '',
        imageUrl:
          productData.imageUrl ||
          'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        ingredients: productData.ingredients || 'Traditional ingredients with pure desi ghee.',
        allergens: productData.allergens || 'Contains Dairy and Gluten.',
        shelfLife: productData.shelfLife || '15 days',
        storageInstructions: productData.storageInstructions || 'Store in airtight box.',
        status: productData.status || 'ACTIVE',
        availableQuantity: Number(productData.availableQuantity) || 50,
        preOrderDeadline: productData.preOrderDeadline || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        deliveryDates: productData.deliveryDates || 'Weekly Fresh Batch',
        city: productData.city || 'Kanpur',
        createdAt: now,
        updatedAt: now,
      };
      saveLocalProducts([savedProduct, ...localList]);
    }

    return savedProduct;
  },

  async deleteProduct(id: string, token?: string | null): Promise<boolean> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/products/${id}`, { method: 'DELETE', headers });
    } catch (e) {
      // ignore
    }

    const localList = getLocalProducts();
    const filtered = localList.filter((p) => p.id !== id);
    saveLocalProducts(filtered);
    return true;
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      // static
    }
    return DEFAULT_CATEGORIES;
  },
};
