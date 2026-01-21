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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.testJobSearcher = testJobSearcher;
const dotenv = __importStar(require("dotenv"));
const index_1 = require("./index");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Load environment variables
dotenv.config();
/**
 * Test the job searcher with sample skills
 */
async function testJobSearcher() {
    console.log('🚀 Starting Job Searcher Test...\n');
    // Sample skills from user profile
    const skills = [
        "Machine Learning",
        "Deep Learning",
        "Natural Language Processing",
        "Computer Vision",
        "Neural Networks",
        "Python",
        "JavaScript",
        "TypeScript",
        "Java",
        "C++",
        "TensorFlow",
        "PyTorch",
        "React",
        "Node.js",
        "FastAPI",
        "Django",
        "AWS",
        "Docker",
        "Kubernetes",
        "CI/CD",
        "Terraform",
        "Git",
        "SQL",
        "MongoDB",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "Jupyter",
    ];
    const location = "Austin, Texas, United States";
    try {
        // Test 1: Search with all skills
        console.log('📋 Test 1: Searching jobs with full skill set...\n');
        const results = await (0, index_1.searchJobsBySkills)(skills, location, undefined, {
            maxResults: 10,
            matchConfig: {
                minMatchScore: 3,
                minMatchPercentage: 15,
                prioritySkills: [
                    'Machine Learning',
                    'Python',
                    'TensorFlow',
                    'PyTorch',
                    'AWS'
                ]
            }
        });
        console.log((0, index_1.formatJobResults)(results));
        // Save clean JSON results to file
        const jsonOutput = (0, index_1.getCleanJobResultsJSON)(results, true);
        const outputPath = path.join(__dirname, '../job_results.json');
        fs.writeFileSync(outputPath, jsonOutput);
        console.log(`\n💾 Clean JSON results saved to: ${outputPath}\n`);
        // Display sample clean JSON
        console.log('\n📋 CLEAN JSON OUTPUT (First Job):');
        console.log('═══════════════════════════════════════════════════════');
        if (results.cleanResults.length > 0) {
            console.log(JSON.stringify(results.cleanResults[0], null, 2));
        }
        console.log('═══════════════════════════════════════════════════════\n');
        // Test 2: Search with specific AI/ML skills
        console.log('\n\n📋 Test 2: Searching jobs with AI/ML focus...\n');
        const aiSkills = [
            "Machine Learning",
            "Deep Learning",
            "Python",
            "TensorFlow",
            "PyTorch",
            "AWS"
        ];
        const aiResults = await (0, index_1.searchJobsBySkills)(aiSkills, location, undefined, {
            maxResults: 5,
            matchConfig: {
                minMatchScore: 2,
                minMatchPercentage: 30
            }
        });
        console.log((0, index_1.formatJobResults)(aiResults));
        // Save AI results as separate file
        const aiJsonOutput = (0, index_1.getCleanJobResultsJSON)(aiResults, true);
        const aiOutputPath = path.join(__dirname, '../ai_job_results.json');
        fs.writeFileSync(aiOutputPath, aiJsonOutput);
        console.log(`\n💾 AI-focused results saved to: ${aiOutputPath}\n`);
        // Display statistics
        console.log('\n\n📊 SEARCH STATISTICS');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Total Skills Searched: ${skills.length}`);
        console.log(`Location: ${location}`);
        console.log(`Full Search - Jobs Found: ${results.totalJobsFound}`);
        console.log(`Full Search - Jobs Matched: ${results.matchedJobs.length}`);
        console.log(`AI Focus Search - Jobs Found: ${aiResults.totalJobsFound}`);
        console.log(`AI Focus Search - Jobs Matched: ${aiResults.matchedJobs.length}`);
        if (results.matchedJobs.length > 0) {
            const avgMatch = results.matchedJobs.reduce((sum, job) => sum + job.matchPercentage, 0) / results.matchedJobs.length;
            console.log(`Average Match Percentage: ${avgMatch.toFixed(1)}%`);
            console.log(`Best Match: ${results.matchedJobs[0].matchPercentage}% - ${results.matchedJobs[0].title}`);
        }
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('✅ Test completed successfully!\n');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}
// Run test if executed directly
if (require.main === module) {
    testJobSearcher()
        .then(() => {
        console.log('✨ All tests passed!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('💥 Test failed with error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=test.js.map