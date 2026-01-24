import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { AIResumeParser } from '../../../backend/resume-parser/src/aiParser';

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
      // Read the resume text (you may need a PDF parser here)
      const resumeText = buffer.toString('utf-8'); // Replace with actual PDF-to-text logic

      // Parse the resume using AI parser
      const parser = new AIResumeParser(resumeText);
      const parsedData = await parser.parse();

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
