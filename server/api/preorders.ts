import { Request, Response, Router } from 'express';
import { db } from '../db.js';

export const preordersRouter = Router();

// Validation helpers
function isValidIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Valid Indian mobile numbers are 10 digits starting with 6, 7, 8, 9
  return /^[6-9]\d{9}$/.test(cleaned.slice(-10));
}

function isValidPincode(pin: string): boolean {
  const cleaned = pin.trim();
  // Indian PIN codes are exactly 6 digits, first digit 1-9
  return /^[1-9][0-9]{5}$/.test(cleaned);
}

// Public: Place Pre-Order (₹0 payment required)
preordersRouter.post('/preorders', (req: Request, res: Response) => {
  try {
    const {
      clerkUserId,
      customerName,
      customerPhone,
      customerEmail,
      addressLine,
      area,
      city,
      state,
      pincode,
      deliveryInstructions,
      deliverySlotId,
      requestedDate,
      items,
    } = req.body;

    // 1. Validate required fields
    if (!customerName || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }

    if (!customerPhone || !isValidIndianMobile(customerPhone)) {
      return res.status(400).json({
        error: 'Please enter a valid 10-digit Indian mobile number (e.g., 9839012345).',
      });
    }

    if (!addressLine || addressLine.trim().length < 5) {
      return res.status(400).json({ error: 'Please enter a complete delivery address.' });
    }

    if (!area || area.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your area or locality.' });
    }

    if (!city || city.trim().length < 2) {
      return res.status(400).json({ error: 'Please specify your city in Uttar Pradesh.' });
    }

    if (!pincode || !isValidPincode(pincode)) {
      return res.status(400).json({
        error: 'Please enter a valid 6-digit PIN code (e.g. 208001).',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your pre-order cart is empty.' });
    }

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ error: 'Invalid product or quantity specified.' });
      }
    }

    // 2. Submit to Database service
    const result = db.createPreOrder({
      clerkUserId,
      customerName,
      customerPhone,
      customerEmail,
      addressLine,
      area,
      city,
      state: state || 'Uttar Pradesh',
      pincode,
      deliveryInstructions,
      deliverySlotId,
      requestedDate,
      items,
    });

    if (result.error || !result.preOrder) {
      return res.status(400).json({ error: result.error || 'Failed to place pre-order.' });
    }

    // Return success payload
    res.status(201).json({
      success: true,
      message: 'Pre-order request received successfully.',
      data: {
        orderId: result.preOrder.id,
        orderNumber: result.preOrder.orderNumber,
        clerkUserId: result.preOrder.clerkUserId,
        customerName: result.preOrder.customerName,
        customerPhone: result.preOrder.customerPhone,
        customerEmail: result.preOrder.customerEmail,
        total: result.preOrder.total,
        subtotal: result.preOrder.subtotal,
        deliveryFee: result.preOrder.deliveryFee,
        paymentStatus: result.preOrder.paymentStatus,
        paymentAmountNow: 0,
        confirmationStatus: result.preOrder.confirmationStatus,
        orderStatus: result.preOrder.orderStatus,
        requestedDate: result.preOrder.requestedDate,
        createdAt: result.preOrder.createdAt,
        items: result.preOrder.items,
        address: result.preOrder.address,
        deliverySlot: result.preOrder.deliverySlot,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error while processing pre-order.' });
  }
});

// Customer Account: Get Pre-Orders for current customer (by clerkUserId, email, or phone)
preordersRouter.get('/customer/orders', (req: Request, res: Response) => {
  try {
    const { clerkUserId, phone, email } = req.query;

    if (!clerkUserId && !phone && !email) {
      return res.status(400).json({ error: 'Customer identifier is required.' });
    }

    const orders = db.getPreOrdersByCustomer({
      clerkUserId: clerkUserId as string,
      phone: phone as string,
      email: email as string,
    });

    res.json({
      success: true,
      data: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail,
        orderStatus: o.orderStatus,
        confirmationStatus: o.confirmationStatus,
        total: o.total,
        paymentAmountNow: 0,
        requestedDate: o.requestedDate,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        address: o.address,
        deliverySlot: o.deliverySlot,
        items: o.items?.map((i) => ({
          productId: i.productId,
          productName: i.product?.name || 'Traditional Festive Item',
          quantity: i.quantity,
          unit: i.product?.unit || '500g',
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
          imageUrl: i.product?.imageUrl,
        })),
        statusHistory: o.statusHistory,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch customer orders.' });
  }
});

// Customer: Get Single Order Details by orderNumber
preordersRouter.get('/preorders/details/:orderNumber', (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    const order = db.getPreOrderByOrderNumber(orderNumber, phone as string | undefined);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        orderStatus: order.orderStatus,
        confirmationStatus: order.confirmationStatus,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        paymentAmountNow: 0,
        requestedDate: order.requestedDate,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        address: order.address,
        deliverySlot: order.deliverySlot,
        items: order.items?.map((i) => ({
          productId: i.productId,
          productName: i.product?.name || 'Traditional Festive Item',
          quantity: i.quantity,
          unit: i.product?.unit || '500g',
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
          imageUrl: i.product?.imageUrl,
        })),
        statusHistory: order.statusHistory,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve order details.' });
  }
});

// Public: Track Pre-Order by OrderNumber & Phone
preordersRouter.get('/preorders/track', (req: Request, res: Response) => {
  try {
    const { orderNumber, phone } = req.query;

    if (!orderNumber || typeof orderNumber !== 'string') {
      return res.status(400).json({ error: 'Order Number is required (e.g. UP-10102).' });
    }

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Registered mobile number is required to view order status.' });
    }

    const order = db.getPreOrderByOrderNumber(orderNumber, phone);
    if (!order) {
      return res.status(404).json({
        error: 'No order found with the provided Order Number and Mobile Number. Please verify your details.',
      });
    }

    // Public sanitized response: strictly exclude internal notes or private seller records
    const sanitizedOrder = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      confirmationStatus: order.confirmationStatus,
      orderStatus: order.orderStatus,
      requestedDate: order.requestedDate,
      total: order.total,
      paymentAmountNow: 0,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deliveryArea: `${order.address?.area}, ${order.address?.city} (${order.address?.pincode})`,
      items: order.items?.map((i) => ({
        productName: i.product?.name || 'Traditional Festive Item',
        quantity: i.quantity,
        unit: i.product?.unit || '500g',
        totalPrice: i.totalPrice,
        imageUrl: i.product?.imageUrl,
      })),
      timeline: order.statusHistory?.map((h) => ({
        status: h.newStatus,
        date: h.createdAt,
        message: h.note || `Order status updated to ${h.newStatus}`,
      })),
    };

    res.json({ success: true, data: sanitizedOrder });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve order tracking info.' });
  }
});

// Public: Submit Review for Delivered Product
preordersRouter.post('/reviews', (req: Request, res: Response) => {
  try {
    const { productId, preOrderId, customerName, rating, comment } = req.body;

    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ error: 'Product, customer name, rating, and feedback comment are required.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
    }

    const review = db.createReview({
      productId,
      preOrderId: preOrderId || null,
      customerName: customerName.trim(),
      rating: numRating,
      comment: comment.trim(),
      status: 'APPROVED',
    });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// Public: Get Reviews for a Product
preordersRouter.get('/reviews', (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    const reviews = db.getReviews(productId as string);
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});
