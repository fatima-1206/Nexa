"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSearcher = void 0;
const serpApiClient_1 = require("./serpApiClient");
const matcher_1 = require("./matcher");
const formatter_1 = require("./formatter");
/**
 * Main Job Searcher class that orchestrates job search and matching
 */
class JobSearcher {
    constructor(serpApiKey, matchConfig) {
        this.serpClient = new serpApiClient_1.SerpApiClient(serpApiKey);
        this.matcher = new matcher_1.JobMatcher(matchConfig);
    }
    /**
     * Search for jobs matching user skills
     * @param params - Search parameters including skills and location
     * @returns JobSearchResult with matched and ranked jobs
     */
    async searchJobs(params) {
        const startTime = Date.now();
        // Validate input
        if (!params.skills || params.skills.length === 0) {
            throw new Error('At least one skill is required for job search');
        }
        const location = params.location || 'United States';
        const maxResults = params.maxResults || 50;
        try {
            console.log(`🔍 Searching jobs for ${params.skills.length} skills in ${location}...`);
            // Search jobs using SerpAPI based on user skills
            const searchResponses = await this.serpClient.searchJobsBySkills(params.skills, location, 2 // Max queries per skill category
            );
            // Aggregate all jobs from multiple searches
            const allJobs = [];
            let totalJobsFound = 0;
            for (const response of searchResponses) {
                if (response.jobs_results) {
                    totalJobsFound += response.jobs_results.length;
                    allJobs.push(...response.jobs_results);
                }
            }
            // Remove duplicates based on job_id or title+company combination
            const uniqueJobs = this.deduplicateJobs(allJobs);
            console.log(`📊 Found ${totalJobsFound} jobs, ${uniqueJobs.length} unique`);
            // Match and rank jobs based on user skills
            const matchedJobs = this.matcher.matchJobs(uniqueJobs, params.skills);
            console.log(`✅ ${matchedJobs.length} jobs matched user skills`);
            // Limit to maxResults
            const limitedJobs = matchedJobs.slice(0, maxResults);
            // Format to clean JSON structure
            const cleanResults = formatter_1.JobFormatter.formatJobsToCleanJSON(limitedJobs);
            const processingTime = Date.now() - startTime;
            return {
                query: this.generateQueryDescription(params.skills),
                location: location,
                totalJobsFound: uniqueJobs.length,
                matchedJobs: limitedJobs,
                cleanResults: cleanResults,
                searchMetadata: {
                    searchedAt: new Date().toISOString(),
                    processingTime: processingTime,
                    skillsSearched: params.skills
                }
            };
        }
        catch (error) {
            console.error('Job search failed:', error);
            throw new Error(`Failed to search jobs: ${error}`);
        }
    }
    /**
     * Generate a human-readable query description
     */
    generateQueryDescription(skills) {
        if (skills.length <= 3) {
            return skills.join(', ');
        }
        return `${skills.slice(0, 3).join(', ')} and ${skills.length - 3} more skills`;
    }
    /**
     * Remove duplicate jobs
     */
    deduplicateJobs(jobs) {
        const seen = new Set();
        const unique = [];
        for (const job of jobs) {
            // Create unique key from job_id or title+company
            const key = job.job_id ||
                `${job.title}-${job.company_name}-${job.location}`.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(job);
            }
        }
        return unique;
    }
    /**
     * Format job results for display
     */
    formatResults(results) {
        let output = '\n';
        output += '═══════════════════════════════════════════════════════\n';
        output += `🎯 JOB SEARCH RESULTS\n`;
        output += '═══════════════════════════════════════════════════════\n\n';
        output += `📍 Location: ${results.location}\n`;
        output += `🔍 Query: ${results.query}\n`;
        output += `📊 Found: ${results.totalJobsFound} jobs | Matched: ${results.matchedJobs.length} jobs\n`;
        output += `⏱️  Processing Time: ${results.searchMetadata.processingTime}ms\n`;
        output += '\n';
        if (results.matchedJobs.length === 0) {
            output += '❌ No jobs matched your skills. Try broadening your search criteria.\n';
            return output;
        }
        results.matchedJobs.forEach((job, index) => {
            output += `\n${index + 1}. ${job.title}\n`;
            output += `   🏢 ${job.company_name}\n`;
            output += `   📍 ${job.location}\n`;
            output += `   🎯 Match: ${job.matchPercentage}% (${job.matchScore} skills)\n`;
            output += `   💡 ${job.relevanceReason}\n`;
            output += `   🔧 Matched Skills: ${job.matchedSkills.join(', ')}\n`;
            if (job.detected_extensions?.posted_at) {
                output += `   📅 Posted: ${job.detected_extensions.posted_at}\n`;
            }
            if (job.detected_extensions?.salary) {
                output += `   💰 ${job.detected_extensions.salary}\n`;
            }
            if (job.description) {
                const shortDesc = job.description.slice(0, 150) + '...';
                output += `   📝 ${shortDesc}\n`;
            }
            output += '   ───────────────────────────────────────────────────\n';
        });
        return output;
    }
}
exports.JobSearcher = JobSearcher;
//# sourceMappingURL=jobSearcher.js.map