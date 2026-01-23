import { NextRequest, NextResponse } from 'next/server';
import { scrapeSources } from '@/backend/rag/ingestion/webscraper';
import { summarizeSources } from '@/backend/rag/ingestion/summarization';
import { loadSummaries, createChunks, saveChunks } from '@/backend/rag/ingestion/chunking';
import { prepareChunksForClient, createMemoryVectorStore } from '@/backend/rag/ingestion/embedding';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function POST(req: NextRequest) {
  try {
    console.log('Received request to build vector DB.');

    // Parse sources array from request body
    const { sources } = await req.json();
    if (!Array.isArray(sources)) {
      return NextResponse.json({ success: false, error: 'Invalid sources array.' }, { status: 400 });
    }

    console.log(`Processing ${sources.length} sources...`);

    // Get the correct base path for the Next.js project
    const baseDir = process.cwd();
    const scrapedDir = path.join(baseDir, 'backend', 'rag', 'ingestion', 'scraped');
    const summariesDir = path.join(baseDir, 'backend', 'rag', 'ingestion', 'summaries');
    const chunksDir = path.join(baseDir, 'backend', 'rag', 'ingestion', 'chunks');

    // Ensure directories exist
    if (!fs.existsSync(scrapedDir)) {
      fs.mkdirSync(scrapedDir, { recursive: true });
    }
    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true });
    }
    if (!fs.existsSync(chunksDir)) {
      fs.mkdirSync(chunksDir, { recursive: true });
    }

    console.log(`Using base directory: ${baseDir}`);
    console.log(`Scraping to: ${scrapedDir}`);

    // Step 1: Scrape the sources
    console.log("Starting scraping...");
    const scrapedData = await scrapeSources(sources, scrapedDir);
    console.log(`Scraped ${scrapedData.length} sources successfully`);

    if (scrapedData.length === 0) {
      console.warn('No sources were successfully scraped');
      return NextResponse.json({ 
        success: true, 
        chunksCreated: 0, 
        vectorStore: '[]',
        warning: 'No sources were successfully scraped'
      });
    }

    // Step 2: Summarize the scraped data
    console.log("Summarizing scraped data...");
    await summarizeSources(scrapedData, summariesDir);
    console.log("Summarization complete");

    // Step 3: Load summaries from disk
    console.log("Loading summaries from disk...");
    if (!fs.existsSync(summariesDir)) {
      console.log(`Summaries directory not found at ${summariesDir}`);
      return NextResponse.json({ success: false, error: 'Summaries directory not found.' }, { status: 404 });
    }

    const summaryFiles = fs.readdirSync(summariesDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${summaryFiles.length} summary files`);

    if (summaryFiles.length === 0) {
      console.warn('No summaries were created');
      return NextResponse.json({ 
        success: true, 
        chunksCreated: 0, 
        vectorStore: '[]',
        warning: 'No summaries were created'
      });
    }

    const summaries = loadSummaries(summariesDir);
    let totalChunks = 0;

    // Step 4: Chunk each summary and prepare embeddings
    console.log("Chunking summaries...");
    const memoryVectorStore = createMemoryVectorStore();

    for (const { title, url, summary } of summaries) {
      try {
        const chunks = createChunks(summary, title, url);
        saveChunks(chunks, chunksDir, title);
        totalChunks += chunks.length;
        console.log(`Created ${chunks.length} chunks for "${title}"`);

        // Prepare embeddings for the client
        const preparedChunks = await Promise.all(
          chunks.map(chunk => prepareChunksForClient(chunk.content))
        );

        // Add prepared chunks to the in-memory vector store
        preparedChunks.flat().forEach(chunk => memoryVectorStore.addEmbeddings([chunk]));
      } catch (chunkError) {
        console.error(`Error chunking "${title}":`, chunkError);
      }
    }

    console.log(`Chunking complete. Total chunks: ${totalChunks}`);

    // Respond with the serialized vector store for the client
    const serializedStore = memoryVectorStore.toJSON();
    return NextResponse.json({ 
      success: true, 
      chunksCreated: totalChunks, 
      vectorStore: serializedStore 
    });
  } catch (error: any) {
    console.error('Error in POST /api/build-vector-db:', error.message);
    console.error(error.stack);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Processing failed.' 
    }, { status: 500 });
  }
}