import * as dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import { tavily } from "@tavily/core";
import * as fs from 'fs'; // Import the fs module for file operations
dotenv.config();

// Step 0: Define Input and Output Structures

const input = {
  companyName: "",
  role: "",
  missingSkills: [],
  roleSeniority: "",
  techStack: [],
  interviewType: ""
};

const output = {
    curatedSources: [],
    metadata: {
    date: "",
    credibility: "",
    depth: ""
  }
};

interface SearchInput {
    companyName: string;
    role: string;
    missingSkills: string[];
    roleSeniority: string;
    techStack: string[];
    interviewType: string;
}

interface Source {
    url: string;
    title: string;
    snippet: string;
    domain: string;
    publishedDate?: string;
    credibilityScore: number;
    keyConcepts: string[];
    skill: string;
}

interface SearchOutput {
    curatedSources: Source[];
    metadata: {
        date: string;
        credibility: string;
        depth: string;
    };
}

// Step 1: Expand Missing Skills into Search Queries
async function expandMissingSkillsToQueries(
    missingSkills: string[],
    role: string,
    seniority: string,
    interviewType: string,
    techStack: string[]
    ): Promise<Record<string, string[]>> {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    const prompt = `You are an expert interview prep specialist. Given missing skills, expand them into specific, targeted search queries that will find authoritative, recent content relevant to interview preparation.

    For each skill, generate 4 focused search queries that target:
    - Best practices and pitfalls
    - Role-seniority specific explanations
    - Interview-specific content
    - Important Concepts

    Context:
    - Role: ${role}
    - Seniority: ${seniority}
    - Interview Type: ${interviewType}
    - Tech Stack: ${techStack.join(", ")}
    - Missing Skills: ${missingSkills.join(", ")}

    Return a JSON object where keys are skill names and values are arrays of 4 search queries.
    Example format:
    {
    {
    "distributed systems": [
        "distributed systems best practices consistency vs availability common pitfalls",
        "distributed systems senior engineer architecture tradeoffs interview",
        "distributed systems system design interview question real-world examples"
        "distributed systems key concepts consensus partition tolerance 2021..2026",
    ],
    "rust": [
        "rust best practices memory safety common pitfalls",
        "rust senior engineer performance optimization interview topics",
        "rust interview questions ownership lifetimes borrow checker"
        "rust ownership borrowing key concepts cheatsheet 2021..2026",
    ]
    }`;

    const message = await groq.chat.completions.create({
        messages: [
        {
            role: "user",
            content: prompt
        }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1
    });

    const content = message.choices[0].message.content;
    if (!content) {
        throw new Error("Empty response from Groq");
    }
    
    // Log the raw response for debugging
    // console.log("Raw response from Groq:", content);

    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
    throw new Error("Could not parse search queries from response");
    }

    return JSON.parse(jsonMatch[0]);
}


// Step 2: Execute the Search (API Call)
async function executeSearch(queries: string[]): Promise<any[]> {
    const results: any[] = [];

    for (const query of queries) {
        const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: query,
            include_answer: false,
            max_results: 3,
            include_raw_content: false
        })
        });

        const data: unknown = await response.json();
        // Narrow the unknown to an object that may have a results array before accessing it
        if (typeof data === "object" && data !== null && "results" in data) {
        const maybeResults = (data as { results?: unknown }).results;
        if (Array.isArray(maybeResults)) {
            results.push(...(maybeResults as any[]));
        }
        }
    }

    return results;
}

// Step 3: Hard Filter — Eliminate Garbage Early
function hardFilterSources(sources: any[]): any[] {
    const blockedDomains = [
        "pinterest.com",
        "facebook.com",
        "instagram.com",
        "twitter.com",
        "tiktok.com",
        "ads.example.com",
        "youtube.com",
        "medium.com"
    ];

    const seoBadwords = [
        "affiliate",
        "sponsored",
        "sponsored post",
        "clickbait",
        "you won't believe"
    ];

    return sources.filter(source => {
        const url = source.url?.toLowerCase() || "";
        const title = source.title?.toLowerCase() || "";
        const content = source.content?.toLowerCase() || "";

        // Filter blocked domains
        if (blockedDomains.some(domain => url.includes(domain))) {
        return false;
        }

        // Filter SEO sludge
        if (seoBadwords.some(word => title.includes(word) || content.includes(word))) {
        return false;
        }

        // Filter low-quality indicators
        if (!source.title || source.title.length < 5) {
        return false;
        }

        return true;
    });
}

// Final Output
export async function searchForInterviewPrep(
    searchInput: SearchInput
): Promise<SearchOutput> {
    // Validate and provide default values for missing fields
    const missingSkills = searchInput.missingSkills || [];
    // const skills = searchInput.skills || [];
    const role = searchInput.role || "Unknown Role";
    const roleSeniority = searchInput.roleSeniority || "Unknown Seniority";
    const interviewType = searchInput.interviewType || "General";
    const techStack = searchInput.techStack || [];

    console.log("Expanding missing skills into search queries...");
    const skillQueries = await expandMissingSkillsToQueries(
        missingSkills,
        role,
        roleSeniority,
        interviewType,
        techStack
    );
    
    // Log the search queries
    console.log("\n🔎 Generated Search Queries:");
    console.log(JSON.stringify(skillQueries, null, 2));
    // write them to output.txt
    fs.writeFileSync('output.txt', JSON.stringify(skillQueries, null, 2));

    console.log("Executing searches via Tavily...");
    const allQueries = Object.values(skillQueries).flat();
    let rawResults = await executeSearch(allQueries);

    console.log("Hard filtering sources...");
    const filteredResults = hardFilterSources(rawResults);
    console.log("Number of sources found: ", filteredResults.length);
    // Construct the final output
    const output: SearchOutput = {
        curatedSources: filteredResults,
        metadata: {
            date: new Date().toISOString(),
            credibility: "high",
            depth: "comprehensive"
        }
    };

    // append the output to output.txt
    fs.appendFileSync('output.txt', JSON.stringify(output, null, 2));

    return output;
}