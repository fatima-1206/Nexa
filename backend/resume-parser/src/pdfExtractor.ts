import fs from 'fs';
import pdf from 'pdf-parse';

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error}`);
  }
}

/**
 * Extract text from plain text file
 */
export function extractTextFromFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read text file: ${error}`);
  }
}
