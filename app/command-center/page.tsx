"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface JobSearch {
  role: string;
  company: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  jobRole: string;
  jobCompany: string;
  timestamp: number;
}

interface InterviewSession {
  role: string;
  companyName: string;
  missingSkills: string[];
  timestamp?: number;
}

export default function CommandCenterPage() {
  const [stats, setStats] = useState({
    activePreps: 0,
    totalJobs: 0,
    chatSessions: 0,
    resources: 0,
  });
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobSearch[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const loadDashboardData = () => {
      try {
        // Get job searches
        const jobsData = localStorage.getItem('jobSearchResults');
        let jobs = [];
        if (jobsData) {
          const parsed = JSON.parse(jobsData);
          // Handle both old format (array) and new format (object with jobs property)
          jobs = parsed.jobs || parsed || [];
        }
        
        // Get chat sessions
        const sessionsData = localStorage.getItem('chatSessions');
        const sessions: ChatSession[] = sessionsData ? JSON.parse(sessionsData) : [];
        
        // Get selected sources/resources
        const sourcesData = localStorage.getItem('selectedSources');
        const sources = sourcesData ? JSON.parse(sourcesData) : [];
        
        // Get interview data
        const interviewData = localStorage.getItem('interviewData');
        const currentInterview = interviewData ? JSON.parse(interviewData) : null;

        // Update stats
        setStats({
          activePreps: currentInterview ? 1 : 0,
          totalJobs: Array.isArray(jobs) ? jobs.length : 0,
          chatSessions: sessions.length,
          resources: sources.length,
        });

        // Get recent sessions (last 4)
        const sortedSessions = sessions
          .sort((a: ChatSession, b: ChatSession) => b.timestamp - a.timestamp)
          .slice(0, 4);
        setRecentSessions(sortedSessions);

        // Get recent jobs (last 5)
        const jobsList = Array.isArray(jobs) ? jobs.slice(0, 5).map((job: any, index: number) => ({
          role: job.title || job.role || 'Unknown Role',
          company: job.company || job.companyName || 'Unknown Company',
          timestamp: Date.now() - (index * 3600000), // Mock timestamps
        })) : [];
        setRecentJobs(jobsList);

        // Build activity log
        const activities = [];
        
        // Add chat activities
        sessions.slice(0, 3).forEach((session: ChatSession) => {
          activities.push({
            time: new Date(session.timestamp).toLocaleString(),
            action: 'started chat session',
            target: session.jobRole,
            company: session.jobCompany,
            type: 'chat',
          });
        });

        // Add job search activity
        if (jobsList.length > 0) {
          activities.push({
            time: new Date(Date.now() - 1800000).toLocaleString(),
            action: 'searched for jobs',
            target: jobsList[0].role,
            company: null,
            type: 'search',
          });
        }

        // Add resource activity
        if (sources.length > 0) {
          activities.push({
            time: new Date(Date.now() - 3600000).toLocaleString(),
            action: 'loaded resources',
            target: `${sources.length} sources`,
            company: null,
            type: 'resource',
          });
        }

        setRecentActivity(activities.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-hidden">
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        {/* System Status Overview */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(50vh - 3rem)' }}>
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">SYSTEM STATUS</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500 font-mono">{stats.activePreps}</div>
                <div className="text-xs text-neutral-500">Active Prep</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">{stats.totalJobs}</div>
                <div className="text-xs text-neutral-500">Jobs Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">{stats.chatSessions}</div>
                <div className="text-xs text-neutral-500">Chat Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">{stats.resources}</div>
                <div className="text-xs text-neutral-500">Resources</div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500 mb-2">Recent Chat Sessions</p>
              {recentSessions.length > 0 ? (
                recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <div>
                        <div className="text-xs text-white truncate max-w-[200px]">{session.title}</div>
                        <div className="text-xs text-neutral-500">{session.jobCompany}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-600 text-center py-4">No active sessions</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(50vh - 3rem)' }}>
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">ACTIVITY LOG</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-3 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((log, index) => (
                  <div
                    key={index}
                    className={`text-xs border-l-2 pl-3 hover:bg-neutral-800 p-2 rounded transition-colors ${
                      log.type === 'chat' ? 'border-orange-500' : 
                      log.type === 'search' ? 'border-blue-500' : 
                      'border-green-500'
                    }`}
                  >
                    <div className="text-neutral-500 font-mono">{log.time}</div>
                    <div className="text-white">
                      You <span className="text-orange-500">{log.action}</span> for{" "}
                      <span className="text-white font-medium">{log.target}</span>
                      {log.company && (
                        <span> at <span className="text-orange-500 font-mono">{log.company}</span></span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-600 text-xs">No recent activity</p>
                  <p className="text-neutral-700 text-xs mt-1">Start by searching for jobs</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Job Searches */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(50vh - 3rem)' }}>
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              RECENT JOB SEARCHES
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-auto">
            <div className="text-xs space-y-2 w-full">
              {recentJobs.length > 0 ? (
                recentJobs.map((job, index) => (
                  <div key={index} className="p-2 bg-neutral-800 rounded hover:bg-neutral-700 transition">
                    <div className="text-white font-medium truncate">{job.role}</div>
                    <div className="text-orange-500 text-[10px]">{job.company}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="relative w-24 h-24 mb-4 mx-auto">
                    <div className="absolute inset-0 border-2 border-orange-500/30 rounded-full opacity-60 animate-pulse"></div>
                    <div className="absolute inset-2 border border-orange-500/20 rounded-full opacity-40"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-orange-500/50 text-3xl">🔍</span>
                    </div>
                  </div>
                  <p className="text-neutral-600">No job searches yet</p>
                  <p className="text-neutral-700 text-[10px] mt-1">Search for your dream job to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preparation Activity Overview */}
        <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(50vh - 3rem)' }}>
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              PREPARATION ACTIVITY OVERVIEW
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="h-48 relative">
              {/* Chart Grid */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-neutral-700"></div>
                ))}
              </div>

              {/* Chart Line - Dynamic based on stats */}
              <svg className="absolute inset-0 w-full h-full">
                <polyline
                  points={`0,${192 - stats.chatSessions * 10} 50,${192 - stats.resources * 2} 100,${192 - stats.totalJobs * 15} 150,${192 - stats.activePreps * 20} 200,${192 - stats.chatSessions * 12} 250,${192 - stats.resources * 3} 300,${192 - stats.totalJobs * 10} 350,${192 - stats.chatSessions * 15}`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <polyline
                  points="0,140 50,135 100,130 150,125 200,130 250,135 300,125 350,120"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.3"
                />
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-500 -ml-8 font-mono">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-neutral-500 -mb-6 font-mono">
                <span>Last 7 Days</span>
                <span>Today</span>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-orange-500"></div>
                <span className="text-neutral-400">Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-white opacity-30" style={{ borderTop: '1px dashed white' }}></div>
                <span className="text-neutral-400">Baseline</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Analytics */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(50vh - 3rem)' }}>
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">SYSTEM ANALYTICS</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-orange-500 font-medium">Preparation Metrics</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Active Sessions</span>
                    <span className="text-white font-bold font-mono">{stats.activePreps}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Total Chat Sessions</span>
                    <span className="text-white font-bold font-mono">{stats.chatSessions}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Resources Loaded</span>
                    <span className="text-white font-bold font-mono">{stats.resources}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Jobs Discovered</span>
                    <span className="text-white font-bold font-mono">{stats.totalJobs}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-500 font-medium">AI Coach Status</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Model</span>
                    <span className="text-white font-bold font-mono">GPT-4o</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Provider</span>
                    <span className="text-white font-bold font-mono">GitHub</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Status</span>
                    <span className="text-green-500 font-bold font-mono">ONLINE</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Embeddings</span>
                    <span className="text-white font-bold font-mono">HF MPNet</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
