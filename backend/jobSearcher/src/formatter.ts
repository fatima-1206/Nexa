import { MatchedJob, CleanJobResult } from './types';

/**
 * Formatter to convert matched jobs to clean JSON format
 */
export class JobFormatter {
  /**
   * Convert matched jobs to clean JSON format with required fields
   */
  static formatJobsToCleanJSON(matchedJobs: MatchedJob[]): CleanJobResult[] {
    return matchedJobs.map(job => this.formatSingleJob(job));
  }

  /**
   * Format a single job to clean JSON format
   */
  static formatSingleJob(job: MatchedJob): CleanJobResult {
    const { city, country } = this.parseLocation(job.location);
    const url = this.extractJobURL(job);
    const datePosted = this.extractDatePosted(job);

    return {
      title: job.title || 'N/A',
      company: job.company_name || 'N/A',
      city: city,
      country: country,
      jobDescription: job.description || 'No description available',
      datePosted: datePosted,
      url: url,
      matchScore: job.matchScore,
      matchedSkills: job.matchedSkills,
      matchPercentage: job.matchPercentage,
      relevanceReason: job.relevanceReason,
      salary: job.detected_extensions?.salary,
      jobType: job.detected_extensions?.schedule_type,
      workFromHome: job.detected_extensions?.work_from_home
    };
  }

  
  /**
   * Parse location into city and country
   * Examples:
   * - "Austin, TX" -> city: "Austin", country: "United States"
   * - "Austin, Texas, United States" -> city: "Austin", country: "United States"
   * - "Remote" -> city: "Remote", country: "N/A"
   */
  private static parseLocation(location: string): { city: string; country: string } {
    if (!location) {
      return { city: 'N/A', country: 'N/A' };
    }

    const parts = location.split(',').map(p => p.trim());

    // Handle remote jobs
    if (location.toLowerCase().includes('remote')) {
      return { city: 'Remote', country: 'N/A' };
    }

    // Handle various location formats
    if (parts.length >= 3) {
      // "Austin, Texas, United States"
      return {
        city: parts[0],
        country: parts[parts.length - 1]
      };
    } else if (parts.length === 2) {
      // "Austin, TX" or "Austin, United States"
      const stateAbbreviations = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
      ];

      if (stateAbbreviations.includes(parts[1].toUpperCase())) {
        // State abbreviation, assume USA
        return {
          city: parts[0],
          country: 'United States'
        };
      } else {
        // Assume second part is country
        return {
          city: parts[0],
          country: parts[1]
        };
      }
    } else {
      // Single part - just city
      return {
        city: parts[0],
        country: 'N/A'
      };
    }
  }

  /**
   * Extract job application URL from job data
   */
  private static extractJobURL(job: MatchedJob): string {
    // Priority 1: Apply options
    if (job.apply_options && job.apply_options.length > 0) {
      return job.apply_options[0].link;
    }

    // Priority 2: Related links
    if (job.related_links && job.related_links.length > 0) {
      return job.related_links[0].link;
    }

    // Priority 3: Via source
    if (job.via) {
      // Try to construct a search URL
      const encodedTitle = encodeURIComponent(job.title);
      const encodedCompany = encodeURIComponent(job.company_name);
      return `https://www.google.com/search?q=${encodedTitle}+${encodedCompany}`;
    }

    return 'N/A';
  }

  /**
   * Extract date posted from job data
   */
  private static extractDatePosted(job: MatchedJob): string {
    if (job.detected_extensions?.posted_at) {
      return job.detected_extensions.posted_at;
    }

    // Check in extensions array
    if (job.extensions) {
      for (const ext of job.extensions) {
        // Look for date-like strings
        if (ext.match(/\d+\s+(hour|day|week|month)s?\s+ago/i)) {
          return ext;
        }
        if (ext.match(/today|yesterday/i)) {
          return ext;
        }
      }
    }

    return 'N/A';
  }

  /**
   * Format clean results as pretty JSON string
   */
  static toJSONString(cleanResults: CleanJobResult[], pretty: boolean = true): string {
    return JSON.stringify(cleanResults, null, pretty ? 2 : 0);
  }
}
