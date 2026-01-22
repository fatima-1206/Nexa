import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const filePath = path.join(process.cwd(), 'backend/prep/selectedSources.json');
    if (!fs.existsSync(filePath)) {
      console.log("didn't find selected sources json file");
      return res.status(200).json({ sources: [] });
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return res.status(200).json({ sources: JSON.parse(data) });
  }
  res.status(405).end();
}