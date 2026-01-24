import { NextRequest, NextResponse } from "next/server";
import {
  createMemoryVectorStore,
  MemoryVectorStore,
} from "@/backend/rag/ingestion/embedding";
import { retrieveRelevantChunks, retrieveForMode } from "@/backend/rag/chat/retrieval";
import {
  generatePreparation,
  formatPreparationForFrontend,
  generateInterviewQuestion,
  formatInterviewResponse,
} from "@/backend/rag/chat/responsegeneration";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Store vector store in memory (in production, use Redis/database)
let globalVectorStore: MemoryVectorStore | null = null;

interface RequestBody {
  mode: "PREPARATION" | "INTERVIEW";
  message?: string;
  embeddingsData?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * Initialize vector store from client embeddings
 */
function initializeVectorStore(embeddingsData: string): MemoryVectorStore {
  const store = createMemoryVectorStore();
  store.fromJSON(embeddingsData);
  globalVectorStore = store;
  console.log("✅ Vector store initialized with", store.embeddings.length, "embeddings");
  return store;
}

/**
 * Handle PREPARATION mode - teach only, no questions
 */
async function handlePreparationMode(
  message: string,
  vectorStore: MemoryVectorStore,
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  try {
    console.log("📚 PREPARATION mode - Message:", message);

    // Mode-specific retrieval: favor explanations and best practices
    const retrievalResults = await retrieveForMode(
      vectorStore,
      message,
      "PREPARATION"
    );

    if (retrievalResults.length === 0 || retrievalResults.every(r => r.chunks.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "No relevant content found.",
        },
        { status: 400 }
      );
    }

    // Generate structured explanation
    const preparations = await generatePreparation(retrievalResults);
    const formattedData = formatPreparationForFrontend(preparations);

    return NextResponse.json(
      {
        success: true,
        mode: "PREPARATION",
        data: formattedData,
        sources: retrievalResults.map((r) => ({
          topic: r.topic,
          chunkCount: r.chunks.length,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in PREPARATION mode:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate preparation content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle INTERVIEW mode - ask questions, probe, challenge
 */
async function handleInterviewMode(
  message: string,
  vectorStore: MemoryVectorStore,
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  try {
    console.log("🎯 INTERVIEW mode - User input:", message);

    // Mode-specific retrieval: focus on edge cases and pitfalls
    const retrievalResults = await retrieveForMode(
      vectorStore,
      message,
      "INTERVIEW"
    );

    if (retrievalResults.length === 0 || retrievalResults.every(r => r.chunks.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "No relevant questions found.",
        },
        { status: 400 }
      );
    }

    // Build context from retrieved chunks
    const context = retrievalResults
      .map((result) => result.chunks.join("\n"))
      .join("\n\n");

    // Generate interview question/follow-up
    const interviewResponse = await generateInterviewQuestion(
      message,
      context,
      conversationHistory
    );

    const formattedResponse = formatInterviewResponse(interviewResponse);

    return NextResponse.json(
      {
        success: true,
        mode: "INTERVIEW",
        response: formattedResponse,
        sources: retrievalResults.map((r) => ({
          topic: r.topic,
          chunkCount: r.chunks.length,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in INTERVIEW mode:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate interview question",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler - route by mode
 */
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { mode, message, embeddingsData, conversationHistory } = body;

    console.log("🚀 API request:", { mode, hasMessage: !!message });

    // Validate mode
    if (!mode || !["PREPARATION", "INTERVIEW"].includes(mode)) {
      return NextResponse.json(
        { success: false, error: "Invalid mode. Use PREPARATION or INTERVIEW." },
        { status: 400 }
      );
    }

    // Initialize vector store
    let vectorStore = globalVectorStore;
    if (embeddingsData) {
      vectorStore = initializeVectorStore(embeddingsData);
    }

    if (!vectorStore || vectorStore.embeddings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Vector store not initialized.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message required." },
        { status: 400 }
      );
    }

    // Route by mode
    if (mode === "PREPARATION") {
      return await handlePreparationMode(message, vectorStore, conversationHistory);
    }

    if (mode === "INTERVIEW") {
      return await handleInterviewMode(message, vectorStore, conversationHistory);
    }
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}