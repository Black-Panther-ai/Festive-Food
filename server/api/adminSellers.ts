import { Request, Response, Router } from 'express';
import { requireAdmin } from '../auth.js';
import { db } from '../db.js';

export const adminSellersRouter = Router();

// Admin: Get all sellers
adminSellersRouter.get('/admin/sellers', requireAdmin, (req: Request, res: Response) => {
  try {
    const sellers = db.getSellers();
    res.json({ success: true, data: sellers });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch sellers.' });
  }
});

// Admin: Create seller
adminSellersRouter.post('/admin/sellers', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, contactPerson, phone, city, area, fssaiNumber, verificationStatus, status, notes } = req.body;

    if (!name || !phone || !city || !area) {
      return res.status(400).json({ error: 'Maker Name, phone, city, and area are required.' });
    }

    const seller = db.createSeller({
      name: name.trim(),
      contactPerson: contactPerson?.trim() || null,
      phone: phone.trim(),
      city: city.trim(),
      area: area.trim(),
      fssaiNumber: fssaiNumber?.trim() || null,
      verificationStatus: verificationStatus || 'VERIFIED',
      status: status || 'ACTIVE',
      notes: notes?.trim() || null,
    });

    res.status(201).json({ success: true, data: seller });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create food maker.' });
  }
});

// Admin: Update seller
adminSellersRouter.patch('/admin/sellers/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateSeller(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Food maker not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update food maker.' });
  }
});
