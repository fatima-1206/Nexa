import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save PDF to temporary location
    const tempFilePath = join(tmpdir(), `resume-${Date.now()}.pdf`);
    await writeFile(tempFilePath, buffer);

    try {
      // Get GitHub token from environment
      const githubToken = process.env.GITHUB_TOKEN;
      
      if (!githubToken) {
        await unlink(tempFilePath);
        return NextResponse.json(
          { error: 'GITHUB_TOKEN is not configured. Please add it to .env.local file.' },
          { status: 500 }
        );
      }
      
      // Dynamic import to handle TypeScript files
      const { parseResumeFromFile } = await import('../../../backend/resume-parser/src/index');
      
      // Parse the resume using AI parser (pass the token)
      const parsedData = await parseResumeFromFile(tempFilePath, githubToken);
      
      // Clean up temporary file
      await unlink(tempFilePath);
      
      return NextResponse.json(parsedData);
      
    } catch (parseError) {
      // Clean up temp file on error
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      
      console.error('Parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse resume', details: String(parseError) },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    );
  }
}
