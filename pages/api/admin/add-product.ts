import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DATA_DIR = path.join(process.cwd(), 'data');

function gitSync(filename: string, message: string): string {
  try {
    const safeMsg = message.replace(/["\\`$]/g, '');
    execSync(
      `git add "data/${filename}" && git commit -m "${safeMsg}" && git push`,
      { cwd: process.cwd(), timeout: 15000, stdio: 'pipe' }
    );
    return 'synced';
  } catch {
    return 'local_only';
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password, productName, unit, list } = req.body;

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  if (!productName?.trim() || !list) {
    return res.status(400).json({ message: 'Product name and list type are required' });
  }

  const name = productName.trim();
  const u = unit?.trim();

  let filename: string;
  let entry: string;

  if (list === 'receipt') {
    filename = 'products-receipt.json';
    entry = u ? `${name} | ${u}` : name;
  } else if (list === 'production') {
    filename = 'products-production.json';
    entry = u ? `${name} (${u})` : name;
  } else {
    return res.status(400).json({ message: 'Invalid list type' });
  }

  const filePath = path.join(DATA_DIR, filename);

  try {
    let products: string[] = [];
    if (fs.existsSync(filePath)) {
      products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    if (products.some(p => p.toLowerCase() === entry.toLowerCase())) {
      return res.status(409).json({ message: 'Product already exists' });
    }

    products.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));

    const gitStatus = gitSync(filename, `added ${name}`);

    return res.status(200).json({ message: 'Product added', product: entry, gitStatus });
  } catch (error) {
    console.error('Add product error:', error);
    return res.status(500).json({ message: 'Failed to add product' });
  }
}
