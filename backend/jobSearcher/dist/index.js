"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobFormatter = exports.JobMatcher = exports.SerpApiClient = exports.JobSearcher = void 0;
exports.searchJobsBySkills = searchJobsBySkills;
exports.formatJobResults = formatJobResults;
exports.getCleanJobResults = getCleanJobResults;
exports.getCleanJobResultsJSON = getCleanJobResultsJSON;
const jobSearcher_1 = require("./jobSearcher");
const formatter_1 = require("./formatter");
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
async function searchJobsBySkills(skills, location = 'United States', serpApiKey, options) {
    const searcher = new jobSearcher_1.JobSearcher(serpApiKey, options?.matchConfig);
    const params = {
        skills,
        location,
        maxResults: options?.maxResults || 50
    };
    return await searcher.searchJobs(params);
}
/**
 * Format job search results as string
 */
function formatJobResults(results) {
    const searcher = new jobSearcher_1.JobSearcher();
    return searcher.formatResults(results);
}
/**
 * Get clean JSON results from job search
 */
function getCleanJobResults(results) {
    return results.cleanResults;
}
/**
 * Get clean JSON string from job search
 */
function getCleanJobResultsJSON(results, pretty = true) {
    return formatter_1.JobFormatter.toJSONString(results.cleanResults, pretty);
}
// Export all types and classes
__exportStar(require("./types"), exports);
var jobSearcher_2 = require("./jobSearcher");
Object.defineProperty(exports, "JobSearcher", { enumerable: true, get: function () { return jobSearcher_2.JobSearcher; } });
var serpApiClient_1 = require("./serpApiClient");
Object.defineProperty(exports, "SerpApiClient", { enumerable: true, get: function () { return serpApiClient_1.SerpApiClient; } });
var matcher_1 = require("./matcher");
Object.defineProperty(exports, "JobMatcher", { enumerable: true, get: function () { return matcher_1.JobMatcher; } });
var formatter_2 = require("./formatter");
Object.defineProperty(exports, "JobFormatter", { enumerable: true, get: function () { return formatter_2.JobFormatter; } });
//# sourceMappingURL=index.js.map