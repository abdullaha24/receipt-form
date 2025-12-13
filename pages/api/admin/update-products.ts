import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const DATA_DIR = path.join(process.cwd(), 'data');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const form = formidable({});

  try {
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0] as File | undefined;
    const type = fields.type?.[0] as string; // 'receipt' | 'production'
    const sheetName = fields.sheetName?.[0] as string;
    const columnRef = fields.columnRef?.[0] as string; // 'A', 'B', etc. or index '0', '1'

    if (!file || !type || !sheetName || !columnRef) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Read the Excel file
    const workbook = XLSX.readFile(file.filepath);
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return res.status(400).json({ message: `Sheet "${sheetName}" not found` });
    }

    // Convert sheet to JSON array of arrays to easily access by index (row, col)
    // header: 1 means give me an array of arrays
    const jsonData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    // Determine column index
    let colIndex = -1;
    // Check if columnRef is a letter (A, B, AA) or number
    if (/^[A-Za-z]+$/.test(columnRef)) {
       // Simple decoder for A, B... Z (Not robust for AA, but good for simple cases. 
       // Actually XLSX.utils.decode_col covers this nicely)
       colIndex = XLSX.utils.decode_col(columnRef.toUpperCase());
    } else {
       colIndex = parseInt(columnRef, 10);
       // If usage was 1-based index by user, we might need to adjust, but let's assume 0-based for numbers or standard letters
       // Typically users say "Column 1" meaning A? Or just "A". 
       // Let's stick to letters primarily or exact index if they parse. 
       // Actually, lets assume if it's a number string "0", it's 0.
    }
    
    if (colIndex < 0 || isNaN(colIndex)) {
         return res.status(400).json({ message: `Invalid column reference: ${columnRef}` });
    }

    // Extract data
    const productList: string[] = [];
    
    // Start from row 0? Or 1? Usually row 0 is header. 
    // Let's try to detect if row 0 looks like a header (optional) OR just grab everything that looks like a product.
    // For now, let's grab all non-empty strings.
    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row[colIndex] !== undefined) {
            const val = row[colIndex];
            // Filter out empty or header-like if needed? 
            // For now, keep it simple: stringify and trim.
            const strVal = String(val).trim();
            if (strVal) {
                productList.push(strVal);
            }
        }
    }

    // Save to JSON
    // Mapping keys: 'receipt', 'issuance' -> share 'receipt' probably? 
    // User said: "Receipt & Issuance product list will come from 1 excel file while the production one will come from another"
    // So 'receipt' and 'issuance' can use 'products-receipt.json'
    // 'production' uses 'products-production.json'
    
    let targetFileName = '';
    if (type === 'receipt' || type === 'issuance') {
        targetFileName = 'products-receipt.json';
    } else if (type === 'production') {
        targetFileName = 'products-production.json';
    } else {
        return res.status(400).json({ message: 'Invalid type' });
    }

    const filePath = path.join(DATA_DIR, targetFileName);
    fs.writeFileSync(filePath, JSON.stringify(productList, null, 2));

    return res.status(200).json({ 
        message: 'Product list updated successfully', 
        count: productList.length,
        firstFew: productList.slice(0, 3) 
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
