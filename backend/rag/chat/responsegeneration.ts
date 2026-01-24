import { RetrievalResult } from "./retrieval";
import Groq from 'groq-sdk';

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
function buildInterviewPrompt(
  userMessage: string,
  chunks: string,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const isFirstQuestion = conversationHistory.length === 0;
  
  // Detect user intent from CURRENT message
  const userWantsHint = /hint|help|explain|tell me|show me|i don't know|idk|stuck|lost/i.test(userMessage);
  const userWantsAnswer = /answer|solution|just tell|give me|reveal/i.test(userMessage);
  const userWantsBehavioral = /behavioral|soft skills|tell me about|story|experience|project|worked on|challenge|conflict/i.test(userMessage);
  const userWantsToMove = /move on|next|different|switch|change topic|something else|new question/i.test(userMessage);
  const userSeemsConfident = /yes|correct|right|exactly|true|definitely|sure|i think|i believe|that's it/i.test(userMessage);

  // Check if we've already asked this question multiple times
  const assistantMessages = conversationHistory.filter(m => m.role === "assistant");
  const lastQuestions = assistantMessages.slice(-3).map(m => m.content);
  
  let systemInstruction = "";
  
  if (userWantsToMove) {
    systemInstruction = `
The user wants to move on to a different topic or question.
Generate a NEW question on a DIFFERENT topic.
Do NOT revisit the previous question.`;
  } else if (userWantsBehavioral) {
    systemInstruction = `
The user is asking for behavioral questions.
Ask a behavioral/soft skills question like:
- Tell me about a challenge you faced
- Describe a time you had to learn something new
- How do you handle disagreements with teammates
- Tell me about your most impactful project

Make it specific and interview-realistic.`;
  } else if (userWantsAnswer) {
    systemInstruction = `
The user is asking for the answer. Provide it clearly and concisely.
Then add one follow-up: "Does that make sense? Any questions about it?"
This acknowledges they got it and moves forward.`;
  } else if (userWantsHint) {
    systemInstruction = `
The user is stuck or asking for help.
Provide a SINGLE helpful hint or break down the question.
Then ask a simpler version OR provide the answer if they've already struggled.
Do NOT keep asking the same hard question if they're clearly lost.`;
  } else if (userSeemsConfident) {
    systemInstruction = `
The user seems confident in their answer or understanding.
Acknowledge briefly: "Good" or "That's right" or similar.
Then move to a DIFFERENT question or topic.
Do NOT probe the same topic again.`;
  } else if (isFirstQuestion) {
    systemInstruction = `Generate an opening question that is challenging but fair.`;
  } else {
    systemInstruction = `Generate a follow-up based on their answer. You can:
1. Ask a deeper follow-up on the same topic (probe once)
2. Move to a completely different topic
Choose based on conversation flow.`;
  }

  // Build conversation context
  const conversationContext = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map((m, i) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n\n");

  return `You are a technical interviewer conducting a mock interview.

${systemInstruction}

Critical Rules:
1. LISTEN to explicit user requests (move on, behavioral, answer, etc)
2. Do NOT repeat the same question multiple times
3. If user says "I don't know" after 2 attempts, move forward
4. If user asks for answer, give it then MOVE ON
5. Be conversational - acknowledge good answers
6. Vary question types: technical, behavioral, edge cases
7. Track what you've already asked - DON'T re-ask

Context (study materials):
${chunks}

Conversation so far:
${conversationContext}

User's latest message: "${userMessage}"

Generate your response. Be natural. Listen to what they're actually asking for.`;
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
      temperature: 0.6, // Lowered even more for consistency
      max_completion_tokens: 600,
      top_p: 0.9, // Slightly reduced for better focus
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
function detectDifficulty(
  conversationHistory: Array<{ role: string; content: string }>
): "basic" | "intermediate" | "advanced" {
  if (conversationHistory.length === 0) return "basic";
  if (conversationHistory.length < 6) return "intermediate";
  return "advanced";
}

/**
 * Extract expected answer areas from question
 */
function extractExpectedAreas(question: string): string[] {
  const areas: string[] = [];
  const keywords = [
    "approach",
    "tradeoff",
    "edge case",
    "optimization",
    "complexity",
    "scalability",
    "answer",
    "explain",
    "hint",
  ];

  keywords.forEach((keyword) => {
    if (question.toLowerCase().includes(keyword)) {
      areas.push(keyword);
    }
  });

  return areas.length > 0 ? areas : ["conversation"];
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