import { NextRequest, NextResponse } from 'next/server';
import { searchForInterviewPrep } from '../../../backend/prep/searchprepsources';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Pass the full body as input to the backend function
    const results = await searchForInterviewPrep(body);
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}