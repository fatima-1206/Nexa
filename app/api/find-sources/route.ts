import { NextRequest, NextResponse } from 'next/server';
import { searchForInterviewPrep } from '../../../backend/prep/searchprepsources';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // console.log("DEBUG: Received body for find-sources:", body);

    // Pass the full body as input to the backend function
    const results = await searchForInterviewPrep(body);
    console.log("DEBUG: Results from searchForInterviewPrep:", results);
    
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error("ERROR in /api/find-sources:", error.message, error.stack);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}