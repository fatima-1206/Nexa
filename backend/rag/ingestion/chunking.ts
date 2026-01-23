// # 5. Step 2 – Chunking (Concept-Based, Not Token-Based)

// ### Why token chunking sucks

// Splitting every 500 tokens destroys meaning.

// Instead:

// * Each **summary section = one chunk**

// You already forced structure, so chunking is trivial.

// ---

// ## Chunk Creation

// ```ts
// type Chunk = {
//   content: string;
//   metadata: {
//     topic: string;
//     section: "explanation" | "bestPractices" | "pitfalls";
//     interviewLevel: "junior" | "mid" | "senior";
//     sourceUrl: string;
//   };
// };
// ```

// Example:

// ```ts
// {
//   content: "CAP theorem states that ...",
//   metadata: {
//     topic: "Distributed Systems",
//     section: "explanation",
//     interviewLevel: "mid",
//     sourceUrl: "https://..."
//   }
// }
// ```

// Each chunk should answer **one question well**.
// Import Node.js modules for file system and path operations
import * as fs from 'fs';
import * as path from 'path';

// Define the structure of a single chunk of information
type Chunk = {
  content: string; // The main text content of the chunk
  metadata: {
    topic: string; // The topic or title this chunk belongs to
    section: "explanation" | "bestPractices" | "pitfalls" | "interviewRelevance" | "exampleQuestions"; // The section type
    interviewLevel: "junior" | "mid" | "senior"; // Estimated interview level for this chunk
    sourceUrl: string; // URL of the original source
  };
};

// Structure for loaded summary files
type LoadedSummary = {
  title: string; // Title/topic of the summary
  url: string;   // Source URL
  summary: any;  // The summary object itself
};

// Heuristic function to infer the interview level from text content
function inferLevel(text: string): "junior" | "mid" | "senior" {
  // If certain keywords are present, assign a higher level
  if (/CAP theorem|tradeoff|consistency|availability/i.test(text)) return "mid";
  if (/linearizability|quorum|byzantine/i.test(text)) return "senior";
  // Default to "junior" if no keywords match
  return "junior";
}

// Loads all summary JSON files from a directory and returns them as LoadedSummary objects
function loadSummaries(summariesDir: string): LoadedSummary[] {
  const summaries: LoadedSummary[] = [];
  const files = fs.readdirSync(summariesDir); // List all files in the directory

  for (const file of files) {
    if (file.endsWith('.json')) { // Only process JSON files
      const filePath = path.join(summariesDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')); // Parse JSON content
      const title = path.basename(file, '.json').replace(/_/g, ' '); // Use filename as title
      // Use data.sourceUrl if present, otherwise empty string
      summaries.push({ title, url: data.sourceUrl || '', summary: data });
    }
  }
  return summaries;
}

// Converts a summary object into an array of concept-based chunks
function createChunks(summary: any, topic: string, sourceUrl: string): Chunk[] {
  const chunks: Chunk[] = [];

  // Add explanation section as a chunk if present
  if (summary.explanation) {
    chunks.push({
      content: summary.explanation,
      metadata: {
        topic,
        section: "explanation",
        interviewLevel: inferLevel(summary.explanation),
        sourceUrl,
      },
    });
  }

  // Add interview relevance section as a chunk if present
  if (summary.interviewRelevance) {
    chunks.push({
      content: summary.interviewRelevance,
      metadata: {
        topic,
        section: "interviewRelevance",
        interviewLevel: inferLevel(summary.interviewRelevance),
        sourceUrl,
      },
    });
  }

  // Add best practices section as a single chunk if present
  if (summary.bestPractices?.length) {
    chunks.push({
      content: "Best practices:\n- " + summary.bestPractices.join("\n- "),
      metadata: {
        topic,
        section: "bestPractices",
        interviewLevel: inferLevel(summary.bestPractices.join(" ")),
        sourceUrl,
      },
    });
  }

  // Add each pitfall as a separate chunk if present
  if (summary.pitfalls && Array.isArray(summary.pitfalls)) {
    for (const pitfall of summary.pitfalls) {
      chunks.push({
        content: pitfall,
        metadata: {
          topic,
          section: "pitfalls",
          interviewLevel: inferLevel(pitfall),
          sourceUrl,
        },
      });
    }
  }

  // Add each example question as a separate chunk if present
  if (summary.exampleQuestions && Array.isArray(summary.exampleQuestions)) {
    for (const question of summary.exampleQuestions) {
      chunks.push({
        content: question,
        metadata: {
          topic,
          section: "exampleQuestions",
          interviewLevel: inferLevel(question),
          sourceUrl,
        },
      });
    }
  }

  return chunks;
}

// Saves each chunk as a separate JSON file in the output directory
function saveChunks(chunks: Chunk[], outputDir: string, topic: string) {
  // Ensure the output directory exists (create if not)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write each chunk to a uniquely named file
  for (const [index, chunk] of chunks.entries()) {
    // Sanitize topic for filename and limit length
    const safeTopic = topic.replace(/\W+/g, '_').slice(0, 30);
    const filename = `chunk_${safeTopic}_${index + 1}.json`;
    fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(chunk, null, 2));
  }
}

// Main async function to load summaries, chunk them, and save the results
(async () => {
  try {
    const summariesDir = path.join(__dirname, 'summaries');
    const outputDir = path.join(__dirname, 'chunks');       // Directory to save chunk files

    const summaries = loadSummaries(summariesDir); // Load all summaries
    let totalChunks = 0; // Track total number of chunks created

    // For each summary, create and save its chunks
    for (const { title, url, summary } of summaries) {
      const chunks = createChunks(summary, title, url);
      saveChunks(chunks, outputDir, title);
      totalChunks += chunks.length;
    }

    // Log completion message
    console.log(`Chunking complete. ${totalChunks} chunks saved to ${outputDir}.`);
  } catch (error: any) {
    // Log any errors that occur during the process
    console.error('Error during chunking:', error.message);
  }
})();
// ...existing code...

// Export types and functions for use in other modules
export type { Chunk, LoadedSummary };
export { inferLevel, loadSummaries, createChunks, saveChunks };