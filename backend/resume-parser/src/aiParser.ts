import fs from 'fs';
import Groq from 'groq-sdk';
import { ParsedResume } from './types';

const groq = new Groq();
const modelName = "llama-3.3-70b-versatile";

/**
 * AI-powered resume parser using Groq LLM
 */
export class AIResumeParser {
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  /**
   * Parse resume using Groq LLM and return structured JSON
   */
  async parse(): Promise<ParsedResume> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt();

    try {
      const response = await groq.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from Groq model');
      }

      const parsedData = JSON.parse(content) as ParsedResume;
      return this.validateAndCleanData(parsedData);
    } catch (error) {
      console.error('Error parsing resume with Groq:', error);
      throw new Error(`Groq parsing failed: ${error}`);
    }
  }

  /**
   * System prompt that defines the parsing task and output format
   */
  private getSystemPrompt(): string {
    return `You are an expert resume parser. Extract structured information from resume text and return it as valid JSON.

You must respond with ONLY a JSON object in this exact format (no markdown, no explanations):

{
  "profile": {
    "name": "string",
    "title": "string",
    "location": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "github": "string",
    "website": "string",
    "summary": "string"
  },
  "skills": ["skill1", "skill2"],
  "experiences": [{
    "title": "string",
    "company": "string",
    "location": "string",
    "period": "string",
    "description": ["string"]
  }],
  "education": [{
    "degree": "string",
    "school": "string",
    "location": "string",
    "year": "string",
    "gpa": "string",
    "focus": "string"
  }],
  "certifications": [{
    "name": "string",
    "issuer": "string",
    "year": "string"
  }],
  "projects": [{
    "name": "string",
    "description": "string",
    "tech": ["string"],
    "impact": "string"
  }]
}

Rules:
- Use empty string "" for missing text fields
- Use empty array [] for missing lists
- Extract all technical skills mentioned
- Keep job/project descriptions concise
- No additional text outside the JSON object`;
  }

  /**
   * User prompt with the actual resume text
   */
  private getUserPrompt(): string {
    return `Parse this resume and return valid JSON:\n\n${this.text}`;
  }

  /**
   * Validate and clean the parsed data
   */
  private validateAndCleanData(data: ParsedResume): ParsedResume {
    // Ensure all required fields exist
    const cleaned: ParsedResume = {
      profile: data.profile || {},
      skills: Array.isArray(data.skills) ? data.skills : [],
      experiences: Array.isArray(data.experiences) ? data.experiences : [],
      education: Array.isArray(data.education) ? data.education : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
    };

    // Remove duplicate skills
    cleaned.skills = [...new Set(cleaned.skills)];

    // Ensure experiences have description arrays
    cleaned.experiences = cleaned.experiences.map(exp => ({
      ...exp,
      description: Array.isArray(exp.description) ? exp.description : []
    }));

    // Ensure projects have tech arrays
    cleaned.projects = cleaned.projects.map(proj => ({
      ...proj,
      tech: Array.isArray(proj.tech) ? proj.tech : []
    }));

    return cleaned;
  }
}
