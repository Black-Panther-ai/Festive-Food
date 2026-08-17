import { Response, Router } from 'express';
import { AuthRequest, requireAdmin } from '../auth.js';
import { db } from '../db.js';
import { ConfirmationStatus, OrderStatus } from '../types.js';

export const adminOrdersRouter = Router();

// Apply requireAdmin to all admin orders routes
adminOrdersRouter.use(requireAdmin);

// Admin: Get all orders with pagination and filtering
adminOrdersRouter.get('/admin/orders', (req: AuthRequest, res: Response) => {
  try {
    const { status, confirmationStatus, search, city, pincode, page, limit } = req.query;
    const result = db.getOrders({
      status: status as string,
      confirmationStatus: confirmationStatus as string,
      search: search as string,
      city: city as string,
      pincode: pincode as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 15,
    });

    res.json({
      success: true,
      data: result,
      orders: result.orders,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch admin orders.' });
  }
});

// Admin: Get order details by ID
adminOrdersRouter.get('/admin/orders/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.getPreOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch order details.' });
  }
});

// Admin: Update order status
adminOrdersRouter.patch('/admin/orders/:id/status', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses: OrderStatus[] = [
      'NEW',
      'CONTACTED',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'REJECTED',
      'EXPIRED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid order status: ${status}` });
    }

    const changedBy = req.user?.name || 'Admin';
    const updated = db.updateOrderStatus(id, status, changedBy, note);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ success: true, data: updated, message: `Status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Admin: Update confirmation status (PENDING / CONFIRMED / DECLINED)
adminOrdersRouter.patch('/admin/orders/:id/confirmation', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { confirmationStatus, note } = req.body;

    const validConfirmations: ConfirmationStatus[] = ['PENDING', 'CONFIRMED', 'DECLINED'];
    if (!validConfirmations.includes(confirmationStatus)) {
      return res.status(400).json({ error: `Invalid confirmation status: ${confirmationStatus}` });
    }

    const changedBy = req.user?.name || 'Admin';
    const updated = db.updateConfirmationStatus(id, confirmationStatus, changedBy, note);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ success: true, data: updated, message: `Confirmation status set to ${confirmationStatus}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update confirmation status.' });
  }
});

// Admin: Log customer communication (WhatsApp / Call / SMS)
adminOrdersRouter.post('/admin/orders/:id/communication', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { channel, message } = req.body;

    if (!message || !channel) {
      return res.status(400).json({ error: 'Channel and communication message are required.' });
    }

    const comm = db.logCommunication(id, channel, message, 'SENT');
    const updatedOrder = db.getPreOrderById(id);

    res.status(201).json({ success: true, data: comm, order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log communication.' });
  }
});

// Admin: Assign seller to order item
adminOrdersRouter.post('/admin/orders/:id/assign-seller', (req: AuthRequest, res: Response) => {
  try {
    const { preOrderItemId, sellerId } = req.body;
    if (!preOrderItemId || !sellerId) {
      return res.status(400).json({ error: 'PreOrderItemId and SellerId are required.' });
    }

    const item = db.assignSeller(preOrderItemId, sellerId);
    if (!item) {
      return res.status(404).json({ error: 'Order item not found.' });
    }

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to assign seller.' });
  }
});
