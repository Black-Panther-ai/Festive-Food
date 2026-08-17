import { Request, Response, Router } from 'express';
import { requireAdmin } from '../auth.js';
import { db } from '../db.js';

export const adminSlotsRouter = Router();

// Public: Get active delivery slots by city
adminSlotsRouter.get('/delivery-slots', (req: Request, res: Response) => {
  try {
    const { city } = req.query;
    const slots = db.getDeliverySlots(city as string);
    // Public slots: include remaining capacity
    const publicSlots = slots
      .filter((s) => s.status === 'ACTIVE' || s.status === 'FULL')
      .map((s) => ({
        id: s.id,
        city: s.city,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        pincodes: s.pincodes,
        remainingCapacity: Math.max(0, s.capacity - s.reservedCapacity),
        isFull: s.reservedCapacity >= s.capacity || s.status === 'FULL',
      }));

    res.json({ success: true, data: publicSlots });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch delivery slots.' });
  }
});

// Admin: Get all slots (with detailed metrics)
adminSlotsRouter.get('/admin/delivery-slots', requireAdmin, (req: Request, res: Response) => {
  try {
    const { city } = req.query;
    const slots = db.getDeliverySlots(city as string);
    res.json({ success: true, data: slots });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch admin delivery slots.' });
  }
});

// Admin: Create delivery slot
adminSlotsRouter.post('/admin/delivery-slots', requireAdmin, (req: Request, res: Response) => {
  try {
    const { city, date, startTime, endTime, pincodes, capacity, status } = req.body;

    if (!city || !date || !startTime || !endTime || !pincodes || !capacity) {
      return res.status(400).json({ error: 'City, date, start time, end time, pincodes, and capacity are required.' });
    }

    const slot = db.createDeliverySlot({
      city: city.trim(),
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      pincodes: pincodes.trim(),
      capacity: Number(capacity),
      status: status || 'ACTIVE',
    });

    res.status(201).json({ success: true, data: slot });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create delivery slot.' });
  }
});

// Admin: Update delivery slot
adminSlotsRouter.patch('/admin/delivery-slots/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateDeliverySlot(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Delivery slot not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update delivery slot.' });
  }
});
