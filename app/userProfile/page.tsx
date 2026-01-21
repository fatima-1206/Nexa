"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Mail,
  MapPin,
  Phone,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Calendar,
  ExternalLink,
  Upload,
} from "lucide-react"
import UploadResume from "./upload"

export default function UserProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing user data on mount
  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        setUserData(parsed)
      } catch (error) {
        console.error("Error parsing stored data:", error)
      }
    }
    setIsLoading(false)
  }, [])

  // Handle upload completion
  const handleUploadComplete = (data: any) => {
    setUserData(data)
  }

  // Show upload page if no data exists
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-orange-500 text-xl">Loading...</div>
      </div>
    )
  }

  if (!userData) {
    return <UploadResume onUploadComplete={handleUploadComplete} />
  }

  // Use uploaded data or default to hardcoded data for demo
  const profile = userData.profile || {
    name: "Shilok Kumar",
    title: "AI Engineer At Automata AI | Cofounder Of Seerra",
    location: "San Francisco, CA",
    email: "shilok.kumar@example.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/shilokkumar",
    github: "github.com/shilokkumar",
    website: "shilokkumar.com",
    summary: "Innovative AI Engineer with 5+ years of experience in machine learning, deep learning, and AI system architecture. Passionate about building scalable AI solutions and leading technical teams. Co-founded Seerra to democratize AI technology for enterprises.",
  }

  const skills = userData.skills || [
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
  ]

  const experiences = userData.experiences || [
    {
      title: "AI Engineer",
      company: "Automata AI",
      location: "San Francisco, CA",
      period: "2024 - Present",
      description: [
        "Leading development of advanced AI models for automation systems",
        "Architected and deployed ML pipelines processing 10M+ requests daily",
        "Improved model accuracy by 23% through innovative feature engineering",
        "Mentoring team of 5 junior engineers in ML best practices",
      ],
    },
    {
      title: "Cofounder & CTO",
      company: "Seerra",
      location: "Remote",
      period: "2023 - Present",
      description: [
        "Co-founded AI startup focused on enterprise automation solutions",
        "Built core AI infrastructure from ground up using modern ML frameworks",
        "Secured $2M in seed funding from top-tier VCs",
        "Grew engineering team from 0 to 12 members",
      ],
    },
    {
      title: "Senior Machine Learning Engineer",
      company: "Tech Innovations Inc",
      location: "New York, NY",
      period: "2021 - 2024",
      description: [
        "Developed predictive models achieving 94% accuracy for customer churn",
        "Implemented real-time ML inference system handling 50K req/sec",
        "Led migration of ML infrastructure to cloud-native architecture",
        "Published 3 research papers in top-tier ML conferences",
      ],
    },
    {
      title: "Machine Learning Engineer",
      company: "DataTech Solutions",
      location: "Austin, TX",
      period: "2019 - 2021",
      description: [
        "Built recommendation systems serving 5M+ users",
        "Optimized model training pipelines reducing costs by 40%",
        "Collaborated with cross-functional teams on AI product features",
        "Implemented A/B testing framework for model evaluation",
      ],
    },
  ]

  const education = userData.education || [
    {
      degree: "Master of Science in Computer Science",
      school: "Stanford University",
      location: "Stanford, CA",
      year: "2019",
      gpa: "3.9/4.0",
      focus: "Artificial Intelligence & Machine Learning",
    },
    {
      degree: "Bachelor of Science in Computer Engineering",
      school: "MIT",
      location: "Cambridge, MA",
      year: "2017",
      gpa: "3.8/4.0",
      focus: "Computer Systems & Software Engineering",
    },
  ]

  const certifications = userData.certifications || [
    { name: "AWS Certified Machine Learning - Specialty", issuer: "Amazon Web Services", year: "2024" },
    { name: "TensorFlow Developer Certificate", issuer: "Google", year: "2023" },
    { name: "Deep Learning Specialization", issuer: "DeepLearning.AI", year: "2022" },
    { name: "Kubernetes Application Developer", issuer: "CNCF", year: "2023" },
  ]

  const projects = userData.projects || [
    {
      name: "Neural Architecture Search Platform",
      description: "Automated ML model architecture optimization using reinforcement learning",
      tech: ["PyTorch", "Ray", "AWS", "Docker"],
      impact: "Reduced model development time by 60%",
    },
    {
      name: "Real-time Anomaly Detection System",
      description: "Large-scale distributed system for detecting anomalies in streaming data",
      tech: ["TensorFlow", "Kafka", "Kubernetes", "Python"],
      impact: "Monitors 100M+ events daily with 99.9% uptime",
    },
    {
      name: "Multi-modal AI Assistant",
      description: "AI assistant capable of processing text, images, and audio inputs",
      tech: ["Transformers", "OpenAI API", "React", "FastAPI"],
      impact: "Deployed to 50K+ users with 4.8/5 rating",
    },
  ]

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset your profile data? This will allow you to upload a new resume.")) {
      localStorage.removeItem("userData")
      setUserData(null)
    }
  }
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header / Profile Summary */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
            <div className="flex flex-col lg:flex-row gap-6 items-start flex-1">
              {/* Avatar */}
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center text-4xl font-bold text-white">
                {profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'SK'}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wider">{profile.name}</h1>
                  <p className="text-lg text-orange-500 mt-1">{profile.title}</p>
                </div>

                <p className="text-neutral-300 leading-relaxed">{profile.summary}</p>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Mail className="w-4 h-4 text-orange-500" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Phone className="w-4 h-4 text-orange-500" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Globe className="w-4 h-4 text-orange-500" />
                      <span>{profile.website}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3">
                  {profile.linkedin && (
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => window.open(`https://${profile.linkedin}`, "_blank")}
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  )}
                  {profile.github && (
                    <Button
                      className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                      onClick={() => window.open(`https://${profile.github}`, "_blank")}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  )}
                  {profile.website && (
                    <Button
                      className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                      onClick={() => window.open(`https://${profile.website}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Portfolio
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Upload New Resume Button */}
            <div className="flex items-center">
              <Button
                onClick={handleResetData}
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New Resume
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT COLUMN - Skills & Experience */}
        <div className="space-y-6">
          {/* Experience Section */}
          {experiences && experiences.length > 0 && (
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-xl font-bold text-white tracking-wider">WORK EXPERIENCE</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {experiences.map((exp: any, index: number) => (
                  <div key={index} className="relative pl-8 pb-6 border-l-2 border-neutral-700 last:pb-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-500 rounded-full" />
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                        <p className="text-orange-500 font-medium">{exp.company}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {exp.period}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {exp.location}
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-neutral-300">
                        {exp.description.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">▹</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
           {/* Skills Section */}
          {skills && skills.length > 0 && (
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Code className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-xl font-bold text-white tracking-wider">TECHNICAL SKILLS</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, index: number) => (
                  <Badge
                    key={index}
                    className="bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 transition-colors px-3 py-1.5"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* RIGHT COLUMN - Education, Certifications & Projects */}
        <div className="space-y-6">
          {/* Education */}
          {education && education.length > 0 && (
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-xl font-bold text-white tracking-wider">EDUCATION</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {education.map((edu: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-bold text-white">{edu.degree}</h3>
                    <p className="text-orange-500 font-medium">{edu.school}</p>
                    <div className="space-y-1 text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {edu.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Graduated {edu.year}
                      </div>
                      <div className="text-white">GPA: {edu.gpa}</div>
                      <div className="text-neutral-300">Focus: {edu.focus}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-xl font-bold text-white tracking-wider">CERTIFICATIONS</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certifications.map((cert: any, index: number) => (
                  <div key={index} className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg">
                    <h3 className="text-sm font-bold text-white">{cert.name}</h3>
                    <p className="text-xs text-orange-500 mt-1">{cert.issuer}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
                      <Badge className="bg-neutral-900 text-neutral-300">{cert.year}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Projects Section */}
          {projects && projects.length > 0 && (
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Code className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-xl font-bold text-white tracking-wider">KEY PROJECTS</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project: any, index: number) => (
                  <div key={index} className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg space-y-3">
                    <h3 className="text-base font-bold text-white">{project.name}</h3>
                    <p className="text-sm text-neutral-300">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech: string, i: number) => (
                        <Badge key={i} className="bg-orange-500/20 text-orange-500 text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-neutral-700">
                      <p className="text-xs text-neutral-400">
                        <span className="text-orange-500 font-medium">Impact:</span> {project.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
      {/* Download Resume Button */}
      <div className="flex justify-center pt-4">
        <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6">
          <ExternalLink className="w-5 h-5 mr-2" />
          Download Full Resume (PDF)
        </Button>
      </div>
    </div>
  )
}
