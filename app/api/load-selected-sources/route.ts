import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'backend/prep/selectedSources.json');
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ sources: [] });
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return NextResponse.json({ sources: JSON.parse(data) });
}