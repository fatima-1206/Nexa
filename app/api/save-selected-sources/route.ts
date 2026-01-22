import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const { sources } = await req.json();
  const filePath = path.join(process.cwd(), 'backend/prep/selectedSources.json');
  console.log('Saving sources to:', filePath);
  fs.writeFileSync(filePath, JSON.stringify(sources, null, 2));
  return NextResponse.json({ success: true });
}