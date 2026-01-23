import { NextRequest, NextResponse } from "next/server";
import {
  createMemoryVectorStore,
  MemoryVectorStore,
} from "@/backend/rag/ingestion/embedding";
import { retrieveRelevantChunks } from "@/backend/rag/chat/retrieval";
import {
  generatePreparation,
  formatPreparationForFrontend,
} from "@/backend/rag/chat/responsegeneration";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Store vector store in memory (in production, use Redis/database)
let globalVectorStore: MemoryVectorStore | null = null;

interface RequestBody {
  mode: "prepare" | "chat";
  topics?: string[];
  message?: string;
  embeddingsData?: string; // JSON stringified embeddings from client
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * Initialize vector store from client embeddings
 */
function initializeVectorStore(embeddingsData: string): MemoryVectorStore {
  const store = createMemoryVectorStore();
  store.fromJSON(embeddingsData);
  globalVectorStore = store;
  return store;
}

/**
 * Handle preparation mode - generate explanations for topics
 */
async function handlePrepareMode(
  topics: string[],
  vectorStore: MemoryVectorStore
) {
  try {
    // Retrieve relevant chunks for each topic
    const retrievalResults = await retrieveRelevantChunks(vectorStore, topics);

    // Generate preparation content
    const preparations = await generatePreparation(retrievalResults);

    // Format for frontend
    const formattedData = formatPreparationForFrontend(preparations);

    return NextResponse.json(
      {
        success: true,
        mode: "prepare",
        data: formattedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in prepare mode:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate preparation content",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle chat mode - conversational Q&A
 */
async function handleChatMode(
  message: string,
  vectorStore: MemoryVectorStore,
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  try {
    // Extract topics from user message for retrieval
    const topicsToRetrieve = extractTopics(message);

    // Retrieve relevant chunks
    const retrievalResults = await retrieveRelevantChunks(
      vectorStore,
      topicsToRetrieve.length > 0 ? topicsToRetrieve : ["general"]
    );

    // Build context from retrieved chunks
    const context = retrievalResults
      .map((result) => result.chunks.join("\n"))
      .join("\n\n");

    // Build system prompt
    const systemPrompt = `You are an expert technical interview coach. You have access to the following knowledge base:

${context}

Use this information to provide accurate, helpful answers to interview preparation questions. Be concise but thorough. If the knowledge base doesn't contain relevant information, acknowledge it and provide general guidance.`;

    // Call Groq with conversation history
    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...conversationHistory,
      {
        role: "user" as const,
        content: message,
      },
    ];

    const response = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 1000,
      top_p: 1,
      stream: false,
    });

    const assistantResponse = response.choices[0].message.content || "";

    return NextResponse.json(
      {
        success: true,
        mode: "chat",
        response: assistantResponse,
        sources: retrievalResults.map((r) => ({
          topic: r.topic,
          chunkCount: r.chunks.length,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in chat mode:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate response",
      },
      { status: 500 }
    );
  }
}

/**
 * Extract potential topics from user message
 */
function extractTopics(message: string): string[] {
  // Simple extraction: split by common keywords
  const keywords = [
    "system design",
    "database",
    "api",
    "algorithms",
    "data structures",
    "distributed systems",
    "scalability",
    "optimization",
    "testing",
    "architecture",
  ];

  const foundTopics = keywords.filter((keyword) =>
    message.toLowerCase().includes(keyword)
  );

  return foundTopics.length > 0 ? foundTopics : [];
}

/**
 * POST handler
 */
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { mode, topics, message, embeddingsData, conversationHistory } = body;

    // Validate request
    if (!mode || !["prepare", "chat"].includes(mode)) {
      return NextResponse.json(
        { success: false, error: "Invalid mode" },
        { status: 400 }
      );
    }

    // Initialize or get vector store
    let vectorStore = globalVectorStore;

    if (embeddingsData) {
      vectorStore = initializeVectorStore(embeddingsData);
    }

    if (!vectorStore || vectorStore.embeddings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Vector store not initialized. Please provide embeddings data.",
        },
        { status: 400 }
      );
    }

    // Route to appropriate handler
    if (mode === "prepare") {
      if (!topics || topics.length === 0) {
        return NextResponse.json(
          { success: false, error: "Topics required for prepare mode" },
          { status: 400 }
        );
      }
      return await handlePrepareMode(topics, vectorStore);
    }

    if (mode === "chat") {
      if (!message) {
        return NextResponse.json(
          { success: false, error: "Message required for chat mode" },
          { status: 400 }
        );
      }
      return await handleChatMode(
        message,
        vectorStore,
        conversationHistory || []
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}