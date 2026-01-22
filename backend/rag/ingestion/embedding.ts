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

// ---
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { ChromaClient } from 'chromadb';

dotenv.config();

const HF_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2';
const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

// --- Embedding function ---
export async function embed(text: string): Promise<number[]> {
  if (!HF_API_TOKEN) {
    throw new Error('Hugging Face API token not found in environment variables.');
  }

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
  }

  const result = (await response.json()) as number[] | number[][] | unknown;

  if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
    return result[0] as number[];
  }
  if (Array.isArray(result) && result.every((v) => typeof v === 'number')) {
    return result as number[];
  }

  throw new Error('Unexpected embedding format from Hugging Face API');
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!HF_API_TOKEN) throw new Error('Hugging Face API token not found in environment variables.');

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: texts }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result as number[][];
  }
  throw new Error('Unexpected embedding format from Hugging Face API');
}

// --- ChromaDB setup ---
export const chroma = new ChromaClient({
  path: "http://localhost:8000"
});

// --- Collection creation ---
export async function getOrCreateCollection(name: string) {
  return await chroma.getOrCreateCollection({ name });
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

// --- Main ingestion pipeline ---
export async function ingestTextToChromaDB(text: string, collectionName: string) {
  const collection = await getOrCreateCollection(collectionName);
  const chunks = chunkText(text);

  for (const chunk of chunks) {
    const embedding = await embed(chunk.content);

    await collection.add({
      ids: [crypto.randomUUID()],
      embeddings: [embedding],
      documents: [chunk.content],
      metadatas: [chunk.metadata]
    });
  }
  console.log(`Ingested ${chunks.length} chunks into collection "${collectionName}"`);
}

// Accepts an array of chunks: [{ content, metadata }]
export async function ingestChunksToChromaDB(
  chunks: { content: string, metadata: any }[],
  collectionName: string
) {
  if (chunks.length === 0) return;

  const collection = await getOrCreateCollection(collectionName);
  const texts = chunks.map(c => c.content);
  const metadatas = chunks.map(c => c.metadata);
  const ids = chunks.map(() => crypto.randomUUID());

  const embeddings = await embedBatch(texts);

  await collection.add({
    ids,
    embeddings,
    documents: texts,
    metadatas,
  });

  console.log(`Ingested ${chunks.length} chunks into collection "${collectionName}"`);
}

// --- Example usage ---
// (Uncomment to run directly)
// (async () => {
//   const text = "Your long document or text goes here...";
//   await ingestTextToChromaDB(text, "interview-prep");
// })();
