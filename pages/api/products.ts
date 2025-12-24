import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type } = req.query;

  if (!type || typeof type !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid type parameter' });
  }

  let filename = '';
  // Mapping logic must match the upload logic
  if (type === 'receipt' || type === 'issuance') {
      filename = 'products-receipt.json';
  } else if (type === 'production' || type === 'dc-entry') {
      filename = 'products-production.json';
  } else {
      // Return empty or error? Empty list is safer for UI.
      return res.status(200).json([]);
  }

  const filePath = path.join(DATA_DIR, filename);

  try {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const products = JSON.parse(fileContent);
        return res.status(200).json(products);
    } else {
        // No file yet -> return empty list
        return res.status(200).json([]);
    }
  } catch (error) {
      console.error('Read Error:', error);
      return res.status(500).json({ message: 'Error reading product list' });
  }
}
