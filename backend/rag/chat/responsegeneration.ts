import { RetrievalResult } from "./retrieval";

export interface PreparationModeResponse {
  topic: string;
  explanation: string;
  keyPoints: string[];
  commonMistakes: string[];
}

/**
 * Build teaching prompt for a topic
 */
function buildPrepPrompt(topic: string, chunks: string): string {
  return `You are an expert software engineer and instructor preparing someone for technical interviews.

Topic: "${topic}"

Based on the following materials, teach this topic clearly with:
1. A comprehensive explanation
2. Key points to remember
3. Common mistakes to avoid
4. Best practices

Materials:
${chunks}

Provide your response in a structured format with clear sections.`;
}

/**
 * Generate preparation content for a single topic
 */
export async function generateTopicExplanation(
  topic: string,
  chunks: string[]
): Promise<PreparationModeResponse> {
  const chunksText = chunks.join("\n\n");
  const prompt = buildPrepPrompt(topic, chunksText);

  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const fullContent = data.choices[0].message.content || "";

    // Parse the response into structured format
    return {
      topic,
      explanation: fullContent,
      keyPoints: extractKeyPoints(fullContent),
      commonMistakes: extractCommonMistakes(fullContent),
    };
  } catch (error) {
    console.error(`Error generating explanation for topic "${topic}":`, error);
    throw error;
  }
}

/**
 * Generate preparation content for multiple topics
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
 * Extract key points from LLM response (simple extraction)
 */
function extractKeyPoints(content: string): string[] {
  const keyPointsMatch = content.match(
    /(?:key\s+points?|important|remember)[\s\S]*?(?=\n\n|common\s+mistakes|$)/i
  );

  if (!keyPointsMatch) return [];

  return keyPointsMatch[0]
    .split("\n")
    .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Extract common mistakes from LLM response
 */
function extractCommonMistakes(content: string): string[] {
  const mistakesMatch = content.match(
    /(?:common\s+mistakes?|avoid|pitfalls)[\s\S]*?(?=\n\n|best\s+practices|$)/i
  );

  if (!mistakesMatch) return [];

  return mistakesMatch[0]
    .split("\n")
    .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Format preparation responses for frontend consumption
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