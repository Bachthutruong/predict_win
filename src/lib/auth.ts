import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AuthUser } from '@/types';
import User from '@/models/user';
import dbConnect from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function createToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) return null;
    
    const payload = verifyToken(token);
    if (!payload) return null;
    
    await dbConnect();
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) return null;
    
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
  } catch {
    return null;
  }
}

export async function setAuthCookie(userId: string) {
  const token = createToken(userId);
  const cookieStore = await cookies();
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function requireAuth(userRole?: 'admin' | 'staff' | 'user') {
  return async function authMiddleware() {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    if (!user.isEmailVerified) {
      throw new Error('Email verification required');
    }
    
    if (userRole && user.role !== userRole && user.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }
    
    return user;
  };
} 