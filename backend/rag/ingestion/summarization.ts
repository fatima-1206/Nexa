import path from 'path';

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
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return extractJSON(content);
  } catch (error: any) {
    console.error('Failed to generate summary:', error.message);
    throw error;
  }
}

export async function summarizeSources(
  scrapedData: { title: string; url: string; text: string }[]
): Promise<{ title: string; url: string; summary: Summary }[]> {
  const results = [];

  for (const data of scrapedData) {
    try {
      console.log(`Summarizing: ${data.title}...`);
      const summary = await generateSummary(data.text);
      results.push({
        title: data.title,
        url: data.url,
        summary
      });
      console.log(`✓ Summarized: ${data.title}`);
    } catch (error: any) {
      console.error(`✗ Failed to summarize ${data.title}:`, error.message);
    }
  }

  return results;
}