import { NextRequest, NextResponse } from 'next/server';
import { scrapeSources } from '@/backend/prep/webscraper';

export async function POST(req: NextRequest) {
  try {
    const { sources } = await req.json();
    if (!Array.isArray(sources)) {
      return NextResponse.json({ success: false, error: 'Invalid sources array.' }, { status: 400 });
    }

    const results = await scrapeSources(sources);

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Scraping failed.' }, { status: 500 });
  }
}