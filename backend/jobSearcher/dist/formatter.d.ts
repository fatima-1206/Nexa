import { MatchedJob, CleanJobResult } from './types';
/**
 * Formatter to convert matched jobs to clean JSON format
 */
export declare class JobFormatter {
    /**
     * Convert matched jobs to clean JSON format with required fields
     */
    static formatJobsToCleanJSON(matchedJobs: MatchedJob[]): CleanJobResult[];
    /**
     * Format a single job to clean JSON format
     */
    static formatSingleJob(job: MatchedJob): CleanJobResult;
    /**
     * Parse location into city and country
     * Examples:
     * - "Austin, TX" -> city: "Austin", country: "United States"
     * - "Austin, Texas, United States" -> city: "Austin", country: "United States"
     * - "Remote" -> city: "Remote", country: "N/A"
     */
    private static parseLocation;
    /**
     * Extract job application URL from job data
     */
    private static extractJobURL;
    /**
     * Extract date posted from job data
     */
    private static extractDatePosted;
    /**
     * Format clean results as pretty JSON string
     */
    static toJSONString(cleanResults: CleanJobResult[], pretty?: boolean): string;
}
//# sourceMappingURL=formatter.d.ts.map