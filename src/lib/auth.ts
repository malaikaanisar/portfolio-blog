import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { connectToDatabase } from './mongodb';

const FALLBACK_USERNAME = process.env.DASHBOARD_USERNAME || 'admin';
const FALLBACK_PASSWORD = process.env.DASHBOARD_PASSWORD || 'admin123';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'malaika-dashboard-secret-key-2024';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function getAuthSettings() {
  try {
    const { db } = await connectToDatabase();
    const settings = await db.collection('settings').findOne({ key: 'auth' });
    return {
      username: settings?.username || FALLBACK_USERNAME,
      passwordHash: settings?.passwordHash,
    };
  } catch {
    return { username: FALLBACK_USERNAME, passwordHash: null };
  }
}

export function generateToken(username: string): string {
  const payload = {
    user: username,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    rand: crypto.randomBytes(16).toString('hex'),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(data)
    .digest('hex');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): boolean {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return false;
    
    const expectedSig = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(data)
      .digest('hex');
    
    if (signature !== expectedSig) return false;
    
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return false;
    
    return true;
  } catch {
    return false;
  }
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  const settings = await getAuthSettings();
  if (settings.passwordHash) {
    return username === settings.username && hashPassword(password) === settings.passwordHash;
  }
  return username === settings.username && password === FALLBACK_PASSWORD;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const settings = await getAuthSettings();
  const valid = await validateCredentials(settings.username, currentPassword);
  if (!valid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters' };
  }

  try {
    const { db } = await connectToDatabase();
    await db.collection('settings').updateOne(
      { key: 'auth' },
      { $set: { passwordHash: hashPassword(newPassword), updatedAt: new Date() } },
      { upsert: true },
    );
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update password' };
  }
}

export async function changeUsername(newUsername: string): Promise<{ success: boolean; error?: string }> {
  if (!newUsername || newUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' };
  }

  try {
    const { db } = await connectToDatabase();
    await db.collection('settings').updateOne(
      { key: 'auth' },
      { $set: { username: newUsername.trim(), updatedAt: new Date() } },
      { upsert: true },
    );
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update username' };
  }
}

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token =
      req.cookies['dashboard_token'] ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return handler(req, res);
  };
}
