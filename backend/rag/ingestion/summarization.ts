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

async function generateSummary(rawText: string): Promise<Summary> {
  const prompt = `
You are preparing interview study material.

From the following text, extract:
1. Core explanation (concise)
2. Why this topic matters in technical interviews
3. Best practices
4. Common pitfalls or mistakes candidates make
5. Typical interview questions related to this topic

Text:
"""
${rawText}
"""

Output the result as a JSON object with the following structure:
{
  "explanation": string,
  "interviewRelevance": string,
  "bestPractices": string[],
  "pitfalls": string[],
  "exampleQuestions": string[]
}
`;

  try {
    const completion = await client.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
      reasoning_effort: "default",
      stream: false,
      stop: null,
    });

    // If the API returns a single response object:
    const content = completion.choices?.[0]?.message?.content || '';

    return JSON.parse(content) as Summary;
  } catch (error: any) {
    console.error('Failed to generate summary:', error.message);
    throw error;
  }
}

export async function summarizeSources(scrapedData: { title: string, url: string, text: string }[]) {
  const summariesDir = './summaries';
  if (!fs.existsSync(summariesDir)) fs.mkdirSync(summariesDir);

  for (const data of scrapedData) {
    try {
      const summary = await generateSummary(data.text);
      const filename = data.title.replace(/\W+/g, '_').slice(0, 40);
      fs.writeFileSync(path.join(summariesDir, `${filename}.json`), JSON.stringify(summary, null, 2));
      console.log(`Summarized: ${data.title}`);
    } catch (error: any) {
      console.error(`Failed to summarize ${data.title}:`, error.message);
    }
  }
}