"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Monitor, Settings, Shield, Target, Users, Bell, RefreshCw, User,Briefcase,Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import CommandCenterPage from "../command-center/page"
import AgentNetworkPage from "../agent-network/page"
import OperationsPage from "../operations/page"
import IntelligencePage from "../jobsFound/page"
import UserProfilePage from "../userProfile/page"
import InterviewPreparationPage from "../interview-preperation/page"

export default function TacticalDashboard() {
  const [activeSection, setActiveSection] = useState("jobsFound")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Check for navigation flag on mount
  useEffect(() => {
    const shouldNavigateToInterviewPrep = localStorage.getItem('navigateToInterviewPrep')
    if (shouldNavigateToInterviewPrep === 'true') {
      setActiveSection('interview preparation')
      localStorage.removeItem('navigateToInterviewPrep')
    }
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Get page label based on active section
  const getPageLabel = () => {
    const labels: Record<string, string> = {
      overview: "COMMAND CENTER",
      agents: "AGENT NETWORK",
      operations: "OPERATIONS",
      jobsFound: "JOBS",
      "interview preparation": "INTERVIEW PREPARATION",
      "user profile": "USER PROFILE"
    }
    return labels[activeSection] || "OVERVIEW"
  }

  // Format current date and time
  const formatDateTime = () => {
    const month = String(currentTime.getMonth() + 1).padStart(2, '0')
    const day = String(currentTime.getDate()).padStart(2, '0')
    const year = currentTime.getFullYear()
    const hours = String(currentTime.getHours()).padStart(2, '0')
    const minutes = String(currentTime.getMinutes()).padStart(2, '0')
    return `${month}/${day}/${year} ${hours}:${minutes} UTC`
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-orange-500 font-bold text-lg tracking-wider">Nexa</h1>
              <p className="text-neutral-500 text-xs">Streamline your learning</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-neutral-400 hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {[
            //   { id: "agents", icon: Users, label: "AGENT NETWORK" },
            //   { id: "operations", icon: Target, label: "OPERATIONS" },
            { id: "overview", icon: Monitor, label: "COMMAND CENTER" },
              { id: "user profile", icon: User, label: "USER PROFILE" },
              { id: "jobsFound", icon: Briefcase, label: "JOBS" },
              { id: "interview preparation", icon: Book, label: "INTERVIEW PREPARATION" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                  activeSection === item.id
                    ? "bg-orange-500 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-neutral-800 border border-neutral-700 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs text-white">SYSTEM ONLINE</span>
              </div>
              <div className="text-xs text-neutral-500">
                <div>UPTIME: 72:14:33</div>
                <div>AGENTS: 847 ACTIVE</div>
                <div>MISSIONS: 23 ONGOING</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Toolbar */}
        <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              DASHBOARD / <span className="text-orange-500">{getPageLabel()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-neutral-500">LAST UPDATE: {formatDateTime()}</div>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          {activeSection === "overview" && <CommandCenterPage />}
          {activeSection === "agents" && <AgentNetworkPage />}
          {activeSection === "operations" && <OperationsPage />}
          {activeSection === "jobsFound" && <IntelligencePage onNavigateToInterviewPrep={() => setActiveSection("interview preparation")} />}
          {activeSection === "user profile" && <UserProfilePage />}
          {activeSection === "interview preparation" && <InterviewPreparationPage />}
        </div>
      </div>
    </div>
  )
}
