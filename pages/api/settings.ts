import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(SETTINGS_FILE)) {
        // Create default settings if not exists
        const defaultSettings = { endpoint: '' };
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
        return res.status(200).json(defaultSettings);
      }
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const settings = JSON.parse(fileData);
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error reading settings:', error);
      return res.status(500).json({ message: 'Failed to read settings' });
    }
  } else if (req.method === 'POST') {
    try {
      const { endpoint } = req.body;
      
      // Simple validation
      if (typeof endpoint !== 'string') {
        return res.status(400).json({ message: 'Invalid endpoint format' });
      }

      const settings = { endpoint };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
      return res.status(200).json({ message: 'Settings saved successfully', settings });
    } catch (error) {
      console.error('Error saving settings:', error);
      return res.status(500).json({ message: 'Failed to save settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
