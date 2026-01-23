import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type Summary = {
  explanation: string;
  interviewRelevance: string;
  bestPractices: string[];
  pitfalls: string[];
  exampleQuestions: string[];
};

// Truncate text to avoid token limits
function truncateText(text: string, maxChars: number = 3000): string {
  if (text.length > maxChars) {
    return text.slice(0, maxChars) + '\n[Text truncated...]';
  }
  return text;
}

// Extract JSON from response that may contain thinking tags
function extractJSON(content: string): Summary {
  // Remove <think> tags and their content
  const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  
  // Find JSON object in the content
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }
  
  return JSON.parse(jsonMatch[0]) as Summary;
}

async function generateSummary(rawText: string): Promise<Summary> {
  // Truncate text to avoid token limits
  const truncatedText = truncateText(rawText, 2000);
  
  const prompt = `You are preparing interview study material.

From the following text, extract:
1. Core explanation (concise, 1-2 sentences)
2. Why this topic matters in technical interviews (1-2 sentences)
3. Best practices (2-3 bullet points)
4. Common pitfalls or mistakes candidates make (2-3 bullet points)
5. Typical interview questions related to this topic (2-3 questions)

Text:
"""
${truncatedText}
"""

Output ONLY a valid JSON object with this exact structure (no markdown, no thinking tags, just JSON):
{
  "explanation": "string",
  "interviewRelevance": "string",
  "bestPractices": ["string", "string"],
  "pitfalls": ["string", "string"],
  "exampleQuestions": ["string", "string"]
}`;

  try {
    const completion = await client.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_completion_tokens: 1024,
      top_p: 0.95,
      stream: false,
    });

    const content = completion.choices?.[0]?.message?.content || '';
    return extractJSON(content);
  } catch (error: any) {
    console.error('Failed to generate summary:', error.message);
    throw error;
  }
}

export async function summarizeSources(
  scrapedData: { title: string; url: string; text: string }[],
  summariesDir: string
) {
  if (!fs.existsSync(summariesDir)) {
    fs.mkdirSync(summariesDir, { recursive: true });
  }

  for (const data of scrapedData) {
    try {
      // console.log(`Summarizing: ${data.title}...`);
      const summary = await generateSummary(data.text);
      const filename = data.title.replace(/\W+/g, '_').slice(0, 40);
      fs.writeFileSync(
        path.join(summariesDir, `${filename}.json`),
        JSON.stringify(summary, null, 2)
      );
      console.log(`✓ Summarized: ${data.title}`);
    } catch (error: any) {
      console.error(`✗ Failed to summarize ${data.title}:`, error.message);
    }
  }
}