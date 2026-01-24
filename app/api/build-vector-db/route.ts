import { NextRequest, NextResponse } from 'next/server';
import { scrapeSources } from '@/backend/rag/ingestion/webscraper';
import { summarizeSources } from '@/backend/rag/ingestion/summarization';
import { createChunks } from '@/backend/rag/ingestion/chunking';
import { prepareChunksForClient, createMemoryVectorStore } from '@/backend/rag/ingestion/embedding';

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
    console.log("Starting scraping...");
    const scrapedData = await scrapeSources(sources);
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
    const summaries = await summarizeSources(scrapedData);
    console.log("Summarization complete");

    if (summaries.length === 0) {
      console.warn('No summaries were created');
      return NextResponse.json({ 
        success: true, 
        chunksCreated: 0, 
        vectorStore: '[]',
        warning: 'No summaries were created'
      });
    }

    let totalChunks = 0;

    // Step 3: Chunk each summary and prepare embeddings
    console.log("Chunking summaries...");
    const memoryVectorStore = createMemoryVectorStore();

    for (const { title, url, summary } of summaries) {
      try {
        const chunks = createChunks(summary, title, url);
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