import { NextRequest, NextResponse } from 'next/server';
import { scrapeSources } from '@/backend/rag/ingestion/webscraper';
import { summarizeSources } from '@/backend/rag/ingestion/summarization';
import { createChunks } from '@/backend/rag/ingestion/chunking';
import { prepareChunksForClient, createMemoryVectorStore } from '@/backend/rag/ingestion/embedding';

interface SkillExtractionResult {
  skills: string[];
  searchQueries: { skill: string; query: string }[];
}

interface TavilySearchResult {
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
  }>;
}

/**
 * Extract skills from job description using Groq LLM
 */
async function extractSkillsFromJobDescription(
  jobTitle: string,
  jobDescription: string,
  company: string
): Promise<SkillExtractionResult> {
  const prompt = `You are an expert technical interviewer and skills analyst. Analyze the following job posting and extract ALL required technical skills, tools, technologies, frameworks, and knowledge areas.

Job Title: ${jobTitle}
Company: ${company}
Job Description:
${jobDescription}

Extract and return:
1. A comprehensive list of technical skills (languages, frameworks, tools, methodologies, concepts)
2. For each skill, generate an optimized search query to find high-quality learning resources

Return ONLY a valid JSON object in this exact format:
{
  "skills": ["skill1", "skill2", "skill3"],
  "searchQueries": [
    {"skill": "skill1", "query": "skill1 interview questions and concepts explained"},
    {"skill": "skill2", "query": "skill2 best practices and tutorial"}
  ]
}

Be thorough but focus on the most important skills mentioned or implied in the job description.`;

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
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in LLM response');
    }

    const result = JSON.parse(jsonMatch[0]) as SkillExtractionResult;
    console.log(`Extracted ${result.skills.length} skills from job description`);
    
    return result;
  } catch (error) {
    console.error('Error extracting skills:', error);
    throw error;
  }
}

/**
 * Search for resources using Tavily API
 */
async function searchResourcesWithTavily(searchQueries: { skill: string; query: string }[]): Promise<any[]> {
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  
  if (!tavilyApiKey) {
    throw new Error('Tavily API key not found');
  }

  const sources: any[] = [];

  for (const { skill, query } of searchQueries.slice(0, 10)) { // Limit to 10 skills to avoid API limits
    try {
      console.log(`Searching for: ${skill}`);
      
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: query,
          search_depth: 'advanced',
          max_results: 2, // Get top 2 results per skill
          include_answer: false,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        console.error(`Tavily API error for ${skill}:`, response.statusText);
        continue;
      }

      const data: TavilySearchResult = await response.json();

      for (const result of data.results || []) {
        sources.push({
          id: `${skill}_${Date.now()}_${Math.random()}`,
          title: `${skill}: ${result.title}`,
          url: result.url,
          description: result.content.slice(0, 200),
          skill: skill,
        });
      }
    } catch (error) {
      console.error(`Error searching for ${skill}:`, error);
    }
  }

  console.log(`Found ${sources.length} total resources`);
  return sources;
}

export async function POST(req: NextRequest) {
  try {
    console.log('Starting automated interview preparation...');

    const body = await req.json();
    console.log('Received body:', {
      jobTitle: body.jobTitle,
      company: body.company,
      hasDescription: !!body.jobDescription,
      descriptionLength: body.jobDescription?.length || 0
    });
    
    const { jobTitle, jobDescription, company } = body;

    if (!jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Job title is required' },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Job description is required' },
        { status: 400 }
      );
    }

    // Step 1: Extract skills using Groq
    console.log('Step 1: Extracting skills from job description...');
    const { skills, searchQueries } = await extractSkillsFromJobDescription(
      jobTitle,
      jobDescription,
      company
    );

    if (searchQueries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No skills could be extracted from job description' },
        { status: 400 }
      );
    }

    // Step 2: Search for resources using Tavily
    console.log('Step 2: Searching for resources with Tavily...');
    const sources = await searchResourcesWithTavily(searchQueries);

    if (sources.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No resources found' },
        { status: 404 }
      );
    }

    // Step 3: Process through RAG pipeline
    console.log('Step 3: Processing through RAG pipeline...');

    // Scrape sources
    console.log('Scraping sources...');
    const scrapedData = await scrapeSources(sources);
    
    if (scrapedData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to scrape any sources' },
        { status: 500 }
      );
    }

    // Summarize
    console.log('Generating summaries...');
    const summaries = await summarizeSources(scrapedData);

    // Create chunks and vector store (in-memory)
    console.log('Creating chunks...');
    const memoryVectorStore = createMemoryVectorStore();
    let totalChunks = 0;

    for (const { title, url, summary } of summaries) {
      try {
        const chunks = createChunks(summary, title, url);
        totalChunks += chunks.length;

        // Prepare embeddings
        const preparedChunks = await Promise.all(
          chunks.map(chunk => prepareChunksForClient(chunk.content))
        );

        preparedChunks.flat().forEach(chunk => memoryVectorStore.addEmbeddings([chunk]));
      } catch (error) {
        console.error(`Error processing ${title}:`, error);
      }
    }

    console.log(`Successfully created ${totalChunks} chunks from ${sources.length} sources`);

    // Return the vector store and metadata
    const serializedStore = memoryVectorStore.toJSON();
    
    return NextResponse.json({
      success: true,
      skills: skills,
      sourcesCount: sources.length,
      chunksCreated: totalChunks,
      vectorStore: serializedStore,
      sources: sources.map(s => ({ title: s.title, url: s.url, skill: s.skill })),
    });
  } catch (error: any) {
    console.error('Error in automated interview preparation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}