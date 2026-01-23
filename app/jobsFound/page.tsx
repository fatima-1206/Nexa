"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Briefcase, ExternalLink, MapPin, Calendar, DollarSign, TrendingUp, Building2, AlertCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

// Job type matching the backend CleanJobResult interface
interface Job {
  title: string
  company: string
  city: string
  country: string
  jobDescription: string
  datePosted: string
  url: string
  matchScore: number
  matchedSkills: string[]
  matchPercentage: number
  relevanceReason: string
  salary?: string
  jobType?: string
  workFromHome?: boolean
}

interface UserProfile {
  profile?: {
    name?: string
    location?: string
  }
  skills?: string[]
}

export default function IntelligencePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [searchMetadata, setSearchMetadata] = useState<{
    totalJobsFound: number
    matchedJobs: number
    processingTime: number
  } | null>(null)
  const router = useRouter()

  // Load user profile from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        setUserProfile(parsed)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  // Function to search jobs using the backend
  const searchJobs = async () => {
    if (!userProfile?.skills || userProfile.skills.length === 0) {
      setError("No skills found in your profile. Please upload your resume first.")
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch('/api/search-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: userProfile.skills,
          location: userProfile.profile?.location || 'United States'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search jobs')
      }

      setJobs(data.jobs || [])
      setSearchMetadata(data.metadata)
    } catch (error) {
      console.error('Error searching jobs:', error)
      setError(error instanceof Error ? error.message : 'Failed to search jobs')
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  const getMatchColor = (matchPercentage: number) => {
    if (matchPercentage >= 60) return "bg-green-500/20 text-green-500"
    if (matchPercentage >= 40) return "bg-orange-500/20 text-orange-500"
    return "bg-neutral-500/20 text-neutral-300"
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.matchedSkills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleStartPreparing = (job: Job) => {
    // Extract missing skills (skills in job that user might not have)
    const userSkills = new Set(userProfile?.skills?.map(s => s.toLowerCase()) || [])
    const missingSkills = job.matchedSkills.filter(
      skill => !userSkills.has(skill.toLowerCase())
    )

    // Prepare interview data
    const interviewData = {
      companyName: job.company,
      role: job.title,
      missingSkills: missingSkills.length > 0 ? missingSkills : job.matchedSkills.slice(0, 3),
      roleSeniority: "Mid", // Default, could be enhanced based on job level
      techStack: job.matchedSkills.slice(0, 5),
      interviewType: "Technical",
    }

    // Store in localStorage for the interview prep page
    localStorage.setItem('interviewPrepData', JSON.stringify(interviewData))
    
    // Navigate to interview preparation
    router.push('/interview-preperation')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">JOB OPPORTUNITIES</h1>
          <p className="text-sm text-neutral-400">
            {userProfile?.skills 
              ? `Find jobs matching your ${userProfile.skills.length} skills`
              : "Upload your resume to find matching jobs"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={searchJobs}
            disabled={isLoading || !userProfile?.skills}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Jobs
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Filter jobs by title or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400"
                disabled={jobs.length === 0}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">MATCHED JOBS</p>
                <p className="text-2xl font-bold text-white font-mono">{jobs.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">AVG MATCH</p>
                <p className="text-2xl font-bold text-orange-500 font-mono">
                  {jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + job.matchPercentage, 0) / jobs.length) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOP MATCH</p>
                <p className="text-2xl font-bold text-green-500 font-mono">
                  {jobs.length > 0 ? Math.max(...jobs.map(j => j.matchPercentage)) : 0}%
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-500">Error</p>
                <p className="text-xs text-neutral-400">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Listings */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">JOB LISTINGS</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-neutral-400 mt-4">Searching for jobs matching your skills...</p>
              <p className="text-neutral-500 text-sm mt-2">This may take a few seconds</p>
            </div>
          ) : !hasSearched ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              {userProfile?.skills ? (
                <>
                  <p className="text-neutral-400 text-lg mb-2">Ready to find jobs</p>
                  <p className="text-neutral-500 text-sm mb-4">Click "Search Jobs" to find opportunities matching your {userProfile.skills.length} skills</p>
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={searchJobs}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search Jobs
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-neutral-400 text-lg mb-2">No profile found</p>
                  <p className="text-neutral-500 text-sm">Please upload your resume in the User Profile section first</p>
                </>
              )}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400">No jobs found matching your skills</p>
              <p className="text-neutral-500 text-sm mt-2">Try searching again or update your profile</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job, index) => (
                <div
                  key={index}
                  className="border border-neutral-700 rounded p-4 hover:border-orange-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-white tracking-wide">{job.title}</h3>
                          <p className="text-sm text-neutral-400 flex items-center gap-2 mt-1">
                            <Building2 className="w-3 h-3" />
                            {job.company}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-neutral-300 ml-8 line-clamp-2">{job.jobDescription}</p>

                      <div className="flex flex-wrap gap-2 ml-8">
                        {job.matchedSkills.slice(0, 5).map((skill) => (
                          <Badge key={skill} className="bg-orange-500/20 text-orange-500 text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.matchedSkills.length > 5 && (
                          <Badge className="bg-neutral-800 text-neutral-400 text-xs">
                            +{job.matchedSkills.length - 5} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 ml-8 text-xs text-neutral-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{job.city}, {job.country}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{job.datePosted}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 min-w-[140px]">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getMatchColor(job.matchPercentage)}>
                          {job.matchPercentage}% MATCH
                        </Badge>
                        {job.workFromHome && (
                          <Badge className="bg-blue-500/20 text-blue-500">
                            REMOTE
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-neutral-400">
                        <div className="font-mono text-white">{job.matchScore} skills matched</div>
                        <div className="mt-1 text-right">{job.relevanceReason}</div>
                      </div>

                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(job.url, '_blank')
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-white tracking-wider">{selectedJob.title}</CardTitle>
                <p className="text-sm text-neutral-400 flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4" />
                  {selectedJob.company}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedJob(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">MATCH ANALYSIS</h3>
                    <div className="flex gap-2 mb-3">
                      <Badge className={getMatchColor(selectedJob.matchPercentage)}>
                        {selectedJob.matchPercentage}% MATCH
                      </Badge>
                      {selectedJob.workFromHome && (
                        <Badge className="bg-blue-500/20 text-blue-500">
                          REMOTE
                        </Badge>
                      )}
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300 bg-orange-500"
                        style={{ width: `${selectedJob.matchPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">{selectedJob.relevanceReason}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">JOB DETAILS</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Location:</span>
                        <span className="text-white">{selectedJob.city}, {selectedJob.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Posted:</span>
                        <span className="text-white font-mono">{selectedJob.datePosted}</span>
                      </div>
                      {selectedJob.salary && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Salary:</span>
                          <span className="text-white">{selectedJob.salary}</span>
                        </div>
                      )}
                      {selectedJob.jobType && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Type:</span>
                          <span className="text-white">{selectedJob.jobType}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Skills Matched:</span>
                        <span className="text-orange-500 font-mono">{selectedJob.matchScore} skills</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">MATCHED SKILLS</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.matchedSkills.map((skill) => (
                        <Badge key={skill} className="bg-orange-500/20 text-orange-500">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">SKILL MATCH BREAKDOWN</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Your Skills</span>
                        <span className="text-white font-mono">28 total</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Matched</span>
                        <span className="text-orange-500 font-mono">{selectedJob.matchedSkills.length} skills</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Match Quality</span>
                        <Badge className={getMatchColor(selectedJob.matchPercentage)}>
                          {selectedJob.matchPercentage >= 60 ? 'EXCELLENT' : selectedJob.matchPercentage >= 40 ? 'GOOD' : 'FAIR'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">JOB DESCRIPTION</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">{selectedJob.jobDescription}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-700 flex-wrap">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => window.open(selectedJob.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    handleStartPreparing(selectedJob)
                    setSelectedJob(null)
                  }}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Start Preparing
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedJob.url)
                  }}
                >
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  Save Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}