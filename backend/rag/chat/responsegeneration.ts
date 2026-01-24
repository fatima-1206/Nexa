import { Groq } from "groq-sdk";
import { RetrievalResult } from "./retrieval";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface PreparationModeResponse {
  topic: string;
  explanation: string;
  keyPoints: string[];
  commonMistakes: string[];
}

export interface InterviewModeResponse {
  question: string;
  difficulty: "basic" | "intermediate" | "advanced";
  expectedAreas: string[];
  followUpHints?: string[];
}

/**
 * Build teaching prompt for PREPARATION mode
 */
function buildPrepPrompt(topic: string, chunks: string): string {
  return `You are an expert software engineer and instructor preparing someone for technical interviews.

Topic: "${topic}"

Rules (STRICT):
- DO NOT ask questions
- DO NOT simulate an interviewer
- Your role is to TEACH and EXPLAIN
- Focus on interview-relevant understanding

Based on the following materials, teach this topic clearly with:
1. Core concept explanation
2. Why interviewers care about this
3. Best practices and patterns
4. Common pitfalls to avoid
5. One practical example

Materials:
${chunks}

Format your answer with clear sections and use practical, interview-relevant language.`;
}

/**
 * Build questioning prompt for INTERVIEW mode
 */
function buildInterviewPrompt(userMessage: string, chunks: string, conversationHistory: Array<{ role: string; content: string }>): string {
  const isFirstQuestion = conversationHistory.length === 0;
  
  return `You are a technical interviewer conducting a mock interview.

${isFirstQuestion ? "Generate an opening question." : "Generate a follow-up question based on the conversation."}

Rules (STRICT):
- DO ask challenging questions
- DO probe for depth and tradeoffs
- DO NOT teach or explain unless explicitly asked
- Focus on edge cases and problem-solving
- Increase difficulty based on previous answers

Context (study materials for reference):
${chunks}

${conversationHistory.length > 0 ? `Previous exchange:\n${conversationHistory.slice(-2).map(m => `${m.role}: ${m.content}`).join('\n')}\n` : ""}

Generate a single focused question that:
1. Is clear and unambiguous
2. Tests practical understanding
3. Has room for follow-ups
4. Is appropriate for a technical interview`;
}

/**
 * Generate explanation for PREPARATION mode
 */
export async function generateTopicExplanation(
  topic: string,
  chunks: string[]
): Promise<PreparationModeResponse> {
  const chunksText = chunks.join("\n\n");
  const prompt = buildPrepPrompt(topic, chunksText);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 2000,
      top_p: 1,
      stream: false,
    });

    const fullContent = chatCompletion.choices[0].message.content || "";

    return {
      topic,
      explanation: fullContent,
      keyPoints: extractKeyPoints(fullContent),
      commonMistakes: extractCommonMistakes(fullContent),
    };
  } catch (error) {
    console.error(`Error generating explanation for "${topic}":`, error);
    throw error;
  }
}

/**
 * Generate question for INTERVIEW mode
 */
export async function generateInterviewQuestion(
  userMessage: string,
  context: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<InterviewModeResponse> {
  const prompt = buildInterviewPrompt(userMessage, context, conversationHistory);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_completion_tokens: 500,
      top_p: 1,
      stream: false,
    });

    const fullContent = chatCompletion.choices[0].message.content || "";

    return {
      question: fullContent,
      difficulty: detectDifficulty(conversationHistory),
      expectedAreas: extractExpectedAreas(fullContent),
    };
  } catch (error) {
    console.error("Error generating interview question:", error);
    throw error;
  }
}

/**
 * Generate preparation for multiple topics
 */
export async function generatePreparation(
  retrievalResults: RetrievalResult[]
): Promise<PreparationModeResponse[]> {
  const responses: PreparationModeResponse[] = [];

  for (const result of retrievalResults) {
    const response = await generateTopicExplanation(result.topic, result.chunks);
    responses.push(response);
  }

  return responses;
}

/**
 * Extract key points from content
 */
function extractKeyPoints(content: string): string[] {
  const keyPointsMatch = content.match(
    /(?:key\s+points?|important|remember)[\s\S]*?(?=\n\n|common\s+mistakes|pitfalls|$)/i
  );

  if (!keyPointsMatch) return [];

  return keyPointsMatch[0]
    .split("\n")
    .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•") || line.trim().match(/^\d+\./))
    .map((line) => line.replace(/^[-•\d.]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Extract common mistakes from content
 */
function extractCommonMistakes(content: string): string[] {
  const mistakesMatch = content.match(
    /(?:common\s+mistakes?|avoid|pitfalls)[\s\S]*?(?=\n\n|best\s+practices|$)/i
  );

  if (!mistakesMatch) return [];

  return mistakesMatch[0]
    .split("\n")
    .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•") || line.trim().match(/^\d+\./))
    .map((line) => line.replace(/^[-•\d.]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Detect question difficulty based on conversation depth
 */
function detectDifficulty(conversationHistory: Array<{ role: string; content: string }>): "basic" | "intermediate" | "advanced" {
  if (conversationHistory.length === 0) return "basic";
  if (conversationHistory.length < 4) return "intermediate";
  return "advanced";
}

/**
 * Extract expected answer areas from question
 */
function extractExpectedAreas(question: string): string[] {
  const areas: string[] = [];
  const keywords = ["approach", "tradeoff", "edge case", "optimization", "complexity", "scalability"];
  
  keywords.forEach(keyword => {
    if (question.toLowerCase().includes(keyword)) {
      areas.push(keyword);
    }
  });

  return areas.length > 0 ? areas : ["problem-solving"];
}

/**
 * Format preparation responses for frontend
 */
export function formatPreparationForFrontend(
  responses: PreparationModeResponse[]
): Record<string, any> {
  return responses.reduce((acc, response) => {
    acc[response.topic] = {
      explanation: response.explanation,
      keyPoints: response.keyPoints,
      commonMistakes: response.commonMistakes,
    };
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Format interview response for frontend
 */
export function formatInterviewResponse(response: InterviewModeResponse): string {
  return `**[${response.difficulty.toUpperCase()}]** ${response.question}`;
}