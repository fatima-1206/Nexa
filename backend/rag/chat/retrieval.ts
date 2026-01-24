import { MemoryVectorStore } from "../ingestion/embedding";
import { embed } from "../ingestion/embedding";

export interface RetrievalResult {
  topic: string;
  chunks: string[];
  metadata: Record<string, any>[];
}

type Mode = "PREPARATION" | "INTERVIEW";

/**
 * Retrieve chunks with mode-specific filtering
 */
export async function retrieveForMode(
  vectorStore: MemoryVectorStore,
  userMessage: string,
  mode: Mode
): Promise<RetrievalResult[]> {
  const queryEmbedding = await embed(userMessage);
  
  // Mode-specific K values
  const K = mode === "PREPARATION" ? 6 : 4;
  
  let relevantChunks = vectorStore.search(queryEmbedding, K);

  // Filter by mode section preference
  if (mode === "PREPARATION") {
    // Prefer explanation, best practices, pitfalls
    relevantChunks = relevantChunks.sort((a, b) => {
      const aScore = getPreparationScore(a.metadata);
      const bScore = getPreparationScore(b.metadata);
      return bScore - aScore;
    });
  } else if (mode === "INTERVIEW") {
    // Prefer edge cases, pitfalls, example questions
    relevantChunks = relevantChunks.sort((a, b) => {
      const aScore = getInterviewScore(a.metadata);
      const bScore = getInterviewScore(b.metadata);
      return bScore - aScore;
    });
  }

  return [{
    topic: userMessage.substring(0, 50),
    chunks: relevantChunks.map(chunk => chunk.content),
    metadata: relevantChunks.map(chunk => chunk.metadata)
  }];
}

/**
 * Score chunks for PREPARATION mode (favor teaching content)
 */
function getPreparationScore(metadata: Record<string, any>): number {
  const section = metadata?.section || "";
  const scores: Record<string, number> = {
    "explanation": 10,
    "best_practices": 8,
    "pitfalls": 7,
    "example": 5,
    "edge_case": 3,
  };
  return scores[section] || 1;
}

/**
 * Score chunks for INTERVIEW mode (favor challenge content)
 */
function getInterviewScore(metadata: Record<string, any>): number {
  const section = metadata?.section || "";
  const scores: Record<string, number> = {
    "pitfalls": 10,
    "edge_case": 9,
    "example_questions": 8,
    "tradeoffs": 7,
    "best_practices": 5,
    "explanation": 2,
  };
  return scores[section] || 1;
}

/**
 * Legacy function for backward compatibility
 */
export async function retrieveRelevantChunks(
  vectorStore: MemoryVectorStore,
  userMessage: string,
  topK: number = 5
): Promise<RetrievalResult[]> {
  return retrieveForMode(vectorStore, userMessage, "PREPARATION");
}

export function formatChunksForPrompt(chunks: string[]): string {
  return chunks
    .map((chunk, idx) => `[Chunk ${idx + 1}]\n${chunk}`)
    .join("\n\n");
}

export function getAllChunks(vectorStore: MemoryVectorStore): string[] {
  return vectorStore.embeddings.map(item => item.content);
}