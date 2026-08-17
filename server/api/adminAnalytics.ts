import { Request, Response, Router } from 'express';
import { requireAdmin } from '../auth.js';
import { db } from '../db.js';

export const adminAnalyticsRouter = Router();

// Admin: Analytics & Demand validation metrics
adminAnalyticsRouter.get('/admin/analytics', requireAdmin, (req: Request, res: Response) => {
  try {
    const analytics = db.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to calculate analytics.' });
  }
});

// Admin: Customers list
adminAnalyticsRouter.get('/admin/customers', requireAdmin, (req: Request, res: Response) => {
  try {
    const customers = db.getCustomersList();
    res.json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch customer list.' });
  }
});

// Admin: All reviews
adminAnalyticsRouter.get('/admin/reviews', requireAdmin, (req: Request, res: Response) => {
  try {
    const reviews = db.getAllReviews();
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// Admin: Update review status
adminAnalyticsRouter.patch('/admin/reviews/:id/status', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.updateReviewStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Review not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update review status.' });
  }
});
