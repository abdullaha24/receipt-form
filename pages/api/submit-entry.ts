import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 1. Get the configured endpoint
    const dataDir = path.join(process.cwd(), 'data');
    const settingsFile = path.join(dataDir, 'settings.json');
    
    if (!fs.existsSync(settingsFile)) {
      return res.status(400).json({ message: 'Configuration error: Settings file not found.' });
    }

    const fileData = fs.readFileSync(settingsFile, 'utf8');
    const settings = JSON.parse(fileData);
    const destinationUrl = settings.endpoint;

    if (!destinationUrl) {
      return res.status(400).json({ message: 'Configuration error: No API endpoint configured in settings.' });
    }

    // 2. Forward the request to the external webhook
    const externalResponse = await fetch(destinationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      throw new Error(`External API Error: ${externalResponse.status} ${externalResponse.statusText} - ${errorText}`);
    }
    
    // We don't necessarily need the body from the webhook, just success status
    // But let's try to parse it just in case
    let responseData = {};
    try {
        const text = await externalResponse.text();
        if (text) {
             responseData = JSON.parse(text);
        }
    } catch (e) {
        // Ignore JSON parse errors from webhook response
    }

    return res.status(200).json({ success: true, data: responseData });

  } catch (error: any) {
    console.error('Proxy Submission Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error during submission' });
  }
}
