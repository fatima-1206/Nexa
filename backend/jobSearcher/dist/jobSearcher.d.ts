import { JobSearchParams, JobSearchResult, SkillMatchConfig } from './types';
/**
 * Main Job Searcher class that orchestrates job search and matching
 */
export declare class JobSearcher {
    private serpClient;
    private matcher;
    constructor(serpApiKey?: string, matchConfig?: SkillMatchConfig);
    /**
     * Search for jobs matching user skills
     * @param params - Search parameters including skills and location
     * @returns JobSearchResult with matched and ranked jobs
     */
    searchJobs(params: JobSearchParams): Promise<JobSearchResult>;
    /**
     * Generate a human-readable query description
     */
    private generateQueryDescription;
    /**
     * Remove duplicate jobs
     */
    private deduplicateJobs;
    /**
     * Format job results for display
     */
    formatResults(results: JobSearchResult): string;
}
//# sourceMappingURL=jobSearcher.d.ts.map