import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Increase body size limit for large inventory payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const DATA_DIR = path.join(process.cwd(), 'data');
const INVENTORY_FILE = path.join(DATA_DIR, 'rm-inventory.json');

// Format date in Pakistan Standard Time (UTC+5)
function formatPKT(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Karachi'
  };
  return new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', '');
}

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
      if (!fs.existsSync(INVENTORY_FILE)) {
        // Return empty structure if no data yet
        return res.status(200).json({ lastUpdated: null, items: [] });
      }
      const fileData = fs.readFileSync(INVENTORY_FILE, 'utf8');
      const data = JSON.parse(fileData);
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error reading inventory:', error);
      return res.status(500).json({ message: 'Failed to read inventory data' });
    }

  } else if (req.method === 'POST') {
    try {
      const items = req.body;

      // Validate payload is an array
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'Payload must be an array of inventory items' });
      }

      // Generate timestamp in Pakistan Standard Time
      const lastUpdated = formatPKT(new Date());

      const data = {
        lastUpdated,
        items
      };

      fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data, null, 2));

      return res.status(200).json({ 
        message: 'Inventory updated successfully', 
        lastUpdated,
        itemCount: items.length 
      });

    } catch (error) {
      console.error('Error saving inventory:', error);
      return res.status(500).json({ message: 'Failed to save inventory data' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
