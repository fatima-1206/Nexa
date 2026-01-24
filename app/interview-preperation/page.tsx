'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InputForm from "./InputForm";
import SourceSearch from './SourceSearch';
import ChatInterface from './ChatInterface';

type PageStep = 'input' | 'sources' | 'chat';

const LOCAL_STORAGE_KEY = 'selectedSources';
const LOCAL_STORAGE_SOURCES_KEY = 'persistedSources';
const LOCAL_STORAGE_EMBEDDINGS_KEY = 'embeddingsData';
const LOCAL_STORAGE_INTERVIEW_DATA_KEY = 'interviewData';

export default function InterviewPreparationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<PageStep>('input');
  const [interviewData, setInterviewData] = useState({
    skills: [] as string[],
    role: '',
    company: '',
    experience: '',
  });
  const [selectedSources, setSelectedSources] = useState<any[]>([]);
  const [embeddingsData, setEmbeddingsData] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Synchronize `step` state with the URL query parameter
  useEffect(() => {
    const urlStep = searchParams.get('step') as PageStep;
    if (urlStep && ['input', 'sources', 'chat'].includes(urlStep)) {
      setStep(urlStep);
    }
  }, [searchParams]);

  // Initialize data from localStorage - BUT ONLY IF NO URL STEP IS PROVIDED
  useEffect(() => {
    const urlStep = searchParams.get('step');
    
    // If there's a URL step parameter, load the necessary data for that step
    if (urlStep && ['input', 'sources', 'chat'].includes(urlStep)) {
      // For chat step, load all necessary data
      if (urlStep === 'chat') {
        const savedSelected = localStorage.getItem(LOCAL_STORAGE_KEY);
        const savedEmbeddings = localStorage.getItem(LOCAL_STORAGE_EMBEDDINGS_KEY);
        const savedInterviewData = localStorage.getItem(LOCAL_STORAGE_INTERVIEW_DATA_KEY);

        console.log('Chat step - saved data:', {
          savedSelected: !!savedSelected,
          savedEmbeddings: !!savedEmbeddings,
          savedInterviewData: !!savedInterviewData,
        });

        if (savedSelected && savedEmbeddings && savedInterviewData) {
          try {
            const parsed = JSON.parse(savedSelected);
            const embeddingsParsed = JSON.parse(savedEmbeddings);
            const interviewDataParsed = JSON.parse(savedInterviewData);
            
            console.log('Raw interview data:', interviewDataParsed);
            
            setSelectedSources(Array.isArray(parsed) ? parsed : []);
            setEmbeddingsData(typeof embeddingsParsed === 'string' ? embeddingsParsed : JSON.stringify(embeddingsParsed));
            
            // Normalize the interview data structure
            const normalizedData = {
              skills: interviewDataParsed.skills || interviewDataParsed.techStack || [],
              role: interviewDataParsed.role || '',
              company: interviewDataParsed.company || interviewDataParsed.companyName || '',
              experience: interviewDataParsed.experience || interviewDataParsed.roleSeniority || '',
            };
            
            console.log('Normalized interview data:', normalizedData);
            setInterviewData(normalizedData);
          } catch (e) {
            console.error('Error parsing saved data:', e);
            // Clear corrupted data
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            localStorage.removeItem(LOCAL_STORAGE_EMBEDDINGS_KEY);
            localStorage.removeItem(LOCAL_STORAGE_INTERVIEW_DATA_KEY);
            setLoading(false);
            return;
          }
        }
      }
      setLoading(false);
      return;
    }

    // Original initialization logic for when no URL step is provided
    const savedSelected = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedEmbeddings = localStorage.getItem(LOCAL_STORAGE_EMBEDDINGS_KEY);
    const savedInterviewData = localStorage.getItem(LOCAL_STORAGE_INTERVIEW_DATA_KEY);

    async function fetchSelectedSources() {
      try {
        const res = await fetch('/api/load-selected-sources');
        const data = await res.json();
        if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
          setSelectedSources(data.sources);
          
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
      setStep('input');
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
          interviewDataParsed.company
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
  }, [searchParams]);

  const handleInputSubmit = (data: typeof interviewData) => {
    setInterviewData(data);
    localStorage.setItem(LOCAL_STORAGE_INTERVIEW_DATA_KEY, JSON.stringify(data));
    router.push('/interview-preperation?step=sources');
  };

  const handleSourcesComplete = (sources: any[], newEmbeddingsData: string) => {
    setSelectedSources(sources);
    setEmbeddingsData(newEmbeddingsData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sources));
    localStorage.setItem(LOCAL_STORAGE_EMBEDDINGS_KEY, JSON.stringify(newEmbeddingsData));
    router.push('/interview-preperation?step=chat');
  };

  const handleBackToSources = () => {
    router.push('/interview-preperation?step=sources');
    setSelectedSources([]);
    setEmbeddingsData('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_EMBEDDINGS_KEY);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-neutral-900 to-black">
        <span className="text-orange-500 text-xl">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-2 neon-glow">
          Interview Preparation
        </h1>
        <p className="text-neutral-400 mb-8">Master your interview with AI-powered preparation</p>

        {step === 'input' && <InputForm onSubmit={handleInputSubmit} />}

        {step === 'sources' && (
          <SourceSearch
            interviewData={interviewData}
            onComplete={handleSourcesComplete}
            onBack={() => setStep('input')}
          />
        )}

        {step === 'chat' && embeddingsData && selectedSources.length > 0 && (
          <ChatInterface
            interviewData={interviewData}
            sources={selectedSources}
            embeddingsData={embeddingsData}
            onBack={handleBackToSources}
          />
        )}
      </div>
    </div>
  );
}