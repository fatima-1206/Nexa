/**
 * Type definitions for Job Searcher
 */

export interface JobSearchParams {
  skills: string[];
  location?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'all';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'all';
  maxResults?: number;
}

export interface SerpApiJobResult {
  title: string;
  company_name: string;
  location: string;
  via: string;
  description: string;
  job_id?: string;
  thumbnail?: string;
  extensions?: string[];
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
    salary?: string;
    work_from_home?: boolean;
  };
  apply_options?: Array<{
    title: string;
    link: string;
  }>;
  related_links?: Array<{
    text: string;
    link: string;
  }>;
}

export interface SerpApiResponse {
  search_metadata: {
    id: string;
    status: string;
    created_at: string;
    processed_at: string;
    google_jobs_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    location?: string;
    google_domain: string;
    hl: string;
    gl: string;
  };
  search_information?: {
    query_displayed: string;
    total_results?: number;
  };
  jobs_results?: SerpApiJobResult[];
  chips?: Array<{
    type: string;
    param: string;
    options: Array<{
      text: string;
      value: string;
    }>;
  }>;
}

export interface MatchedJob extends SerpApiJobResult {
  matchScore: number;
  matchedSkills: string[];
  matchPercentage: number;
  relevanceReason: string;
}

export interface CleanJobResult {
  title: string;
  company: string;
  city: string;
  country: string;
  jobDescription: string;
  datePosted: string;
  url: string;
  matchScore: number;
  matchedSkills: string[];
  matchPercentage: number;
  relevanceReason: string;
  salary?: string;
  jobType?: string;
  workFromHome?: boolean;
}

export interface JobSearchResult {
  query: string;
  location: string;
  totalJobsFound: number;
  matchedJobs: MatchedJob[];
  cleanResults: CleanJobResult[];
  searchMetadata: {
    searchedAt: string;
    processingTime: number;
    skillsSearched: string[];
  };
}

export interface SkillMatchConfig {
  minMatchScore?: number;
  minMatchPercentage?: number;
  prioritySkills?: string[];
  synonyms?: Record<string, string[]>;
}
