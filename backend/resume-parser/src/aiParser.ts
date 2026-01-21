import OpenAI from 'openai';
import { ParsedResume } from './types';

const endpoint = "https://models.github.ai/inference";
const modelName = "openai/gpt-4o";

/**
 * AI-powered resume parser using GPT-4o via GitHub inference
 */
export class AIResumeParser {
  private client: OpenAI;
  private text: string;

  constructor(text: string, token?: string) {
    const apiKey = token || process.env.GITHUB_TOKEN;
    
    if (!apiKey) {
      throw new Error('GITHUB_TOKEN is required. Pass it as a parameter or set it in environment variables.');
    }
    
    this.text = text;
    this.client = new OpenAI({ 
      baseURL: endpoint, 
      apiKey: apiKey 
    });
  }

  /**
   * Parse resume using GPT-4o and return structured JSON
   */
  async parse(): Promise<ParsedResume> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt();

    try {
      const response = await this.client.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        top_p: 1.0,
        max_tokens: 4000,
        model: modelName,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from AI model');
      }

      const parsedData = JSON.parse(content) as ParsedResume;
      return this.validateAndCleanData(parsedData);
    } catch (error) {
      console.error('Error parsing resume with AI:', error);
      throw new Error(`AI parsing failed: ${error}`);
    }
  }

  /**
   * System prompt that defines the parsing task and output format
   */
  private getSystemPrompt(): string {
    return `You are an expert resume parser. Your task is to extract structured information from resume text and output it as JSON.

Extract the following information:

1. **profile**: Personal information
   - name: Full name
   - title: Current job title or role (e.g., "AI Engineer at Company X | Founder of Y")
   - location: City, State/Country
   - email: Email address
   - phone: Phone number
   - linkedin: LinkedIn profile URL (just the path, e.g., "linkedin.com/in/username")
   - github: GitHub profile URL (just the path, e.g., "github.com/username")
   - website: Personal website URL
   - summary: Professional summary or objective (2-3 sentences)

2. **skills**: Array of technical skills (programming languages, frameworks, tools, technologies)
   - Extract all mentioned skills
   - Keep them concise (e.g., "Machine Learning", "Python", "React")
   - Remove duplicates

3. **experiences**: Array of work experiences
   Each experience should have:
   - title: Job title
   - company: Company name
   - location: Work location
   - period: Time period (e.g., "2024 - Present", "Jan 2023 - Dec 2023")
   - description: Array of strings describing responsibilities and achievements

4. **education**: Array of educational qualifications
   Each education entry should have:
   - degree: Degree name (e.g., "Bachelor of Science in Computer Science")
   - school: Institution name
   - location: School location
   - year: Graduation year
   - gpa: GPA if mentioned (e.g., "3.8/4.0")
   - focus: Area of focus or specialization

5. **certifications**: Array of certifications
   Each certification should have:
   - name: Certification name
   - issuer: Issuing organization
   - year: Year obtained

6. **projects**: Array of projects
   Each project should have:
   - name: Project name
   - description: Brief description of the project
   - tech: Array of technologies used
   - impact: Impact or achievement (e.g., "Increased performance by 50%")

IMPORTANT:
- Output ONLY valid JSON, no additional text
- If information is not available, use empty string "" or empty array []
- Extract information as accurately as possible from the provided text
- Maintain consistent formatting
- For skills, extract all relevant technical skills mentioned throughout the resume

Return the JSON in this exact structure:
{
  "profile": { "name": "", "title": "", "location": "", "email": "", "phone": "", "linkedin": "", "github": "", "website": "", "summary": "" },
  "skills": [],
  "experiences": [{ "title": "", "company": "", "location": "", "period": "", "description": [] }],
  "education": [{ "degree": "", "school": "", "location": "", "year": "", "gpa": "", "focus": "" }],
  "certifications": [{ "name": "", "issuer": "", "year": "" }],
  "projects": [{ "name": "", "description": "", "tech": [], "impact": "" }]
}`;
  }

  /**
   * User prompt with the actual resume text
   */
  private getUserPrompt(): string {
    return `Please parse the following resume text and extract all information into the specified JSON format:\n\n${this.text}`;
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
