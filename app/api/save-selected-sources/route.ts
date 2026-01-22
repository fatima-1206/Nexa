import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sources } = req.body;
    // Save to a file or database; here we use a JSON file for demo
    const filePath = path.join(process.cwd(), 'backend/prep/selectedSources.json');
    fs.writeFileSync(filePath, JSON.stringify(sources, null, 2));
    return res.status(200).json({ success: true });
  }
  res.status(405).end();
}