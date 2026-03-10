import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, changePassword, changeUsername } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/mongodb';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();
  const settingsCollection = db.collection('settings');

  // GET /api/dashboard/settings - get current settings
  if (req.method === 'GET') {
    try {
      const settings = await settingsCollection.findOne({ key: 'auth' });
      return res.status(200).json({
        username: settings?.username || process.env.DASHBOARD_USERNAME || 'admin',
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  // POST /api/dashboard/settings - handle actions
  if (req.method === 'POST') {
    const { action } = req.body;

    if (action === 'change-password') {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password required' });
      }
      const result = await changePassword(currentPassword, newPassword);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(200).json({ success: true, message: 'Password updated successfully' });
    }

    if (action === 'change-username') {
      const { newUsername } = req.body;
      if (!newUsername) {
        return res.status(400).json({ error: 'New username required' });
      }
      const result = await changeUsername(newUsername);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(200).json({ success: true, message: 'Username updated successfully' });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
