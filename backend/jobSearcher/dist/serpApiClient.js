"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * SerpAPI Client for Google Jobs search
 */
class SerpApiClient {
    constructor(apiKey) {
        this.baseUrl = 'https://serpapi.com/search';
        this.apiKey = apiKey || process.env.SERPAPI_KEY || '';
        if (!this.apiKey) {
            throw new Error('SERPAPI_KEY is required. Set it in environment variables or pass it to the constructor.');
        }
    }
    /**
     * Search Google Jobs using SerpAPI
     * @param query - Job search query (e.g., "Machine Learning Engineer")
     * @param location - Job location (e.g., "Austin, Texas, United States")
     * @param options - Additional search options
     */
    async searchJobs(query, location = 'United States', options = {}) {
        try {
            const params = {
                engine: 'google_jobs',
                q: query,
                location: location,
                google_domain: options.googleDomain || 'google.com',
                hl: options.hl || 'en',
                gl: options.gl || 'us',
                api_key: this.apiKey,
                ...(options.numResults && { num: options.numResults })
            };
            const response = await axios_1.default.get(this.baseUrl, {
                params,
                timeout: 30000 // 30 second timeout
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`SerpAPI request failed: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Search jobs for multiple skill queries
     * @param skills - Array of skills to search for
     * @param location - Job location
     * @param maxQueriesPerSkill - Maximum number of query variations per skill
     */
    async searchJobsBySkills(skills, location = 'United States', maxQueriesPerSkill = 2) {
        const queries = this.generateSearchQueries(skills, maxQueriesPerSkill);
        const results = [];
        // Search with rate limiting to avoid API limits
        for (const query of queries) {
            try {
                const result = await this.searchJobs(query, location);
                results.push(result);
                // Add small delay between requests
                await this.delay(500);
            }
            catch (error) {
                console.error(`Failed to search for query: ${query}`, error);
                // Continue with other queries even if one fails
            }
        }
        return results;
    }
    /**
     * Generate search queries from skills
     * Combines skills into relevant job titles and descriptions
     */
    generateSearchQueries(skills, maxQueries = 2) {
        const queries = [];
        // Categorize skills
        const aiSkills = ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Natural Language Processing', 'Neural Networks'];
        const programmingLanguages = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++'];
        const frameworks = ['TensorFlow', 'PyTorch', 'React', 'Node.js', 'FastAPI', 'Django'];
        const cloudDevOps = ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'];
        const dataSkills = ['SQL', 'MongoDB', 'Pandas', 'NumPy', 'Scikit-learn'];
        // Check what categories the user has skills in
        const hasAI = skills.some(s => aiSkills.some(ai => s.toLowerCase().includes(ai.toLowerCase())));
        const hasPython = skills.some(s => s.toLowerCase().includes('python'));
        const hasWebDev = skills.some(s => frameworks.some(f => ['react', 'node', 'django'].includes(f.toLowerCase()) && s.toLowerCase().includes(f.toLowerCase())));
        const hasCloud = skills.some(s => cloudDevOps.some(c => s.toLowerCase().includes(c.toLowerCase())));
        const hasData = skills.some(s => dataSkills.some(d => s.toLowerCase().includes(d.toLowerCase())));
        // Generate targeted queries based on skill combinations
        if (hasAI && hasPython) {
            queries.push('Machine Learning Engineer');
            queries.push('AI Engineer Python');
            queries.push('Data Scientist Machine Learning');
        }
        if (hasAI && hasCloud) {
            queries.push('ML Engineer AWS');
            queries.push('MLOps Engineer');
        }
        if (hasWebDev && hasPython) {
            queries.push('Full Stack Developer Python React');
            queries.push('Backend Developer Python');
        }
        if (hasData && hasPython) {
            queries.push('Data Analyst Python');
            queries.push('Data Engineer');
        }
        if (hasCloud) {
            queries.push('DevOps Engineer');
            queries.push('Cloud Engineer AWS');
        }
        // Add top skills as direct queries
        const topSkills = skills.slice(0, 3);
        topSkills.forEach(skill => {
            queries.push(`${skill} Engineer`);
        });
        // Limit to maxQueries
        return [...new Set(queries)].slice(0, maxQueries * 3);
    }
    /**
     * Helper function to add delay between requests
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.SerpApiClient = SerpApiClient;
//# sourceMappingURL=serpApiClient.js.map