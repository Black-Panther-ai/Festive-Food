import { Request, Response, Router } from 'express';
import { requireAdmin } from '../auth.js';
import { db } from '../db.js';

export const productsRouter = Router();

// Public: Get all products with filters
productsRouter.get('/products', (req: Request, res: Response) => {
  try {
    const { category, city, availability, search, status } = req.query;
    const products = db.getProducts({
      category: category as string,
      city: city as string,
      availability: availability as string,
      search: search as string,
      status: status as string,
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// Public: Get product by slug or id
productsRouter.get('/products/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = db.getProductBySlug(slug) || db.getProductById(slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Get seller preview if mapped
    const reviews = db.getReviews(product.id);
    const deliverySlots = db.getDeliverySlots(product.city || 'Kanpur');

    res.json({
      success: true,
      data: {
        ...product,
        reviews,
        deliverySlots,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch product details.' });
  }
});

// Public: Get all categories
productsRouter.get('/categories', (req: Request, res: Response) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// Admin: Create Product
productsRouter.post('/admin/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      categoryId,
      price,
      unit,
      weight,
      approxPieces,
      imageUrl,
      ingredients,
      allergens,
      shelfLife,
      storageInstructions,
      availableQuantity,
      preOrderDeadline,
      deliveryDates,
      city,
      status,
    } = req.body;

    if (!name || !description || !categoryId || price === undefined) {
      return res.status(400).json({ error: 'Name, description, category, and price are required.' });
    }

    const newProduct = db.createProduct({
      name: name.trim(),
      slug: slug?.trim(),
      description: description.trim(),
      categoryId,
      price: Number(price),
      unit: unit || '500g',
      weight: weight || '500g',
      approxPieces: approxPieces || null,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      ingredients: ingredients || '',
      allergens: allergens || '',
      shelfLife: shelfLife || '15 days',
      storageInstructions: storageInstructions || 'Store in a cool, dry place.',
      availableQuantity: Number(availableQuantity || 50),
      preOrderDeadline: preOrderDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deliveryDates: deliveryDates || 'Upcoming Batch',
      city: city || 'Kanpur',
      status: status || 'ACTIVE',
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// Admin: Update Product
productsRouter.patch('/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// Admin: Delete Product
productsRouter.delete('/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = db.deleteProduct(id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// Admin: Create Category
productsRouter.post('/admin/categories', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }
    const cat = db.createCategory(name, description);
    res.status(201).json({ success: true, data: cat });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
});
