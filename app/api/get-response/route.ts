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
  mode: "prepare" | "chat" | "debug";
  topics?: string[];
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
 * Debug mode - inspect what's in the vector store
 */
async function handleDebugMode(vectorStore: MemoryVectorStore) {
  try {
    const totalEmbeddings = vectorStore.embeddings.length;
    const sampleEmbeddings = vectorStore.embeddings.slice(0, 5).map((e) => ({
      content: e.content.substring(0, 100) + "...",
      metadata: e.metadata,
    }));

    return NextResponse.json(
      {
        success: true,
        mode: "debug",
        totalEmbeddings,
        sampleEmbeddings,
        vectorStoreInfo: {
          hasEmbeddings: totalEmbeddings > 0,
          embeddingDimensions: vectorStore.embeddings[0]?.embedding?.length || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in debug mode:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to debug vector store",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle preparation mode - generate explanations for topics
 */
async function handlePrepareMode(
  topics: string[],
  vectorStore: MemoryVectorStore
) {
  try {
    console.log("🔍 Prepare mode - Topics requested:", topics);

    // Retrieve relevant chunks for each topic
    const retrievalResults = await retrieveRelevantChunks(vectorStore, topics);
    console.log("✅ Retrieved results:", {
      topicsRequested: topics.length,
      resultsReturned: retrievalResults.length,
      details: retrievalResults.map((r) => ({
        topic: r.topic,
        chunksFound: r.chunks.length,
        firstChunkPreview: r.chunks[0]?.substring(0, 100) || "No chunks",
      })),
    });

    if (retrievalResults.length === 0 || retrievalResults.every(r => r.chunks.length === 0)) {
      console.warn("⚠️  No chunks retrieved for topics:", topics);
      return NextResponse.json(
        {
          success: false,
          error: "No relevant content found for the requested topics. Try different keywords.",
          debug: {
            topicsSearched: topics,
            vectorStoreSize: vectorStore.embeddings.length,
          },
        },
        { status: 400 }
      );
    }

    // Generate preparation content
    const preparations = await generatePreparation(retrievalResults);
    console.log("✅ Generated preparations for", preparations.length, "topics");

    // Format for frontend
    const formattedData = formatPreparationForFrontend(preparations);

    return NextResponse.json(
      {
        success: true,
        mode: "prepare",
        data: formattedData,
        debug: {
          topicsProcessed: topics,
          chunksRetrieved: retrievalResults.reduce((sum, r) => sum + r.chunks.length, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in prepare mode:", error);
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
 * Handle chat mode - conversational Q&A
 */
async function handleChatMode(
  message: string,
  vectorStore: MemoryVectorStore,
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  try {
    console.log("💬 Chat mode - User message:", message);

    // Extract topics from user message for retrieval
    const topicsToRetrieve = extractTopics(message);
    console.log("🔎 Extracted topics:", topicsToRetrieve.length > 0 ? topicsToRetrieve : "['general']");

    // Retrieve relevant chunks
    const retrievalResults = await retrieveRelevantChunks(
      vectorStore,
      topicsToRetrieve.length > 0 ? topicsToRetrieve : ["general"]
    );

    console.log("📚 Retrieval results:", {
      topicsSearched: topicsToRetrieve.length > 0 ? topicsToRetrieve : ["general"],
      resultsFound: retrievalResults.length,
      chunksPerTopic: retrievalResults.map((r) => ({
        topic: r.topic,
        chunks: r.chunks.length,
      })),
      firstChunkPreview: retrievalResults[0]?.chunks[0]?.substring(0, 150) || "No chunks",
    });

    // Build context from retrieved chunks
    const context = retrievalResults
      .map((result) => result.chunks.join("\n"))
      .join("\n\n");

    console.log("📖 Context length:", context.length, "characters");

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

    console.log("📤 Sending to Groq with", messages.length, "total messages");

    const response = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 1000,
      top_p: 1,
      stream: false,
    });

    const assistantResponse = response.choices[0].message.content || "";
    console.log("✅ Groq response length:", assistantResponse.length, "characters");

    return NextResponse.json(
      {
        success: true,
        mode: "chat",
        response: assistantResponse,
        sources: retrievalResults.map((r) => ({
          topic: r.topic,
          chunkCount: r.chunks.length,
        })),
        debug: {
          topicsExtracted: topicsToRetrieve,
          contextLength: context.length,
          messagesSentToLLM: messages.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in chat mode:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Extract potential topics from user message
 */
function extractTopics(message: string): string[] {
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

    console.log("🚀 API request received:", { mode, topics, hasMessage: !!message });

    // Validate request
    if (!mode || !["prepare", "chat", "debug"].includes(mode)) {
      return NextResponse.json(
        { success: false, error: "Invalid mode" },
        { status: 400 }
      );
    }

    // Initialize or get vector store
    let vectorStore = globalVectorStore;

    if (embeddingsData) {
      console.log("📥 Initializing vector store from client embeddings");
      vectorStore = initializeVectorStore(embeddingsData);
    }

    if (!vectorStore || vectorStore.embeddings.length === 0) {
      console.error("❌ Vector store not initialized or empty");
      return NextResponse.json(
        {
          success: false,
          error: "Vector store not initialized. Please provide embeddings data.",
          debug: {
            hasVectorStore: !!vectorStore,
            embeddingsCount: vectorStore?.embeddings.length || 0,
          },
        },
        { status: 400 }
      );
    }

    // Route to appropriate handler
    if (mode === "debug") {
      return await handleDebugMode(vectorStore);
    }

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