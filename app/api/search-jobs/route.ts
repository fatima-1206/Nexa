import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { skills, location } = await request.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'Skills array is required' },
        { status: 400 }
      );
    }

    // Get SerpAPI key from environment
    const serpApiKey = process.env.SERPAPI_KEY;
    
    if (!serpApiKey) {
      return NextResponse.json(
        { error: 'SERPAPI_KEY is not configured. Please add it to .env.local file.' },
        { status: 500 }
      );
    }

    // Dynamic import the job searcher
    const { searchJobsBySkills } = await import('../../../backend/jobSearcher/src/index');

    // Search jobs using the user's skills
    const results = await searchJobsBySkills(
      skills,
      location || 'United States',
      serpApiKey,
      {
        maxResults: 50, // Increased to show more matched jobs
        matchConfig: {
          minMatchScore: 2,
          minMatchPercentage: 15,
          prioritySkills: skills.slice(0, 5) // Top 5 skills as priority
        }
      }
    );

    // Return clean results for the frontend
    return NextResponse.json({
      success: true,
      jobs: results.cleanResults,
      metadata: {
        totalJobsFound: results.totalJobsFound,
        matchedJobs: results.matchedJobs.length,
        query: results.query,
        location: results.location,
        searchedAt: results.searchMetadata.searchedAt,
        processingTime: results.searchMetadata.processingTime
      }
    });

  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to search jobs', details: String(error) },
      { status: 500 }
    );
  }
}
