import { JobSearchResult, SkillMatchConfig, CleanJobResult } from './types';
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
export declare function searchJobsBySkills(skills: string[], location?: string, serpApiKey?: string, options?: {
    maxResults?: number;
    matchConfig?: SkillMatchConfig;
}): Promise<JobSearchResult>;
/**
 * Format job search results as string
 */
export declare function formatJobResults(results: JobSearchResult): string;
/**
 * Get clean JSON results from job search
 */
export declare function getCleanJobResults(results: JobSearchResult): CleanJobResult[];
/**
 * Get clean JSON string from job search
 */
export declare function getCleanJobResultsJSON(results: JobSearchResult, pretty?: boolean): string;
export * from './types';
export { JobSearcher } from './jobSearcher';
export { SerpApiClient } from './serpApiClient';
export { JobMatcher } from './matcher';
export { JobFormatter } from './formatter';
//# sourceMappingURL=index.d.ts.map