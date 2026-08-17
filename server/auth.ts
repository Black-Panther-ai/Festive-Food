import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { Role } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'up-festive-foods-super-secret-jwt-key-2026';
const TOKEN_EXPIRY = '7d';

export const AUTHORIZED_ADMIN_EMAILS = [
  'kumarsainipjk@gmail.com',
  'admin@upfestivefoods.com',
  ...(process.env.ADMIN_AUTHORIZED_EMAILS ? process.env.ADMIN_AUTHORIZED_EMAILS.split(',').map((e) => e.trim().toLowerCase()) : []),
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Admin authentication required.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }

  if (payload.role !== 'ADMIN' && payload.role !== 'OPERATOR') {
    return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
  }

  req.user = payload;
  next();
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
