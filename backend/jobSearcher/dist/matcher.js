"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobMatcher = void 0;
/**
 * Skill matching and job ranking engine
 */
class JobMatcher {
    constructor(config = {}) {
        this.config = {
            minMatchScore: config.minMatchScore || 1,
            minMatchPercentage: config.minMatchPercentage || 10,
            prioritySkills: config.prioritySkills || [],
            synonyms: config.synonyms || this.getDefaultSynonyms()
        };
        this.skillSynonyms = this.buildSynonymMap(this.config.synonyms);
    }
    /**
     * Match jobs with user skills and rank them
     */
    matchJobs(jobs, userSkills) {
        const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
        const matchedJobs = [];
        for (const job of jobs) {
            const match = this.calculateMatch(job, normalizedUserSkills);
            if (match.matchScore >= this.config.minMatchScore &&
                match.matchPercentage >= this.config.minMatchPercentage) {
                matchedJobs.push({
                    ...job,
                    ...match
                });
            }
        }
        // Sort by match score (descending) then by match percentage
        return matchedJobs.sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return b.matchPercentage - a.matchPercentage;
        });
    }
    /**
     * Calculate match score for a single job
     */
    calculateMatch(job, userSkills) {
        const jobText = this.getJobSearchText(job).toLowerCase();
        const matchedSkills = new Set();
        let matchScore = 0;
        // Check each user skill against the job
        for (const skill of userSkills) {
            if (this.isSkillInText(skill, jobText)) {
                matchedSkills.add(skill);
                // Priority skills get higher score
                const isPriority = this.config.prioritySkills.some(ps => ps.toLowerCase() === skill.toLowerCase());
                matchScore += isPriority ? 2 : 1;
            }
        }
        const matchPercentage = (matchedSkills.size / userSkills.length) * 100;
        const relevanceReason = this.generateRelevanceReason(Array.from(matchedSkills), job.title);
        return {
            matchScore,
            matchedSkills: Array.from(matchedSkills),
            matchPercentage: Math.round(matchPercentage),
            relevanceReason
        };
    }
    /**
     * Check if skill exists in text (considering synonyms)
     */
    isSkillInText(skill, text) {
        const skillLower = skill.toLowerCase();
        // Direct match
        if (text.includes(skillLower)) {
            return true;
        }
        // Check synonyms
        const synonyms = this.skillSynonyms.get(skillLower);
        if (synonyms) {
            for (const synonym of synonyms) {
                if (text.includes(synonym.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Get all searchable text from job
     */
    getJobSearchText(job) {
        const parts = [
            job.title || '',
            job.description || '',
            job.company_name || '',
            ...(job.extensions || [])
        ];
        return parts.join(' ').toLowerCase();
    }
    /**
     * Generate human-readable relevance reason
     */
    generateRelevanceReason(matchedSkills, jobTitle) {
        if (matchedSkills.length === 0) {
            return 'No direct skill matches found';
        }
        const topSkills = matchedSkills.slice(0, 3);
        if (matchedSkills.length === 1) {
            return `Matches your ${topSkills[0]} expertise`;
        }
        else if (matchedSkills.length === 2) {
            return `Strong match: ${topSkills[0]} and ${topSkills[1]}`;
        }
        else if (matchedSkills.length <= 5) {
            return `Excellent match: ${topSkills.join(', ')} and ${matchedSkills.length - 3} more skills`;
        }
        else {
            return `Perfect match: ${matchedSkills.length} matching skills including ${topSkills.join(', ')}`;
        }
    }
    /**
     * Build synonym map for skill matching
     */
    buildSynonymMap(synonyms) {
        const map = new Map();
        for (const [skill, syns] of Object.entries(synonyms)) {
            const skillLower = skill.toLowerCase();
            const synSet = new Set(syns.map(s => s.toLowerCase()));
            map.set(skillLower, synSet);
            // Add reverse mappings (synonyms point back to main skill)
            for (const syn of syns) {
                const synLower = syn.toLowerCase();
                if (!map.has(synLower)) {
                    map.set(synLower, new Set());
                }
                map.get(synLower).add(skillLower);
            }
        }
        return map;
    }
    /**
     * Default skill synonyms
     */
    getDefaultSynonyms() {
        return {
            'machine learning': ['ml', 'machine-learning', 'statistical learning'],
            'deep learning': ['dl', 'deep neural networks', 'dnn'],
            'natural language processing': ['nlp', 'text processing', 'language models'],
            'computer vision': ['cv', 'image processing', 'visual recognition'],
            'python': ['py', 'python3', 'python programming'],
            'javascript': ['js', 'javascript programming', 'ecmascript'],
            'typescript': ['ts', 'typescript programming'],
            'react': ['reactjs', 'react.js', 'react framework'],
            'node.js': ['nodejs', 'node', 'node js'],
            'aws': ['amazon web services', 'amazon aws'],
            'docker': ['containerization', 'containers'],
            'kubernetes': ['k8s', 'k8', 'container orchestration'],
            'tensorflow': ['tf', 'tensor flow'],
            'pytorch': ['torch', 'py torch'],
            'sql': ['structured query language', 'database queries'],
            'mongodb': ['mongo', 'mongo db', 'nosql'],
            'ci/cd': ['continuous integration', 'continuous deployment', 'cicd'],
            'fastapi': ['fast api', 'fastapi framework'],
            'django': ['django framework', 'django python'],
            'pandas': ['pandas library', 'data manipulation'],
            'numpy': ['numerical python', 'num py'],
            'scikit-learn': ['sklearn', 'scikit learn', 'sk-learn']
        };
    }
}
exports.JobMatcher = JobMatcher;
//# sourceMappingURL=matcher.js.map