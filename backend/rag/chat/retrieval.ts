import { MemoryVectorStore, StoredEmbedding } from "../ingestion/embedding";
import { embed } from "../ingestion/embedding";

export interface RetrievalResult {
  topic: string;
  chunks: string[];
  metadata: Record<string, any>[];
}

/**
 * Retrieve relevant chunks from the vector store based on user message
 */
export async function retrieveRelevantChunks(
  vectorStore: MemoryVectorStore,
  userMessage: string,
  topK: number = 5
): Promise<RetrievalResult[]> {
  // Embed the entire user message as a single query
  const queryEmbedding = await embed(userMessage);
  
  // Search for similar chunks
  const relevantChunks = vectorStore.search(queryEmbedding, topK);

  return [{
    topic: "search_results",
    chunks: relevantChunks.map(chunk => chunk.content),
    metadata: relevantChunks.map(chunk => chunk.metadata)
  }];
}

/**
 * Format retrieved chunks into a prompt-friendly string
 */
export function formatChunksForPrompt(chunks: string[]): string {
  return chunks
    .map((chunk, idx) => `[Chunk ${idx + 1}]\n${chunk}`)
    .join("\n\n");
}

/**
 * Get all chunks for a fallback/context (in case no retrieval matches)
 */
export function getAllChunks(vectorStore: MemoryVectorStore): string[] {
  return vectorStore.embeddings.map(item => item.content);
}