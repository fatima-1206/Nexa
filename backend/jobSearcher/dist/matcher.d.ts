import { SerpApiJobResult, MatchedJob, SkillMatchConfig } from './types';
/**
 * Skill matching and job ranking engine
 */
export declare class JobMatcher {
    private config;
    private skillSynonyms;
    constructor(config?: SkillMatchConfig);
    /**
     * Match jobs with user skills and rank them
     */
    matchJobs(jobs: SerpApiJobResult[], userSkills: string[]): MatchedJob[];
    /**
     * Calculate match score for a single job
     */
    private calculateMatch;
    /**
     * Check if skill exists in text (considering synonyms)
     */
    private isSkillInText;
    /**
     * Get all searchable text from job
     */
    private getJobSearchText;
    /**
     * Generate human-readable relevance reason
     */
    private generateRelevanceReason;
    /**
     * Build synonym map for skill matching
     */
    private buildSynonymMap;
    /**
     * Default skill synonyms
     */
    private getDefaultSynonyms;
}
//# sourceMappingURL=matcher.d.ts.map