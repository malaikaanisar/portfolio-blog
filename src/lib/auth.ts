import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const ADMIN_USERNAME = process.env.DASHBOARD_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.DASHBOARD_PASSWORD || 'admin123';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'malaika-dashboard-secret-key-2024';

export function generateToken(): string {
  const payload = {
    user: ADMIN_USERNAME,
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

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
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
