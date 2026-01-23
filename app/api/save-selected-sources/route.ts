import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Recursively delete all files in a directory
 */
function clearDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return;
  }

  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively delete subdirectories
        clearDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        // Delete file
        fs.unlinkSync(filePath);
      }
    }
    console.log(`Cleared directory: ${dirPath}`);
  } catch (error) {
    console.error(`Error clearing directory ${dirPath}:`, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sources } = await req.json();

    // Get base directory
    const baseDir = process.cwd();
    const selectedSourcesPath = path.join(baseDir, 'backend/prep/selectedSources.json');
    const scrapedDir = path.join(baseDir, 'backend', 'rag', 'ingestion', 'scraped');
    const summariesDir = path.join(baseDir, 'backend', 'rag', 'ingestion', 'summaries');
    const chunksDir = path.join(baseDir, 'backend', 'rag', 'ingestion', 'chunks');

    // Ensure backend/prep directory exists
    const prepDir = path.dirname(selectedSourcesPath);
    if (!fs.existsSync(prepDir)) {
      fs.mkdirSync(prepDir, { recursive: true });
    }

    // Clear the scraped, summaries, and chunks directories
    console.log('Clearing previous ingestion data...');
    clearDirectory(scrapedDir);
    clearDirectory(summariesDir);
    clearDirectory(chunksDir);

    // Save new selected sources
    console.log('Saving sources to:', selectedSourcesPath);
    fs.writeFileSync(selectedSourcesPath, JSON.stringify(sources, null, 2));

    return NextResponse.json({ 
      success: true,
      message: 'Sources saved and directories cleared'
    });
  } catch (error: any) {
    console.error('Error in POST /api/save-selected-sources:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to save sources'
      },
      { status: 500 }
    );
  }
}