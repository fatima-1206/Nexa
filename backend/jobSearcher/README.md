# Job Searcher - AI-Powered Job Matching System

A TypeScript-based job search engine that uses SerpAPI to search Google Jobs and intelligently matches jobs with user skills.

## 🚀 Features

- **Smart Job Search**: Uses SerpAPI to search Google Jobs with intelligent query generation
- **Skill Matching**: Advanced algorithm to match jobs with user skills
- **Synonym Recognition**: Understands skill synonyms (e.g., "ML" = "Machine Learning")
- **Ranking System**: Ranks jobs by match score and percentage
- **Deduplication**: Removes duplicate job listings
- **Detailed Results**: Provides match reasons and matched skills for each job

## 📦 Installation

```bash
cd backend/jobSearcher
npm install
```

## 🔑 Setup

1. Get your SerpAPI key from: https://serpapi.com/
2. Create a `.env` file:

```bash
cp .env.example .env
```

3. Add your API key to `.env`:

```env
SERPAPI_KEY=your_api_key_here
```

## 🎯 Usage

### As a Library

```typescript
import { searchJobsBySkills } from './src/index';

const skills = [
  "Machine Learning",
  "Python",
  "TensorFlow",
  "AWS",
  "Docker"
];

const results = await searchJobsBySkills(
  skills,
  "Austin, Texas, United States",
  undefined, // Uses env SERPAPI_KEY
  {
    maxResults: 10,
    matchConfig: {
      minMatchScore: 3,
      minMatchPercentage: 20,
      prioritySkills: ['Machine Learning', 'Python']
    }
  }
);

console.log(results);
```

### Running Tests

```bash
# Build the project
npm run build

# Run test
npm run test
```

## 📊 Input Format

The job searcher accepts a skills array from user profiles:

```typescript
const skills = [
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Neural Networks",
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "TensorFlow",
  "PyTorch",
  "React",
  "Node.js",
  "FastAPI",
  "Django",
  "AWS",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Terraform",
  "Git",
  "SQL",
  "MongoDB",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "Jupyter"
];
```

## 📤 Output Format

```typescript
{
  query: "Machine Learning, Python, TensorFlow and 25 more skills",
  location: "Austin, Texas, United States",
  totalJobsFound: 47,
  matchedJobs: [
    {
      title: "Machine Learning Engineer",
      company_name: "Tech Company",
      location: "Austin, TX",
      description: "...",
      matchScore: 15,
      matchedSkills: ["Machine Learning", "Python", "TensorFlow", ...],
      matchPercentage: 54,
      relevanceReason: "Perfect match: 15 matching skills including machine learning, python, tensorflow"
    },
    // ... more jobs
  ],
  searchMetadata: {
    searchedAt: "2026-01-21T10:30:00.000Z",
    processingTime: 5432,
    skillsSearched: [...]
  }
}
```

## 🎛️ Configuration Options

### Job Search Parameters

```typescript
interface JobSearchParams {
  skills: string[];              // Required: User skills
  location?: string;             // Default: "United States"
  maxResults?: number;           // Default: 50
}
```

### Skill Match Configuration

```typescript
interface SkillMatchConfig {
  minMatchScore?: number;        // Minimum matching skills (default: 1)
  minMatchPercentage?: number;   // Minimum match % (default: 10)
  prioritySkills?: string[];     // Skills worth 2x points
  synonyms?: Record<string, string[]>; // Custom synonyms
}
```

## 🔧 Architecture

```
jobSearcher/
├── src/
│   ├── index.ts           # Main entry point
│   ├── jobSearcher.ts     # Orchestrator class
│   ├── serpApiClient.ts   # SerpAPI integration
│   ├── matcher.ts         # Skill matching algorithm
│   ├── types.ts           # TypeScript definitions
│   └── test.ts            # Test suite
├── package.json
├── tsconfig.json
└── README.md
```

## 🧠 Matching Algorithm

1. **Query Generation**: Analyzes skills and generates targeted job queries
2. **Search Execution**: Searches Google Jobs via SerpAPI
3. **Deduplication**: Removes duplicate listings
4. **Skill Matching**: 
   - Direct text matching in title, description, company
   - Synonym recognition (ML = Machine Learning)
   - Priority skill weighting
5. **Ranking**: Sorts by match score and percentage
6. **Filtering**: Applies minimum thresholds

## 📈 Example Output

```
═══════════════════════════════════════════════════════
🎯 JOB SEARCH RESULTS
═══════════════════════════════════════════════════════

📍 Location: Austin, Texas, United States
🔍 Query: Machine Learning, Deep Learning, Natural Language Processing and 25 more skills
📊 Found: 47 jobs | Matched: 23 jobs
⏱️  Processing Time: 5432ms

1. Machine Learning Engineer
   🏢 Tech Innovations Inc
   📍 Austin, TX
   🎯 Match: 54% (15 skills)
   💡 Perfect match: 15 matching skills including machine learning, python, tensorflow
   🔧 Matched Skills: Machine Learning, Python, TensorFlow, PyTorch, AWS, Docker, Kubernetes, SQL, NumPy, Pandas
   📅 Posted: 2 days ago
   💰 $120K–$180K a year
   📝 We are seeking an experienced Machine Learning Engineer to join our AI team...
   ───────────────────────────────────────────────────
```

## 🔗 Integration with Next.js App

To integrate with your Next.js app, create an API route:

```typescript
// app/api/search-jobs/route.ts
import { searchJobsBySkills } from '../../../backend/jobSearcher/src/index';

export async function POST(request: Request) {
  const { skills, location } = await request.json();
  
  const results = await searchJobsBySkills(
    skills,
    location || "United States"
  );
  
  return Response.json(results);
}
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.
