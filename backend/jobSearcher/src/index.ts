import { JobSearcher } from './jobSearcher';
import { JobFormatter } from './formatter';
import { JobSearchParams, JobSearchResult, SkillMatchConfig, CleanJobResult } from './types';

/**
 * Main entry point for Job Searcher
 */

/**
 * Search for jobs matching user skills
 * @param skills - Array of user skills
 * @param location - Job location (default: "United States")
 * @param serpApiKey - SerpAPI key (optional, will use env var if not provided)
 * @param options - Additional search and matching options
 */
export async function searchJobsBySkills(
  skills: string[],
  location: string = 'United States',
  serpApiKey?: string,
  options?: {
    maxResults?: number;
    matchConfig?: SkillMatchConfig;
  }
): Promise<JobSearchResult> {
  const searcher = new JobSearcher(serpApiKey, options?.matchConfig);
  
  const params: JobSearchParams = {
    skills,
    location,
    maxResults: options?.maxResults || 50
  };

  return await searcher.searchJobs(params);
}

/**
 * Format job search results as string
 */
export function formatJobResults(results: JobSearchResult): string {
  const searcher = new JobSearcher();
  return searcher.formatResults(results);
}

/**
 * Get clean JSON results from job search
 */
export function getCleanJobResults(results: JobSearchResult): CleanJobResult[] {
  return results.cleanResults;
}

/**
 * Get clean JSON string from job search
 */
export function getCleanJobResultsJSON(results: JobSearchResult, pretty: boolean = true): string {
  return JobFormatter.toJSONString(results.cleanResults, pretty);
}

// Export all types and classes
export * from './types';
export { JobSearcher } from './jobSearcher';
export { SerpApiClient } from './serpApiClient';
export { JobMatcher } from './matcher';
export { JobFormatter } from './formatter';
