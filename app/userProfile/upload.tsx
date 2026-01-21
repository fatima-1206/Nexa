"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface UploadResumeProps {
  onUploadComplete: (data: any) => void
}

export default function UploadResume({ onUploadComplete }: UploadResumeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      setUploadStatus("idle")
      setErrorMessage("")
    } else {
      setErrorMessage("Please upload a PDF file")
      setUploadStatus("error")
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      setUploadStatus("idle")
      setErrorMessage("")
    } else {
      setErrorMessage("Please upload a PDF file")
      setUploadStatus("error")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("resume", selectedFile)

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to parse resume")
      }

      const data = await response.json()
      setUploadStatus("success")
      
      // Save to localStorage
      localStorage.setItem("userData", JSON.stringify(data))
      
      // Call the callback to update parent component
      setTimeout(() => {
        onUploadComplete(data)
      }, 1500)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      setErrorMessage("Failed to parse resume. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <Card className="bg-neutral-900 border-neutral-700 max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white tracking-wider">
            UPLOAD YOUR RESUME
          </CardTitle>
          <p className="text-neutral-400 mt-2">
            Upload your resume to generate your tactical profile
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all
              ${isDragging 
                ? "border-orange-500 bg-orange-500/10" 
                : "border-neutral-700 hover:border-orange-500/50 hover:bg-neutral-800/50"
              }
            `}
          >
            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <label htmlFor="resume-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-colors
                  ${isDragging ? "bg-orange-500" : "bg-neutral-800"}
                `}>
                  <Upload className={`w-8 h-8 ${isDragging ? "text-white" : "text-orange-500"}`} />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-white mb-1">
                    {selectedFile ? selectedFile.name : "Drop your resume here or click to browse"}
                  </p>
                  <p className="text-sm text-neutral-400">
                    PDF files only • Max size 10MB
                  </p>
                </div>

                {!selectedFile && (
                  <Button className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700">
                    Select File
                  </Button>
                )}
              </div>
            </label>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-neutral-800 border border-neutral-700 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                  <p className="text-xs text-neutral-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setSelectedFile(null)}
                variant="ghost"
                className="text-neutral-400 hover:text-white"
              >
                Remove
              </Button>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === "success" && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-500">Resume parsed successfully!</p>
                <p className="text-xs text-neutral-400">Redirecting to your profile...</p>
              </div>
            </div>
          )}

          {uploadStatus === "error" && errorMessage && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-500">Upload failed</p>
                <p className="text-xs text-neutral-400">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Parsing Resume...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Parse Resume
              </>
            )}
          </Button>

          {/* Info Section */}
          <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg">
            <h3 className="text-sm font-bold text-orange-500 tracking-wider mb-2">
              WHAT HAPPENS NEXT?
            </h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">▹</span>
                <span>Your resume will be analyzed using AI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">▹</span>
                <span>Profile, skills, experience, and projects will be extracted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">▹</span>
                <span>Your tactical profile will be generated automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">▹</span>
                <span>You can edit and update your information anytime</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
