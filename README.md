# Resume Parser (AI-Powered)

A TypeScript-based resume parser that uses GPT-4o via GitHub's inference API to extract structured data from PDF and text resumes.

## Features

- 📄 Extract text from PDF files
- 🤖 AI-powered parsing using GPT-4o via GitHub Models
- 🔍 Intelligent extraction of resume sections
- 📊 Structured JSON output matching UI data format
- 🚀 TypeScript with full type safety
- ⚡ Accurate parsing with natural language understanding

## Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install

npm install @tavily/core
npm install groq-sdk
npm install lucide-react
```

### 2. Configure GitHub Token

Create a `.env` file in the root directory:

```bash
GITHUB_TOKEN=your_github_token_here
```

To get a GitHub token:

1. Go to <https://github.com/settings/tokens>
2. Generate a new personal access token
3. Copy the token to your `.env` file

## Usage

### Command Line Test

Test the parser with the included resume:

```bash
npm run test
```

### Programmatic Usage

```typescript
import { parseResumeFromFile, parseResumeFromText } from './src/index';

// Parse from PDF file (async - uses AI)
const result = await parseResumeFromFile('./path/to/resume.pdf');

// Parse from text string (async - uses AI)
const result2 = await parseResumeFromText('resume text content...');

console.log(result.profile);
console.log(result.skills);
console.log(result.experiences);
```

## How It Works

1. **Text Extraction**: Extracts raw text from PDF using `pdf-parse`
2. **AI Processing**: Sends text to GPT-4o via GitHub's inference API
3. **Structured Output**: AI model returns structured JSON matching the defined schema
4. **Validation**: Output is validated and cleaned before returning

## Environment Variables

- `GITHUB_TOKEN` - Required. Your GitHub personal access token for API access

## Output Format

The parser outputs data in the following structure:

```typescript
{
  profile: {
    name: string,
    title: string,
    location: string,
    email: string,
    phone: string,
    linkedin: string,
    github: string,
    website: string,
    summary: string
  },
  skills: string[],
  experiences: [{
    title: string,
    company: string,
    location: string,
    period: string,
    description: string[]
  }],
  education: [{
    degree: string,
    school: string,
    location: string,
    year: string,
    gpa: string,
    focus: string
  }],
  certifications: [{
    name: string,
    issuer: string,
    year: string
  }],
  projects: [{
    name: string,
    description: string,
    tech: string[],
    impact: string
  }]
}
```

## Build

```bash
npm run build
```

## Scripts

- `npm run dev` - Run parser in development mode
- `npm run build` - Compile TypeScript to JavaScript
- `npm run test` - Test parser with sample resume
- `npm start` - Run compiled version

## File Structure

```
backend/resume-parser/
├── src/
│   ├── index.ts          # Main entry point
│ Requires a valid GitHub token with access to GitHub Models
- The AI model (GPT-4o) provides much more accurate parsing than regex patterns
- Processing time depends on API response time (typically 2-5 seconds)
- The parser is designed to handle various resume formats and layouts
- Output is saved to `parsed-resume.json` when running tests

## API Details

- **Endpoint**: `https://models.github.ai/inference`
- **Model**: `openai/gpt-4o`
- **Response Format**: JSON object with structured resume data
- **Temperature**: 0.3 (for consistent, deterministic outputs)
- **Max Tokens**: 4000 (sufficient for detailed resumes)
├── package.json
├── tsconfig.json
└── README.md
```

## Notes

- The parser uses pattern matching and may not be 100% accurate for all resume formats
- For best results, ensure resumes follow standard formatting conventions
- The parser automatically detects common skills and technologies
- Output is saved to `parsed-resume.json` when running tests
