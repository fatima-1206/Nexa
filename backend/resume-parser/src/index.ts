import { extractTextFromPDF, extractTextFromFile } from './pdfExtractor';
import { AIResumeParser } from './aiParser';
import { ParsedResume } from './types';

/**
 * Main function to parse a resume from file using AI
 */
export async function parseResumeFromFile(filePath: string, githubToken?: string): Promise<ParsedResume> {
  let text: string;

  // Determine file type and extract text
  if (filePath.endsWith('.pdf')) {
    text = await extractTextFromPDF(filePath);
  } else if (filePath.endsWith('.txt')) {
    text = extractTextFromFile(filePath);
  } else {
    throw new Error('Unsupported file format. Please provide PDF or TXT file.');
  }

  // Parse the extracted text using AI
  const parser = new AIResumeParser(text, githubToken);
  return await parser.parse();
}

/**
 * Parse resume from raw text string using AI
 */
export async function parseResumeFromText(text: string, githubToken?: string): Promise<ParsedResume> {
  const parser = new AIResumeParser(text, githubToken);
  return await parser.parse();
}

// Export types
export * from './types';
