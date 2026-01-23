// POST https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2

// # 6. Step 3 – ChromaDB + Embeddings (TypeScript)

// Now the “scary” part — it’s actually not bad.

// ---

// ## 6.1 Setup ChromaDB

// Run Chroma locally:

// ```bash
// docker run -p 8000:8000 chromadb/chroma
// ```

// ---

// ## 6.2 Chroma Client (TypeScript)

// ```ts
// import { ChromaClient } from "chromadb";

// export const chroma = new ChromaClient({
//   path: "http://localhost:8000"
// });
// ```

// ---

// ## 6.3 Create Collection

// ```ts
// const collection = await chroma.getOrCreateCollection({
//   name: "interview-prep"
// });
// ```

// ---

// ## 6.4 Embeddings

// Use OpenAI (or equivalent):

// ```ts
// import OpenAI from "openai";
// const openai = new OpenAI();

// async function embed(text: string): Promise<number[]> {
//   const res = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: text
//   });
//   return res.data[0].embedding;
// }
// ```

// ---

// ## 6.5 Store Chunks

// ```ts
// for (const chunk of chunks) {
//   const embedding = await embed(chunk.content);

//   await collection.add({
//     ids: crypto.randomUUID(),
//     embeddings: embedding,
//     documents: chunk.content,
//     metadatas: chunk.metadata
//   });
// }
// ```

// That’s it. You now have a **knowledge base**.
import { InferenceClient } from "@huggingface/inference";
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();
const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-mpnet-base-v2/pipeline/sentence-similarity';

// --- Embedding function ---
const client = new InferenceClient(process.env.HUGGINGFACE_API_TOKEN);

export async function embed(text: string): Promise<number[]> {
  if (!process.env.HUGGINGFACE_API_TOKEN) {
    throw new Error("Hugging Face API token not found in environment variables.");
  }

  try {
    // ✅ Use featureExtraction to get proper embedding vectors
    const output = await client.featureExtraction({
      model: "sentence-transformers/all-mpnet-base-v2",
      inputs: text,
    });

    if (Array.isArray(output) && output.length > 0) {
      return output as number[];
    }

    throw new Error("Unexpected embedding format from Hugging Face API");
  } catch (error: any) {
    console.error("Error in embed function:", error.message);
    throw error;
  }
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!process.env.HUGGINGFACE_API_TOKEN) {
    throw new Error("Hugging Face API token not found in environment variables.");
  }

  try {
    // ✅ Use featureExtraction for batch processing
    const output = await client.featureExtraction({
      model: "sentence-transformers/all-mpnet-base-v2",
      inputs: texts,
    });

    if (Array.isArray(output) && output.length > 0) {
      return output as number[][];
    }

    throw new Error("Unexpected embedding format from Hugging Face API");
  } catch (error: any) {
    console.error("Error in embedBatch function:", error.message);
    throw error;
  }
}

// --- Client-owned session types ---
export interface StoredEmbedding {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export interface MemoryVectorStore {
  embeddings: StoredEmbedding[];
  addEmbeddings(items: StoredEmbedding[]): void;
  search(queryEmbedding: number[], topK: number): StoredEmbedding[];
  toJSON(): string;
  fromJSON(json: string): void;
}

// --- Create in-memory vector store ---
export function createMemoryVectorStore(): MemoryVectorStore {
  const embeddings: StoredEmbedding[] = [];

  function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  return {
    embeddings,
    addEmbeddings(items: StoredEmbedding[]) {
      embeddings.push(...items);
    },
    search(queryEmbedding: number[], topK: number): StoredEmbedding[] {
      const scored = embeddings.map(item => ({
        item,
        score: cosineSimilarity(queryEmbedding, item.embedding)
      }));
      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(s => s.item);
    },
    toJSON(): string {
      return JSON.stringify(embeddings);
    },
    fromJSON(json: string): void {
      const data = JSON.parse(json);
      embeddings.length = 0;
      embeddings.push(...data);
    }
  };
}

// --- Example chunking function ---
function chunkText(text: string, chunkSize = 300): { content: string, metadata: any }[] {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push({ content: chunk, metadata: { start: i, end: i + chunk.length } });
    i += chunkSize;
  }
  return chunks;
}

// --- Client-side ingestion (returns serializable data) ---
export async function prepareChunksForClient(
  text: string
): Promise<StoredEmbedding[]> {
  const chunks = chunkText(text);
  const texts = chunks.map(c => c.content);
  const embeddings = await embedBatch(texts);

  return chunks.map((chunk, idx) => ({
    id: crypto.randomUUID(),
    content: chunk.content,
    embedding: embeddings[idx],
    metadata: chunk.metadata
  }));
}

// --- Send to client to store in IndexedDB/localStorage/React state ---
export async function ingestTextForClient(text: string): Promise<string> {
  const prepared = await prepareChunksForClient(text);
  const store = createMemoryVectorStore();
  store.addEmbeddings(prepared);
  return store.toJSON(); // Send this JSON to client
}