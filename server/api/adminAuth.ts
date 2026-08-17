import { Request, Response, Router } from 'express';
import { generateToken, isAuthorizedAdminEmail, requireAdmin, verifyPassword } from '../auth.js';
import { db } from '../db.js';

export const adminAuthRouter = Router();

// Clerk Admin Authorization Verification
adminAuthRouter.post('/admin/clerk-auth', (req: Request, res: Response) => {
  try {
    const { email, name, clerkUserId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'User email is required for admin authorization check.' });
    }

    if (!isAuthorizedAdminEmail(email)) {
      return res.status(403).json({
        error: `Access Denied: The account (${email}) does not have administrative privileges. Admin portal access is restricted to verified operations personnel.`,
      });
    }

    // Email is verified admin
    const token = generateToken({
      userId: clerkUserId || 'admin-clerk',
      email: email.toLowerCase().trim(),
      role: 'ADMIN',
      name: name || 'Admin Operator',
    });

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: clerkUserId || 'admin-clerk',
        name: name || 'Admin Operator',
        email: email.toLowerCase().trim(),
        role: 'ADMIN',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify admin authorization.' });
  }
});

// Admin Login
adminAuthRouter.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login process failed.' });
  }
});

// Admin Me
adminAuthRouter.get('/admin/me', requireAdmin, (req: any, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Admin Logout
adminAuthRouter.post('/admin/logout', (req: Request, res: Response) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Dev / Demo Reset Seed
adminAuthRouter.post('/admin/seed-reset', requireAdmin, (req: Request, res: Response) => {
  try {
    db.seed();
    res.json({ success: true, message: 'Database reset to initial authentic UP foods seed successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset seed.' });
  }
});
