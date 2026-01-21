import { SerpApiResponse } from './types';
/**
 * SerpAPI Client for Google Jobs search
 */
export declare class SerpApiClient {
    private apiKey;
    private baseUrl;
    constructor(apiKey?: string);
    /**
     * Search Google Jobs using SerpAPI
     * @param query - Job search query (e.g., "Machine Learning Engineer")
     * @param location - Job location (e.g., "Austin, Texas, United States")
     * @param options - Additional search options
     */
    searchJobs(query: string, location?: string, options?: {
        googleDomain?: string;
        hl?: string;
        gl?: string;
        numResults?: number;
    }): Promise<SerpApiResponse>;
    /**
     * Search jobs for multiple skill queries
     * @param skills - Array of skills to search for
     * @param location - Job location
     * @param maxQueriesPerSkill - Maximum number of query variations per skill
     */
    searchJobsBySkills(skills: string[], location?: string, maxQueriesPerSkill?: number): Promise<SerpApiResponse[]>;
    /**
     * Generate search queries from skills
     * Combines skills into relevant job titles and descriptions
     */
    private generateSearchQueries;
    /**
     * Helper function to add delay between requests
     */
    private delay;
}
//# sourceMappingURL=serpApiClient.d.ts.map