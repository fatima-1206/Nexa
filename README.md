# [Nexa – AI-Powered Interview Preparation Platform](https://nexa-interview-prep.vercel.app/)


> **Streamline Your Learning, Ace Your Interviews**

An intelligent interview preparation platform that combines job search, resume parsing, automated resource curation, and AI-powered coaching to help candidates prepare effectively for their dream jobs.

## What is Nexa?

Nexa is an end-to-end interview preparation platform that revolutionizes how candidates prepare for job interviews. By leveraging cutting-edge AI and automation, Nexa:

1. **Searches for Jobs** - Finds relevant job opportunities based on your resume
2. **Analyzes Job Requirements** - Extracts missing skills and requirements using AI
3. **Auto-Curates Learning Resources** - Automatically searches and scrapes relevant learning materials
4. **Builds RAG Knowledge Base** - Creates a personalized RAG (Retrieval-Augmented Generation) system from curated resources
5. **Provides AI Interview Coach** - Chat with an AI coach that has context about your target role and company

### Key Features

**Resume Parser** - AI-powered resume parsing with Groq LLM  
**Smart Job Search** - Intelligent job matching with SerpAPI  
**Automated Resource Discovery** - Uses Tavily AI to find the best learning materials  
**RAG-Powered Chat** - Context-aware interview coaching using embedded knowledge  
**Chat History** - Persistent chat sessions for each job preparation  
**Dashboard** - Real-time analytics and activity tracking  

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15.5.9 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui, kokonutui
- **State Management:** React Hooks 
- **Animations:** Framer Motion
- **Markdown Rendering:** react-markdown

### Backend & APIs
- **Runtime:** Node.js
- **Package Manager:** pnpm
- **Authentication:** Supabase Auth (Google OAuth, GitHub OAuth, Email OTP)
- **File Processing:** pdf-parse, mammoth

### AI & Machine Learning

| Service | Model/API | Purpose |
|---------|-----------|---------|
| **Groq** | Llama 3.3 70B Versatile | Resume parsing, skill extraction |
| **GitHub Models** | GPT-4o | Resource summarization, interview prep responses |
| **Hugging Face** | sentence-transformers/all-mpnet-base-v2 | Text embeddings for RAG |
| **Tavily AI** | Search API | Learning resource discovery |

### External Services
- **SerpAPI** - Job search and aggregation
- **Supabase** - Authentication & user management
- **Vercel** - Hosting and deployment

### Data Processing Pipeline

**RAG (Retrieval-Augmented Generation) Pipeline:**
1. **Web Scraping** - Fetches content from discovered resources
2. **Summarization** - GPT-4o generates interview-focused summaries
3. **Chunking** - Splits content into semantic chunks
4. **Embedding** - Converts chunks to vector embeddings
5. **Retrieval** - Cosine similarity search for relevant context
6. **Generation** - GPT-4o generates responses with retrieved context

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auto-prepare-interview/    # Automated prep workflow
│   │   ├── build-vector-db/           # RAG embeddings creation
│   │   ├── find-sources/              # Resource discovery
│   │   ├── get-response/              # Chat completions
│   │   ├── parse-resume/              # Resume parsing endpoint
│   │   ├── search-jobs/               # Job search API
│   │   └── save-selected-sources/     # Resource persistence
│   ├── command-center/                # Analytics dashboard
│   ├── dashboard/                     # Main dashboard layout
│   ├── interview-preperation/         # Chat interface
│   │   ├── ChatInterface.tsx          # Main chat UI
│   │   └── history.ts                 # Chat session management
│   ├── jobsFound/                     # Job listings
│   └── userProfile/                   # Resume upload & profile
│
├── backend/
│   ├── jobSearcher/                   # Job search & matching
│   │   ├── jobSearcher.ts            # Main job search logic
│   │   ├── matcher.ts                # AI-powered job matching
│   │   └── serpApiClient.ts          # SerpAPI integration
│   ├── prep/                          # Resource search
│   │   └── searchprepsources.ts      # Tavily API integration
│   ├── rag/
│   │   ├── chat/                      # Response generation
│   │   │   ├── responsegeneration.ts  # GPT-4o chat
│   │   │   └── retrieval.ts           # Vector search
│   │   └── ingestion/                 # RAG pipeline
│   │       ├── chunking.ts            # Text chunking
│   │       ├── embedding.ts           # HF embeddings
│   │       ├── summarization.ts       # Content summarization
│   │       └── webscraper.ts          # Web content extraction
│   └── resume-parser/                 # AI resume parser
│       ├── aiParser.ts               # Groq-powered parsing
│       ├── pdfExtractor.ts           # PDF text extraction
│       └── types.ts                  # Type definitions
│
├── components/                        # Reusable UI components
│   ├── ui/                           # shadcn/ui components
│   └── auth-page.tsx                 # Authentication UI
│
└── lib/                              # Utilities & helpers
    ├── supabase.ts                   # Supabase client
    └── utils.ts                      # Helper functions
