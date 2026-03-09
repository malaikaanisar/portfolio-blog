import type { NextApiRequest, NextApiResponse } from 'next';
import { validateCredentials, generateToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (!validateCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken();

  // Set HTTP-only cookie
  res.setHeader(
    'Set-Cookie',
    `dashboard_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  );

  return res.status(200).json({ success: true });
}
