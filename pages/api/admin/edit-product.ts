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

  const { password, oldProduct, newProduct, list } = req.body;

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  if (!oldProduct || !newProduct?.trim() || !list) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const filename =
    list === 'receipt' ? 'products-receipt.json' :
    list === 'production' ? 'products-production.json' :
    null;

  if (!filename) {
    return res.status(400).json({ message: 'Invalid list type' });
  }

  const filePath = path.join(DATA_DIR, filename);

  try {
    let products: string[] = [];
    if (fs.existsSync(filePath)) {
      products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    const index = products.indexOf(oldProduct);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const trimmed = newProduct.trim();
    if (oldProduct !== trimmed && products.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      return res.status(409).json({ message: 'A product with that name already exists' });
    }

    products[index] = trimmed;
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));

    const gitStatus = gitSync(filename, `renamed ${oldProduct} to ${trimmed}`);

    return res.status(200).json({
      message: 'Product updated',
      oldProduct,
      newProduct: trimmed,
      gitStatus,
    });
  } catch (error) {
    console.error('Edit product error:', error);
    return res.status(500).json({ message: 'Failed to edit product' });
  }
}