```

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- API keys for required services

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/shilok09/v0-cyberpunk-dashboard-design.git
cd v0-cyberpunk-dashboard-design
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# AI Services
GITHUB_TOKEN=your_github_token_here
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_TOKEN=your_huggingface_token_here

# Search APIs
SERPAPI_KEY=your_serpapi_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# Authentication (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server**
```bash
pnpm dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## API Keys Setup Guide

### 1. GitHub Models API (GPT-4o)
- Visit [GitHub Settings → Tokens](https://github.com/settings/tokens)
- Generate a personal access token
- Add to `.env.local` as `GITHUB_TOKEN`

### 2. Groq API (Llama 3.3)
- Sign up at [console.groq.com](https://console.groq.com)
- Create API key in dashboard
- Add to `.env.local` as `GROQ_API_KEY`

### 3. Hugging Face (Embeddings)
- Create account at [huggingface.co](https://huggingface.co)
- Generate token at [Settings → Access Tokens](https://huggingface.co/settings/tokens)
- Add to `.env.local` as `HUGGINGFACE_API_TOKEN`

### 4. SerpAPI (Job Search)
- Sign up at [serpapi.com](https://serpapi.com)
- Get API key from dashboard
- Add to `.env.local` as `SERPAPI_KEY`

### 5. Tavily AI (Resource Search)
- Sign up at [tavily.com](https://tavily.com)
- Get API key from dashboard
- Add to `.env.local` as `TAVILY_API_KEY`

### 6. Supabase (Authentication)
- Create project at [supabase.com](https://supabase.com)
- Enable Google and GitHub OAuth providers
- Copy project URL and anon key
- Add to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## How It Works

### Workflow Overview

```
1. User uploads resume
   ↓
2. AI parses resume (Groq Llama 3.3)
   ↓
3. User searches for jobs
   ↓
4. SerpAPI finds matching jobs
   ↓
5. AI scores job relevance
   ↓
6. User clicks "Start Preparing"
   ↓
7. AUTOMATED FLOW BEGINS:
   ├─ Extract missing skills (GPT-4o)
   ├─ Search for resources (Tavily)
   ├─ Scrape web content
   ├─ Summarize with AI (GPT-4o)
   ├─ Chunk text semantically
   ├─ Generate embeddings (HuggingFace)
   └─ Build vector database
   ↓
8. Chat interface launches with RAG
   ↓
9. User chats with AI coach
   ├─ Retrieves relevant chunks
   ├─ Generates contextual responses (GPT-4o)
   └─ Saves chat history
```

### RAG Architecture

```
Query → Embedding → Vector Search → Top-K Chunks → Context + Query → GPT-4o → Response
```

---

## Design Philosophy

**Cyberpunk Aesthetic**
- Dark theme with orange (#f97316) accents
- Monospace fonts for technical data
- Animated status indicators
- Real-time activity logs

**User Experience**
- Fully automated workflow (no manual steps)
- Real-time progress feedback
- chat history for Context
- Persistent sessions per job

---

## Build & Deploy

### Local Build
```bash
pnpm install
pnpm build
```

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

Or use CLI:
```bash
vercel --prod
```

### Environment Variables for Production
Ensure all API keys from `.env.local` are added to your Vercel project settings.

---

## Development Notes

### Project Commands
```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Key Technologies
- **App Router** - Next.js 15 with server/client components
- **API Routes** - RESTful endpoints with TypeScript
- **Real-time Updates** - useState + useEffect hooks
- **File Storage** - Server-side storage for RAG artifacts

---

## Team

[**Shilok Kumar**](https://www.shilok.dev/) - Developer  
**Fatima** - Developer  
**Ramalah Amir** - Developer

---

**Built with Love For The World**
