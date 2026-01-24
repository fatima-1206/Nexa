'use client';

import { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';

type PageStep = 'input' | 'sources' | 'chat';

const LOCAL_STORAGE_KEY = 'selectedSources';
const LOCAL_STORAGE_SOURCES_KEY = 'persistedSources';
const LOCAL_STORAGE_EMBEDDINGS_KEY = 'embeddingsData';
const LOCAL_STORAGE_INTERVIEW_DATA_KEY = 'interviewData';

export default function InterviewPreparationPage() {
  const [step, setStep] = useState<PageStep>('input');
  const [interviewData, setInterviewData] = useState({
    companyName: '',
    role: '',
    jobDescription: '',
    missingSkills: [] as string[],
    roleSeniority: '',
    techStack: [] as string[],
    interviewType: '',
  });
  const [selectedSources, setSelectedSources] = useState<any[]>([]);
  const [embeddingsData, setEmbeddingsData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [preparationStatus, setPreparationStatus] = useState<string>('');
  const [isPreparingResources, setIsPreparingResources] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const savedSelected = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedEmbeddings = localStorage.getItem(LOCAL_STORAGE_EMBEDDINGS_KEY);
    const savedInterviewData = localStorage.getItem(LOCAL_STORAGE_INTERVIEW_DATA_KEY);
    const shouldStartAutomatedPrep = localStorage.getItem('startAutomatedPreparation');

    // Check if we should start automated preparation
    if (shouldStartAutomatedPrep === 'true') {
      localStorage.removeItem('startAutomatedPreparation');
      
      // Load interview data
      if (savedInterviewData) {
        try {
          const parsedData = JSON.parse(savedInterviewData);
          console.log('Loaded interview data from localStorage:', {
            role: parsedData.role,
            company: parsedData.companyName,
            hasDescription: !!parsedData.jobDescription,
            descriptionLength: parsedData.jobDescription?.length || 0,
            fullData: parsedData
          });
          setInterviewData(parsedData);
          setStep('chat');
          setLoading(false);
          setIsPreparingResources(true);
          setLogs(['🚀 Starting automated interview preparation...', `📋 Job: ${parsedData.role} at ${parsedData.companyName}`]);
          
          // Start automated preparation
          startAutomatedPreparation(parsedData);
          return;
        } catch (e) {
          console.error('Error parsing interview data:', e);
        }
      }
    }

    // Only load old data if NOT starting automated prep
    async function fetchSelectedSources() {
      try {
        const res = await fetch('/api/load-selected-sources');
        const data = await res.json();
        if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
          setSelectedSources(data.sources);
          
          // Try to load embeddings
          if (data.embeddingsData) {
            setEmbeddingsData(data.embeddingsData);
            setStep('chat');
          } else {
            setStep('sources');
          }
          
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error fetching selected sources:', e);
      }
      setLoading(false);
      setStep('chat');
    }

    if (savedSelected && savedEmbeddings && savedInterviewData) {
      try {
        const parsed = JSON.parse(savedSelected);
        const embeddingsParsed = JSON.parse(savedEmbeddings);
        const interviewDataParsed = JSON.parse(savedInterviewData);
        
        if (
          Array.isArray(parsed) && 
          parsed.length > 0 && 
          embeddingsParsed &&
          interviewDataParsed &&
          interviewDataParsed.role &&
          interviewDataParsed.companyName
        ) {
          setSelectedSources(parsed);
          setEmbeddingsData(embeddingsParsed);
          setInterviewData(interviewDataParsed);
          setStep('chat');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing saved data:', e);
      }
    }

    if (savedSelected) {
      try {
        const parsed = JSON.parse(savedSelected);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedSources(parsed);
          setStep('sources');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing saved sources:', e);
      }
    }

    fetchSelectedSources();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  const startAutomatedPreparation = async (data: typeof interviewData) => {
    try {
      const statusMsg = '🔍 Parsing job description and extracting skills...';
      setPreparationStatus(statusMsg);
      addLog(statusMsg);
      
      addLog(`📋 Job Title: ${data.role}`);
      addLog(`🏢 Company: ${data.companyName}`);
      addLog(`📄 Description Length: ${data.jobDescription?.length || 0} characters`);
      
      addLog('📡 Calling AI preparation API...');
      const response = await fetch('/api/auto-prepare-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: data.role,
          jobDescription: data.jobDescription,
          company: data.companyName,
        }),
      });

      addLog('✅ API response received');
      const statusMsg2 = '🌐 Searching for high-quality learning resources...';
      setPreparationStatus(statusMsg2);
      addLog(statusMsg2);
      
      const result = await response.json();
      addLog(`📊 Extracted ${result.skills?.length || 0} skills from job description`);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to prepare resources');
      }

      addLog(`🔗 Found ${result.sources?.length || 0} learning resources`);
      const statusMsg3 = '🧠 Building AI knowledge base...';
      setPreparationStatus(statusMsg3);
      addLog(statusMsg3);

      // Update interview data with extracted skills
      const updatedData = {
        ...data,
        missingSkills: result.skills.slice(0, 5),
        techStack: result.skills.slice(0, 10),
      };
      setInterviewData(updatedData);

      // Store the prepared data
      setSelectedSources(result.sources || []);
      setEmbeddingsData(result.vectorStore);
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result.sources || []));
      localStorage.setItem(LOCAL_STORAGE_EMBEDDINGS_KEY, JSON.stringify(result.vectorStore));
      localStorage.setItem(LOCAL_STORAGE_INTERVIEW_DATA_KEY, JSON.stringify(updatedData));

      addLog('💾 Saved embeddings and resources to local storage');
      const finalMsg = '✅ Ready! Your AI interview coach is loaded.';
      setPreparationStatus(finalMsg);
      addLog(finalMsg);
      addLog('🎯 You can now start asking questions!');
      
      setTimeout(() => {
        setIsPreparingResources(false);
        setPreparationStatus('');
      }, 1500);
    } catch (error) {
      console.error('Error in automated preparation:', error);
      const errorMsg = `❌ Error: ${error instanceof Error ? error.message : 'Failed to prepare resources'}`;
      setPreparationStatus(errorMsg);
      addLog(errorMsg);
      addLog('🔄 Please try again or contact support');
      setTimeout(() => {
        setIsPreparingResources(false);
        setPreparationStatus('');
        setStep('chat');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-neutral-900 to-black">
        <span className="text-orange-500 text-xl">Loading...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface
            interviewData={interviewData}
            sources={selectedSources}
            embeddingsData={embeddingsData}
            isPreparingResources={isPreparingResources}
            preparationStatus={preparationStatus}
            logs={logs}
          />
        </div>
      </div>
    </div>
  );
}