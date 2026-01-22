import { NextRequest, NextResponse } from 'next/server';
import { scrapeSources } from '@/backend/rag/ingestion/webscraper';
import { summarizeSources } from '@/backend/rag/ingestion/summarization';
import { loadSummaries, createChunks, saveChunks } from '@/backend/rag/ingestion/chunking';
import { ingestChunksToChromaDB } from '@/backend/rag/ingestion/embedding';

// This route handles POST requests to build the vector DB
export async function POST(req: NextRequest) {
  try {
    console.log('Received request to build vector DB.');
    // Parse sources array from request body
    const { sources } = await req.json();
    if (!Array.isArray(sources)) {
      return NextResponse.json({ success: false, error: 'Invalid sources array.' }, { status: 400 });
    }

    console.log(`Processing ${sources.length} sources...`);
    // Step 1: Scrape the sources
    const scrapedData = await scrapeSources(sources);

    console.log("Summarizing scraped data...");
    // Step 2: Summarize the scraped data and save summaries
    await summarizeSources(scrapedData);

    console.log("Loading summaries from disk...");
    // Step 3: Load summaries from disk
    const summaries = loadSummaries('./summaries');
    let totalChunks = 0;

    console.log("Chunking summaries...");
    // Step 4: Chunk each summary, save chunks, and ingest into ChromaDB
    for (const { title, url, summary } of summaries) {
      const chunks = createChunks(summary, title, url);
      saveChunks(chunks, './chunks', title);
      totalChunks += chunks.length;

      // Batch ingest all chunks for this summary
      await ingestChunksToChromaDB(
        chunks.map(({ content, metadata }) => ({ content, metadata })),
        'interview-prep'
      );
    }

    // Respond with success and stats
    return NextResponse.json({ success: true, chunksCreated: totalChunks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Processing failed.' }, { status: 500 });
  }
}